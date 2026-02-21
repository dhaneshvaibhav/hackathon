# Design and Requirements Document

## 1. Database Design

The application currently uses **SQLite** for development, managed via **SQLAlchemy ORM**.

### 1.1. Models

#### **User Model (`users` table)**
Represents a registered user in the system.

| Column Name     | Type          | Constraints                                   | Description                                      |
|-----------------|---------------|-----------------------------------------------|--------------------------------------------------|
| `id`            | Integer       | Primary Key                                   | Unique identifier for the user.                  |
| `name`          | String(100)   | Not Null                                      | Full name of the user.                           |
| `email`         | String(120)   | Unique, Not Null, Index                       | Institutional email address.                     |
| `password_hash` | String(256)   | Not Null                                      | Hashed password (security).                      |
| `is_admin`      | Boolean       | Default: `False`                              | Role flag. `True` for Club Leaders/Admins.       |
| `bio`           | Text          | Nullable                                      | User biography.                                  |
| `social_media`  | JSON          | Nullable, Default: `{}`                       | JSON object for links (GitHub, LinkedIn, etc.).  |
| `created_at`    | DateTime      | Default: `datetime.utcnow`                    | Timestamp of account creation.                   |
| `updated_at`    | DateTime      | Default: `datetime.utcnow`, OnUpdate: `utcnow`| Timestamp of last update.                        |

---

## 2. API Design

The backend is built with **Flask** and exposes a RESTful API.

### 2.1. Base URL
`http://localhost:5000`

### 2.2. Endpoints

#### **General**
- **`GET /`**
  - **Description**: Health check/Home route.
  - **Response**: `200 OK` (Message indicating server is running).

- **`GET /test-db`**
  - **Description**: Verifies database connection.
  - **Response**: `200 OK` (DB status).

#### **Authentication (`/api/auth`)**
- **`POST /api/auth/signup`**
  - **Description**: Register a new user.
  - **Request Body**:
    ```json
    {
      "name": "John Doe",
      "email": "student@college.edu",
      "password": "securepassword",
      "role": "student"  // or "club_leader" (maps to is_admin=True)
    }
    ```
  - **Response**:
    - `201 Created`: User created successfully.
    - `400 Bad Request`: Validation error or user already exists.

- **`POST /api/auth/login`**
  - **Description**: Authenticate a user and receive a JWT.
  - **Request Body**:
    ```json
    {
      "email": "student@college.edu",
      "password": "securepassword"
    }
    ```
  - **Response**:
    - `200 OK`: Returns `{ "token": "jwt_token...", "user": { ... } }`.
    - `401 Unauthorized`: Invalid credentials.

---

## 3. Frontend-Backend Flow

### 3.1. Registration Flow
1.  **User Interface**: User fills out the Signup form on `/signup`.
2.  **Frontend Logic (`Signup.jsx` & `auth.js`)**:
    - Validates email format (institutional email required).
    - Combines `firstName` and `lastName` into `name`.
    - Maps `role` selection to backend expectation.
    - Sends `POST` request to `/api/auth/signup`.
3.  **Backend Logic (`auth_controller.py` & `auth_service.py`)**:
    - Receives data.
    - Checks if email already exists.
    - Hashes the password.
    - Creates `User` record (sets `is_admin=True` if role is 'club_leader').
    - Returns success response.
4.  **Completion**: Frontend redirects user to `/login`.

### 3.2. Login Flow
1.  **User Interface**: User enters credentials on `/login`.
2.  **Frontend Logic**: Sends `POST` request to `/api/auth/login`.
3.  **Backend Logic**:
    - Verifies email and password hash.
    - Generates a **JWT Access Token**.
    - Returns token and user details.
4.  **Completion**: Frontend stores token (implementation pending/in-progress) and redirects to Dashboard.

---

## 4. Requirements

### 4.1. Functional Requirements
- **User Registration**: Users must be able to create an account using an institutional email.
- **User Authentication**: Users must be able to log in securely.
- **Role-Based Access**:
  - **Students**: Regular access to view clubs/events (default).
  - **Club Leaders**: Admin access to manage their clubs (mapped to `is_admin`).
- **Profile Management**: Users have bio and social media links stored (update functionality pending).

### 4.2. Non-Functional Requirements
- **Security**: Passwords must be hashed before storage. API endpoints must be protected via JWT (for future protected routes).
- **Scalability**: Database design supports JSON fields for flexible social media links.
- **Cross-Origin Resource Sharing (CORS)**: Enabled to allow frontend (port 5173) to communicate with backend (port 5000).
- **Environment**:
  - Backend: Python/Flask
  - Frontend: React/Vite
