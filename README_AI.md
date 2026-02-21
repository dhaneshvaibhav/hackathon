# AI Chat Assistant Integration

This project now includes an AI-powered Chat Assistant that allows users to manage clubs and events using natural language.

## Setup

1.  **Get a Gemini API Key**:
    *   Go to [Google AI Studio](https://aistudio.google.com/).
    *   Create an API key.

2.  **Configure Environment**:
    *   Open `server/.env`.
    *   Find `GEMINI_API_KEY=your_gemini_api_key_here`.
    *   Replace `your_gemini_api_key_here` with your actual API key.

3.  **Restart Server**:
    *   If the server is running, stop it (Ctrl+C) and start it again:
        ```bash
        cd server
        python run.py
        ```

## Features

The AI Assistant can help you with:

*   **Creating Clubs**: "Create a new Tech club called AI Enthusiasts."
*   **Creating Events**: "Schedule a Hackathon for the AI Enthusiasts club on 2024-05-20."
*   **Listing Clubs**: "Show me all clubs."

## Architecture

*   **Frontend**: A floating chat widget (`ChatAssistant.jsx`) communicates with the backend.
*   **Backend**: 
    *   `chat_controller.py`: Handles chat requests.
    *   `ai_service.py`: Uses Google Gemini to interpret user intent and call existing services (`ClubService`, `EventService`).
    *   **Tool Calling**: The AI uses function calling to execute actions safely on your behalf.
