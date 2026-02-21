### Club Hub - Hackathon Project

A comprehensive web application for managing college clubs and communities. This project connects students with clubs and allows club leaders to manage their organizations effectively.

## ✨ Features

- **User Authentication**: Secure signup and login with JWT.
- **Club Management**: Create, update, and delete clubs.
- **Membership System**: Users can request to join clubs; admins can approve/reject requests.
- **Role Management**: Assign roles to members (e.g., President, Member).
- **Event Management**: Create and manage club events with posters and details.
- **GitHub Integration**: Connect GitHub accounts to showcase repositories in join requests.
- **Admin Dashboard**: Dedicated dashboard for club owners to manage requests and events.
- **Interactive UI**: Modern, responsive interface built with React and Lucide icons.
- **Media Upload**: Support for uploading club logos and event posters.

## 🚀 Tech Stack

### Frontend
- **React 19** (via Vite)
- **React Router DOM v7** for routing
- **Lucide React** for icons
- **CSS3** for styling

### Backend
- **Python 3**
- **Flask** (Web Framework)
- **SQLAlchemy** (ORM) & **PostgreSQL (Neon DB)** (Database)
- **Flask-JWT-Extended** (Authentication)
- **Flask-CORS** (Cross-Origin Resource Sharing)
- **Flask-Migrate** (Database Migrations)

---

## 📂 Project Structure

```
hackathon/
├── client/
│   └── kl-hackathon/       # React Frontend
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── pages/      # Route pages (Login, Signup, Dashboard)
│       │   ├── functions/  # API calls and utilities
│       │   └── ...
│       └── ...
│
├── server/
│   ├── app/
│   │   ├── controllers/    # Request handling logic
│   │   ├── models/         # Database models (User, Club, Event)
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── ...
│   ├── migrations/         # DB migration scripts
│   ├── run.py              # Entry point
│   └── requirements.txt    # Python dependencies
│
├── DESIGN_AND_REQUIREMENTS.md # Detailed design doc
├── API_DOCUMENTATION.md    # Complete API Reference
└── README.md               # This file
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.x
- PostgreSQL (or Neon DB account)
- Google Gemini API Key (for AI Assistant)

### 1. Backend Setup
Navigate to the server directory:
```bash
cd server
```

Create a virtual environment (optional but recommended):
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Set up Environment Variables:
Create a `.env` file in the `server/` directory and add your database URL and API keys:
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# OAuth Credentials (Optional)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_REDIRECT_URI=http://localhost:5173/oauth/callback

LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=http://localhost:5173/oauth/callback

# AI Assistant
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the server:
```bash
python run.py
```

### 2. Frontend Setup
Navigate to the client directory:
```bash
cd client/kl-hackathon
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

---

## 🤖 AI Assistant

The project includes an AI-powered Chat Assistant that allows users to manage clubs and events using natural language.

**Features:**
- **Creating Clubs**: "Create a new Tech club called AI Enthusiasts."
- **Creating Events**: "Schedule a Hackathon for the AI Enthusiasts club on 2024-05-20."
- **Listing Clubs**: "Show me all clubs."

To enable this, ensure you have set the `GEMINI_API_KEY` in your `.env` file.

---

## 📚 API Documentation

For detailed API documentation, please refer to [API_DOCUMENTATION.md](API_DOCUMENTATION.md).
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

Run Database Migrations:
```bash
flask db upgrade
```

Run the server:
```bash
python run.py
```
The server will start at `http://localhost:5000`.

### 2. Frontend Setup
Navigate to the client directory:
```bash
cd client/kl-hackathon
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.
