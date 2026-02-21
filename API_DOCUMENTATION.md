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

---

## 🔗 OAuth

### GitHub
**Connect:** `GET /api/oauth/github/connect` (Protected)  
Returns the GitHub authorization URL.

**Callback:** `POST /api/oauth/github/callback` (Protected)  
Exchanges the authorization code for an access token.
**Body:** `{"code": "..."}`

**Disconnect:** `DELETE /api/oauth/github/disconnect` (Protected)  
Disconnects the linked GitHub account.

### LinkedIn
**Connect:** `GET /api/oauth/linkedin/connect` (Protected)  
Returns the LinkedIn authorization URL. Scopes include: `openid`, `profile`, `email`, `w_member_social`, `r_organization_social`, `r_1st_connections_size`, `r_events`, etc.

**Callback:** `POST /api/oauth/linkedin/callback` (Protected)  
Exchanges the authorization code for an access token and fetches profile, network size, organizations, and events.
**Body:** `{"code": "..."}`

**Disconnect:** `DELETE /api/oauth/linkedin/disconnect` (Protected)  
Disconnects the linked LinkedIn account.

---

## 🤖 AI Chat Assistant

### Send Message
**Endpoint:** `POST /api/chat/`  
**Headers:** `Authorization: Bearer <token>`  
**Description:** Interacts with the AI assistant (powered by Gemini) to manage clubs and events.

**Request Body:**
```json
{
  "message": "Create a new Tech club called AI Enthusiasts"
}
```

**Response (200 OK):**
```json
{
  "response": "Successfully created club: AI Enthusiasts",
  "action": "chat"
}
```

**Available Tools:**
- `create_club`: Create a new club.
- `create_event`: Create a new event for a club.
- `get_clubs`: List all clubs.

---

## 👤 Users

### Get Current User Profile
**Endpoint:** `GET /api/users/me`  
**Headers:** `Authorization: Bearer <token>`

### Update Profile
**Endpoint:** `PUT /api/users/me`  
**Headers:** `Authorization: Bearer <token>`  
**Body:** JSON object with fields to update (`name`, `bio`, etc.).

### Become Creator
**Endpoint:** `POST /api/users/me/become-creator`  
**Headers:** `Authorization: Bearer <token>`  
Promotes the user to a club creator/admin role.

### Delete Account
**Endpoint:** `DELETE /api/users/me`  
**Headers:** `Authorization: Bearer <token>`

---

## � Clubs

### Get All Clubs
**Endpoint:** `GET /api/clubs/`

### Get Managed Clubs
**Endpoint:** `GET /api/clubs/managed`  
**Headers:** `Authorization: Bearer <token>`  
Returns clubs managed by the current user.

### Get Specific Club
**Endpoint:** `GET /api/clubs/<club_id>`

### Create Club
**Endpoint:** `POST /api/clubs/`  
**Headers:** `Authorization: Bearer <token>`  
**Body:**
```json
{
  "name": "AI Club",
  "description": "For AI enthusiasts",
  "category": "Technology",
  "logo_url": "..."
}
```

### Update Club
**Endpoint:** `PUT /api/clubs/<club_id>`  
**Headers:** `Authorization: Bearer <token>`

### Delete Club
**Endpoint:** `DELETE /api/clubs/<club_id>`  
**Headers:** `Authorization: Bearer <token>`

### Join Request
**Endpoint:** `POST /api/clubs/<club_id>/join`  
**Headers:** `Authorization: Bearer <token>`  
**Body:** `{"reason": "I love AI"}`

### Get Club Requests
**Endpoint:** `GET /api/clubs/<club_id>/requests`  
**Headers:** `Authorization: Bearer <token>`  
Returns join requests for a club (Admin only).

### Get Request Details
**Endpoint:** `GET /api/clubs/requests/<request_id>`  
**Headers:** `Authorization: Bearer <token>`

### Handle Request
**Endpoint:** `PUT /api/clubs/requests/<request_id>`  
**Headers:** `Authorization: Bearer <token>`  
**Body:** `{"status": "approved"}` or `{"status": "rejected"}`

### Get Requester's GitHub Repos
**Endpoint:** `GET /api/clubs/requests/<request_id>/github-repos`  
**Headers:** `Authorization: Bearer <token>`  
Fetches public repositories of the requester if GitHub is connected.

### Get My Requests
**Endpoint:** `GET /api/clubs/my-requests`  
**Headers:** `Authorization: Bearer <token>`

---

## 📅 Events

### Get All Events
**Endpoint:** `GET /api/events/`

### Create Event
**Endpoint:** `POST /api/events/`  
**Headers:** `Authorization: Bearer <token>`  
**Body:**
```json
{
  "title": "Hackathon 2024",
  "description": "Annual hackathon",
  "club_id": 1,
  "start_date": "2024-05-20T10:00:00Z",
  "end_date": "2024-05-21T10:00:00Z",
  "fee": 10.0,
  "poster_url": "..."
}
```

### Get Event
**Endpoint:** `GET /api/events/<event_id>`

### Update Event
**Endpoint:** `PUT /api/events/<event_id>`  
**Headers:** `Authorization: Bearer <token>`

### Delete Event
**Endpoint:** `DELETE /api/events/<event_id>`  
**Headers:** `Authorization: Bearer <token>`

---

## 📢 Announcements

### Get All Announcements
**Endpoint:** `GET /api/announcements/`

### Get Event Announcements
**Endpoint:** `GET /api/announcements/event/<event_id>`

### Create Announcement
**Endpoint:** `POST /api/announcements/`  
**Headers:** `Authorization: Bearer <token>`  
**Body:**
```json
{
  "title": "Update",
  "content": "Event delayed",
  "event_id": 1
}
```

### Update Announcement
**Endpoint:** `PUT /api/announcements/<announcement_id>`  
**Headers:** `Authorization: Bearer <token>`

### Delete Announcement
**Endpoint:** `DELETE /api/announcements/<announcement_id>`  
**Headers:** `Authorization: Bearer <token>`

---

## 📤 Upload

### Upload Media
**Endpoint:** `POST /api/upload/`  
**Headers:** `Authorization: Bearer <token>`  
**Body:** `FormData` with file field `file`.
