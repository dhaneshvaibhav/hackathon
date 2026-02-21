# Design and Requirements Document

## 1. Database Design

The application uses **PostgreSQL (Neon DB)** for production and development, managed via **SQLAlchemy ORM**.

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

#### **Club Model (`clubs` table)**
Represents a student club or organization.

| Column Name     | Type          | Constraints                                   | Description                                      |
|-----------------|---------------|-----------------------------------------------|--------------------------------------------------|
| `id`            | Integer       | Primary Key                                   | Unique identifier for the club.                  |
| `name`          | String(100)   | Unique, Not Null, Index                       | Name of the club.                                |
| `description`   | Text          | Nullable                                      | Description of the club.                         |
| `owner_id`      | Integer       | Foreign Key (`users.id`), Not Null            | ID of the club owner (User).                     |
| `members`       | JSON          | Nullable, Default: `[]`                       | List of members with roles (JSON).               |
| `logo_url`      | String(255)   | Nullable                                      | URL to the club's logo.                          |
| `category`      | String(50)    | Nullable                                      | Category of the club (e.g., Tech, Arts).         |
| `created_at`    | DateTime      | Default: `datetime.utcnow`                    | Timestamp of creation.                           |
| `updated_at`    | DateTime      | Default: `datetime.utcnow`, OnUpdate: `utcnow`| Timestamp of last update.                        |

#### **Event Model (`events` table)**
Represents an event organized by a club.

| Column Name     | Type          | Constraints                                   | Description                                      |
|-----------------|---------------|-----------------------------------------------|--------------------------------------------------|
| `id`            | Integer       | Primary Key                                   | Unique identifier for the event.                 |
| `title`         | String(100)   | Not Null, Index                               | Title of the event.                              |
| `description`   | Text          | Nullable                                      | Description of the event.                        |
| `club_id`       | Integer       | Foreign Key (`clubs.id`), Not Null            | ID of the organizing club.                       |
| `poster_url`    | String(255)   | Nullable                                      | URL to the event poster.                         |
| `start_date`    | DateTime      | Not Null                                      | Start date and time of the event.                |
| `end_date`      | DateTime      | Not Null                                      | End date and time of the event.                  |
| `location`      | String(255)   | Nullable                                      | Location of the event.                           |
| `fee`           | Float         | Default: `0.0`                                | Entry fee for the event.                         |
| `status`        | String(20)    | Default: `'upcoming'`                         | Status (upcoming, ongoing, completed). Auto-calc.|
| `meta_data`     | JSON          | Nullable, Default: `{}`                       | Flexible data (tags, registration links, etc.).  |
| `created_at`    | DateTime      | Default: `datetime.utcnow`                    | Timestamp of creation.                           |
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

#### **User Management (`/api/users`)**
- **`GET /api/users/me`**
  - **Description**: Get current user profile.
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `200 OK` (User details).

- **`PUT /api/users/me`**
  - **Description**: Update user profile.
  - **Headers**: `Authorization: Bearer <token>`
  - **Request Body**: `{ "bio": "New bio", "social_media": { ... } }`
  - **Response**: `200 OK` (Updated user details).

- **`DELETE /api/users/me`**
  - **Description**: Delete user account.
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `200 OK` (Success message).

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
