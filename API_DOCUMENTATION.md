# API Documentation

Base URL: `http://localhost:5000`

## 🔐 Authentication

### Signup
**Endpoint:** `POST /api/auth/signup`  
**Description:** Registers a new user.

**Request Body:**
```json
{
  "name": "Praneeth",
  "email": "praneeth@college.edu",
  "password": "securePassword123",
  "role": "student" 
}
```
*Note: `role` can be "student" or "club_leader". If "club_leader", `is_admin` is set to true.*

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "Praneeth",
    "email": "praneeth@college.edu",
    "is_admin": false
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Email already exists"
}
```

### Login
**Endpoint:** `POST /api/auth/login`  
**Description:** Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "praneeth@college.edu",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Praneeth",
    "email": "praneeth@college.edu",
    "is_admin": false,
    "bio": null,
    "social_media": {}
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

---

## 👤 Users

### Get Current User Profile
**Endpoint:** `GET /api/users/me`  
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Praneeth",
  "email": "praneeth@college.edu",
  "is_admin": false,
  "bio": "CS Student | Hackathon Enthusiast",
  "social_media": {
    "github": "https://github.com/praneeth",
    "linkedin": "https://linkedin.com/in/praneeth"
  },
  "created_at": "2023-10-27T10:00:00Z"
}
```

### Update Profile
**Endpoint:** `PUT /api/users/me`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bio": "Updated bio...",
  "social_media": {
    "github": "https://github.com/new-handle",
    "instagram": "https://instagram.com/new-handle"
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "Praneeth",
    "email": "praneeth@college.edu",
    "bio": "Updated bio...",
    "social_media": {
      "github": "https://github.com/new-handle",
      "instagram": "https://instagram.com/new-handle"
    }
  }
}
```

### Delete Account
**Endpoint:** `DELETE /api/users/me`  
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

## 🏆 Clubs (Proposed)

### Get All Clubs
**Endpoint:** `GET /api/clubs`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Coding Club",
    "description": "A community for coders.",
    "logo_url": "https://example.com/logo.png",
    "category": "Tech",
    "owner_id": 5
  },
  {
    "id": 2,
    "name": "Dance Club",
    "description": "Express yourself through dance.",
    "logo_url": null,
    "category": "Arts",
    "owner_id": 8
  }
]
```

### Get Club Details
**Endpoint:** `GET /api/clubs/:id`

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Coding Club",
  "description": "A community for coders.",
  "logo_url": "https://example.com/logo.png",
  "category": "Tech",
  "owner_id": 5,
  "members": [
    { "user_id": 10, "role": "member" },
    { "user_id": 12, "role": "treasurer" }
  ],
  "created_at": "2023-09-01T12:00:00Z"
}
```

### Create Club (Protected)
**Endpoint:** `POST /api/clubs`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "AI Society",
  "description": "Exploring Artificial Intelligence.",
  "category": "Tech",
  "logo_url": "https://example.com/ai-logo.png"
}
```

**Response (201 Created):**
```json
{
  "message": "Club created successfully",
  "club": {
    "id": 3,
    "name": "AI Society",
    "owner_id": 1
  }
}
```

---

## 📅 Events (Proposed)

### Get All Events
**Endpoint:** `GET /api/events`

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "title": "Tech Talk: Future of AI",
    "description": "Join us for a session on AI trends.",
    "club_id": 1,
    "poster_url": "https://example.com/talk.jpg",
    "event_date": "2024-04-10T14:00:00Z",
    "location": "Room 303",
    "fee": 5.00,
    "status": "upcoming",
    "meta_data": {
      "speaker": "Dr. Smith",
      "registration_link": "https://forms.gle/..."
    }
  }
]
```

### Get Event Details
**Endpoint:** `GET /api/events/:id`

**Response (200 OK):**
```json
{
  "id": 2,
  "title": "Tech Talk: Future of AI",
  "description": "Join us for a session on AI trends.",
  "club_id": 1,
  "poster_url": "https://example.com/talk.jpg",
  "event_date": "2024-04-10T14:00:00Z",
  "location": "Room 303",
  "fee": 5.00,
  "status": "upcoming",
  "meta_data": {
    "speaker": "Dr. Smith",
    "registration_link": "https://forms.gle/..."
  }
}
```

### Create Event (Protected)
**Endpoint:** `POST /api/events`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Tech Talk: Future of AI",
  "description": "Join us for a session on AI trends.",
  "club_id": 1,
  "event_date": "2024-04-10T14:00:00Z",
  "location": "Room 303",
  "fee": 5.00,
  "poster_url": "https://example.com/talk.jpg",
  "meta_data": {
    "speaker": "Dr. Smith",
    "registration_link": "https://forms.gle/..."
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Event created successfully",
  "event": {
    "id": 2,
    "title": "Tech Talk: Future of AI",
    "status": "upcoming"
  }
}
```
