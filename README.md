# Club Hub - Hackathon Project

A comprehensive web application for managing college clubs and communities. This project connects students with clubs and allows club leaders to manage their organizations effectively.

## 🚀 Tech Stack

### Frontend
- **React 19** (via Vite)
- **React Router DOM v7** for routing
- **Lucide React** for icons
- **CSS3** for styling

### Backend
- **Python 3**
- **Flask** (Web Framework)
- **SQLAlchemy** (ORM) & **SQLite** (Database)
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
│   │   ├── models/         # Database models (User, etc.)
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── ...
│   ├── migrations/         # DB migration scripts
│   ├── run.py              # Entry point
│   └── requirements.txt    # Python dependencies
│
└── README.md               # This file
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.x

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

---

## ✨ Features Implemented So Far
- **Authentication System**:
  - Sign Up (with institutional email validation)
  - Login (JWT-based)
- **Role Management**:
  - Support for Students and Club Leaders.
- **Database Integration**:
  - User model with profile fields (bio, social links).

## 📝 API Documentation
See [DESIGN_AND_REQUIREMENTS.md](./DESIGN_AND_REQUIREMENTS.md) for detailed design, API endpoints, and data flow.
