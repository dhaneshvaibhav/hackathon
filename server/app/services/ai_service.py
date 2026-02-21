import os
import logging
import requests
import base64
from typing import Annotated, Literal, TypedDict, Union, List
from functools import partial

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver

from app.services.club_service import ClubService
from app.services.event_service import EventService
from app.models.oauth import OAuth
from app.models.user import User

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global memory saver for in-memory persistence
memory = MemorySaver()

class AIService:
    @staticmethod
    def get_model():
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found.")
            return None
        
        # Ensure the key is available for langchain-google-genai
        os.environ["GOOGLE_API_KEY"] = api_key
        
        return ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0,
            convert_system_message_to_human=True
        )

    @staticmethod
    def create_tools(user_id: int):
        """Create tools with user_id context bound to them."""
        
        @tool
        def create_club(name: str, description: str, category: str, logo_url: str = "https://via.placeholder.com/150"):
            """
            Create a new club.
            
            Args:
                name: Name of the club
                description: Description of the club
                category: Category of the club
                logo_url: URL of the club logo (optional)
            """
            data = {
                "name": name,
                "description": description,
                "category": category,
                "logo_url": logo_url
            }
            result, error = ClubService.create_club(data, user_id)
            if error:
                return f"Error: {error}"
            return f"Successfully created club: {result.name}"

        @tool
        def create_event(title: str, description: str, club_id: int, start_date: str, end_date: str, fee: float, poster_url: str = "https://via.placeholder.com/300x200"):
            """
            Create a new event for a club.
            
            Args:
                title: Title of the event
                description: Description of the event
                club_id: ID of the club
                start_date: ISO 8601 format date (e.g. 2024-05-20T10:00:00Z)
                end_date: ISO 8601 format date
                fee: Entry fee for the event
                poster_url: URL of the poster image (optional)
            """
            data = {
                "title": title,
                "description": description,
                "club_id": club_id,
                "start_date": start_date,
                "end_date": end_date,
                "fee": fee,
                "poster_url": poster_url
            }
            result, error = EventService.create_event(data, user_id)
            if error:
                return f"Error: {error}"
            return f"Successfully created event: {result.title}"

        @tool
        def get_clubs():
            """Get a list of all clubs."""
            clubs = ClubService.get_all_clubs()
            return [c.to_dict() for c in clubs]

        return [create_club, create_event, get_clubs]

    @staticmethod
    def summarize_text(text: str, max_words: int = 300) -> str:
        """Summarize long text using the AI model."""
        try:
            model = AIService.get_model()
            if not model:
                return text[:2000] + "..."
                
            prompt = f"Summarize the following README content in about {max_words} words, focusing on tech stack, features, and complexity:\n\n{text[:20000]}" # Limit input to avoid excessive tokens
            response = model.invoke(prompt)
            return response.content.strip()
        except Exception as e:
            logger.warning(f"Summarization failed: {e}")
            return text[:2000] + "..."

    @staticmethod
    def get_repo_readme_content(owner: str, repo_name: str, access_token: str):
        """Fetch and decode README content for a repository."""
        try:
            url = f"https://api.github.com/repos/{owner}/{repo_name}/readme"
            headers = {'Authorization': f'token {access_token}'}
            # Added timeout to prevent hanging
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                content = base64.b64decode(data['content']).decode('utf-8')
                
                # If content is very long, summarize it
                if len(content) > 5000:
                    return AIService.summarize_text(content)
                
                return content
            return None
        except Exception as e:
            logger.error(f"Failed to fetch README for {owner}/{repo_name}: {e}")
            return None

    @staticmethod
    def evaluate_profile(user_id: int, criteria: str):
        """
        Evaluate a user profile based on connected platforms and admin criteria.
        """
        user = User.query.get(user_id)
        if not user:
            return None, "User not found"

        oauths = OAuth.query.filter_by(user_id=user_id).all()
        
        profile_data = {
            "name": user.name,
            "email": user.email,
            "github": {},
            "linkedin": {}
        }

        for oauth in oauths:
            meta = oauth.meta_data or {}
            if oauth.provider == 'github':
                # Process repositories to get top ones and fetch READMEs
                repos = meta.get('repositories', [])
                # Sort by stargazers_count descending
                sorted_repos = sorted(repos, key=lambda x: x.get('stargazers_count', 0), reverse=True)
                
                enhanced_repos = []
                readme_count = 0
                target_readmes = 5
                
                # Iterate through repos until we find enough with READMEs or run out
                processed_repos = set()
                
                for repo in sorted_repos:
                    if readme_count >= target_readmes and len(enhanced_repos) >= 10:
                        break
                        
                    repo_data = repo.copy()
                    if oauth.access_token and readme_count < target_readmes:
                        # Extract owner from html_url or assume user login
                        owner = meta.get('login')
                        repo_name = repo.get('name')
                        readme = AIService.get_repo_readme_content(owner, repo_name, oauth.access_token)
                        if readme:
                            repo_data['readme_summary'] = readme
                            readme_count += 1
                    
                    enhanced_repos.append(repo_data)
                    processed_repos.add(repo.get('name'))
                
                # Ensure we have at least top 10 repos in the list even if some were skipped or reordered (though logic above preserves order)
                # If we have fewer than 10, add more from sorted_repos if not already added
                for repo in sorted_repos:
                    if len(enhanced_repos) >= 10:
                        break
                    if repo.get('name') not in processed_repos:
                        enhanced_repos.append(repo)
                        processed_repos.add(repo.get('name'))

                profile_data['github'] = {
                    "login": meta.get('login'),
                    "bio": meta.get('bio'),
                    "public_repos": meta.get('public_repos'),
                    "followers": meta.get('followers'),
                    "top_repositories_analysis": enhanced_repos,
                    "readme_fetch_count": readme_count
                }
            elif oauth.provider == 'linkedin':
                profile_data['linkedin'] = {
                    "network_size": meta.get('network_size'),
                    "organizations": meta.get('orgs', []),
                    "events": meta.get('events', [])
                }

        model = AIService.get_model()
        if not model:
            return None, "AI Service unavailable"
            
        prompt = f"""
        You are an expert HR and Technical Recruiter AI Agent.
        
        **Task:** Evaluate the following candidate for a specific role/persona based on their connected platform data.
        
        **Target Persona/Criteria:** "{criteria}"
        (e.g., "Complete Tech Guy", "All Rounder", "High Connections", "Event Organizer")
        
        **Candidate Profile Data:**
        {profile_data}
        
        **Evaluation Instructions:**
        1. Analyze the candidate's GitHub data. 
           - **CRITICAL:** I have fetched the README.md content for the top 5 repositories (under 'top_repositories_analysis' -> 'readme_summary'). READ THESE carefully to understand the actual code quality, project complexity, and tech stack.
           - Look beyond just names and descriptions.
        2. Analyze the candidate's LinkedIn data (network size, organizations, events) to assess professional reach and leadership.
        3. Compare the profile against the **Target Persona**.
        4. Assign a **Match Score** from 0 to 100.
           - **IMPORTANT:** Be fair but generous. Look for potential, effort, and transferable skills. Do not be overly strict. If the candidate shows relevant projects or enthusiasm, give them a good score.
        5. Provide a concise **Summary** (2-3 sentences) explaining the score. Mention specific projects if relevant.
        6. List 3 **Key Strengths** and 1 **Weakness** relative to the criteria.
        
        **Output Format:**
        Return ONLY a valid JSON object with the following structure:
        {{
            "score": <number>,
            "summary": "<string>",
            "strengths": ["<string>", "<string>", "<string>"],
            "weakness": "<string>"
        }}
        """
        
        try:
            response = model.invoke(prompt)
            content = response.content.strip()
            
            # Simple cleanup for markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            elif content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            import json
            result = json.loads(content.strip())
            return result, None
        except Exception as e:
            logger.error(f"AI Evaluation failed: {e}")
            return None, f"AI Evaluation failed: {str(e)}"

    @staticmethod
    def process_chat(user_input: str, user_id: str):
        try:
            model = AIService.get_model()
            if not model:
                return {
                    "response": "AI is not configured. Please set GEMINI_API_KEY.",
                    "action": "error"
                }

            # Convert user_id to int/str consistency
            user_id_str = str(user_id)
            
            # Create tools with user context
            tools = AIService.create_tools(user_id)
            
            # Bind tools to model
            model_with_tools = model.bind_tools(tools)

            # Define graph state
            class State(TypedDict):
                messages: Annotated[list, add_messages]

            # Define graph nodes
            def chatbot(state: State):
                logger.info(f"Processing messages count: {len(state['messages'])}")
                return {"messages": [model_with_tools.invoke(state["messages"])]}

            # Build graph
            graph_builder = StateGraph(State)
            graph_builder.add_node("chatbot", chatbot)
            
            tool_node = ToolNode(tools)
            graph_builder.add_node("tools", tool_node)
            
            graph_builder.add_conditional_edges(
                "chatbot",
                tools_condition,
            )
            graph_builder.add_edge("tools", "chatbot")
            graph_builder.add_edge(START, "chatbot")
            
            # Compile graph with memory
            graph = graph_builder.compile(checkpointer=memory)
            
            # Config for this conversation thread
            config = {"configurable": {"thread_id": user_id_str}}
            
            # Run graph
            # We only pass the new message; history is loaded from memory
            events = graph.invoke(
                {"messages": [HumanMessage(content=user_input)]},
                config=config
            )
            
            # Get the final response
            last_message = events["messages"][-1]
            
            response_content = last_message.content
            
            # Ensure response_content is a string
            if isinstance(response_content, list):
                # Handle list of content blocks (e.g. text + tool_use)
                text_parts = []
                for block in response_content:
                    if isinstance(block, str):
                        text_parts.append(block)
                    elif isinstance(block, dict) and "text" in block:
                        text_parts.append(block["text"])
                response_content = " ".join(text_parts)
            elif isinstance(response_content, dict):
                # Handle dict content (e.g. {text: "...", type: "..."})
                response_content = response_content.get("text", str(response_content))
            
            if isinstance(last_message, AIMessage):
                return {"response": str(response_content), "action": "chat"}
            else:
                # Should not happen if graph ends at chatbot, but fallback
                return {"response": str(response_content), "action": "chat"}

        except Exception as e:
            logger.error(f"AI Error: {str(e)}", exc_info=True)
            return {"response": f"AI Error: {str(e)}", "action": "error"}
