import os
import logging
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global memory saver for in-memory persistence
memory = MemorySaver()

# Hardcoded key fallback (migration to .env recommended)
DEFAULT_API_KEY = "AIzaSyDzEtA8sRaSbowXeljTlu4N4xASHmZh9s8"

class AIService:
    @staticmethod
    def get_model():
        api_key = os.getenv("GEMINI_API_KEY") or DEFAULT_API_KEY
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
