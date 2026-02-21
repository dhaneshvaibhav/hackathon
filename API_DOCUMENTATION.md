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

### Become Creator (Promote to Admin)
**Endpoint:** `POST /api/users/me/become-creator`  
**Headers:** `Authorization: Bearer <token>`
**Description:** Promotes the current user to a club creator/admin role.

**Response (200 OK):**
```json
{
  "message": "User promoted to creator successfully",
  "user": {
    "id": 1,
    "is_admin": true
    // ... other fields
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

## 🏆 Clubs

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

### Get Managed Clubs
**Endpoint:** `GET /api/clubs/managed`  
**Headers:** `Authorization: Bearer <token>`
**Description:** Returns clubs owned/managed by the current user.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Coding Club",
    "owner_id": 5
    // ...
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
    {
      "user_id": 5,
      "role": "owner"
    }
  ],
  "members_details": [
    {
      "user_id": 5,
      "name": "Praneeth",
      "email": "praneeth@college.edu",
      "role": "owner",
      "profile_picture": "https://github.com/..."
    }
  ],
  "events": [
    {
      "id": 2,
      "title": "Tech Talk",
      "start_date": "2024-04-10T14:00:00Z",
      "status": "upcoming",
      "poster_url": "..."
    }
  ]
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
  "id": 3,
  "name": "AI Society",
  "owner_id": 1,
  "description": "Exploring Artificial Intelligence.",
  "category": "Tech",
  "logo_url": "https://example.com/ai-logo.png",
  "members": []
}
```

### Update Club (Protected)
**Endpoint:** `PUT /api/clubs/:id`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "description": "Updated description",
  "logo_url": "https://example.com/new-logo.png"
}
```

**Response (200 OK):**
```json
{
  "id": 3,
  "name": "AI Society",
  "description": "Updated description",
  // ...
}
```

### Delete Club (Protected)
**Endpoint:** `DELETE /api/clubs/:id`  
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "Club deleted successfully"
}
```

### Request to Join Club (Protected)
**Endpoint:** `POST /api/clubs/:id/join`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "I would love to join because...",
  "role": "member"
}
```
*Note: `role` is required and typically "member".*

**Response (201 Created):**
```json
{
  "id": 10,
  "user_id": 5,
  "club_id": 1,
  "status": "pending",
  "message": "I would love to join because...",
  "role": "member"
}
```

### Get Club Join Requests (Protected - Owner Only)
**Endpoint:** `GET /api/clubs/:id/requests`  
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
[
  {
    "id": 10,
    "user_id": 5,
    "club_id": 1,
    "status": "pending",
    "message": "I would love to join because...",
    "created_at": "2024-03-20T10:00:00Z"
  }
]
```

### Get Request Details (Protected - Owner Only)
**Endpoint:** `GET /api/clubs/requests/:id`  
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": 10,
  "user_id": 5,
  "club_id": 1,
  "status": "pending",
  "message": "I would love to join because...",
  "role": "member",
  "created_at": "2024-03-20T10:00:00Z",
  "user_details": {
    "id": 5,
    "name": "Praneeth",
    "email": "praneeth@college.edu",
    "oauth_accounts": [
      {
        "provider": "github",
        "access_token": "..."
      }
    ]
  }
}
```

### Get Request User's GitHub Repos (Protected - Owner Only)
**Endpoint:** `GET /api/clubs/requests/:id/github-repos`  
**Headers:** `Authorization: Bearer <token>`
**Description:** Fetches the GitHub repositories of the user who made the join request, if their account is linked to GitHub.

**Response (200 OK):**
```json
[
  {
    "id": 123456789,
    "name": "hackathon-project",
    "html_url": "https://github.com/praneeth/hackathon-project",
    "description": "A cool project for a hackathon.",
    "stargazers_count": 5,
    "language": "Python"
  }
]
```

### Handle Join Request (Protected - Owner Only)
**Endpoint:** `PUT /api/clubs/requests/:id`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "approved", 
  "admin_response": "Welcome to the club!"
}
```
*Note: `status` can be "approved" or "rejected".*

**Response (200 OK):**
```json
{
  "id": 10,
  "status": "approved",
  "admin_response": "Welcome to the club!",
  // ...
}
```

### Get My Join Requests (Protected)
**Endpoint:** `GET /api/clubs/my-requests`  
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
[
  {
    "id": 10,
    "club_id": 1,
    "status": "pending",
    "message": "I would love to join because...",
    "created_at": "2024-03-20T10:00:00Z"
  }
]
```

---

## 📅 Events

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
    "start_date": "2024-04-10T14:00:00Z",
    "end_date": "2024-04-10T16:00:00Z",
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
  "start_date": "2024-04-10T14:00:00Z",
  "end_date": "2024-04-10T16:00:00Z",
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
  "start_date": "2024-04-10T14:00:00Z",
  "end_date": "2024-04-10T16:00:00Z",
  "location": "Room 303",
  "fee": 5.00,
  "poster_url": "https://example.com/talk.jpg",
  "meta_data": {
    "speaker": "Dr. Smith",
    "registration_link": "https://forms.gle/..."
  }
}
```
*Note: `status` is automatically calculated based on `start_date` and `end_date`.*

**Response (201 Created):**
```json
{
  "message": "Event created successfully",
  "event": {
    "id": 2,
    "title": "Tech Talk: Future of AI",
    "status": "upcoming",
    "start_date": "2024-04-10T14:00:00Z",
    "end_date": "2024-04-10T16:00:00Z"
  }
}
```

### Update Event (Protected)
**Endpoint:** `PUT /api/events/:id`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Tech Talk Title",
  "start_date": "2024-04-11T14:00:00Z",
  "end_date": "2024-04-11T16:00:00Z",
  "meta_data": {
    "speaker": "Dr. Jones",
    "registration_link": "https://new-link.com"
  }
}
```
*Note: `status` is automatically recalculated based on the updated `start_date` and `end_date`.*

**Response (200 OK):**
```json
{
  "message": "Event updated successfully",
  "event": {
    "id": 2,
    "title": "Updated Tech Talk Title",
    "start_date": "2024-04-11T14:00:00Z",
    "end_date": "2024-04-11T16:00:00Z",
    "status": "upcoming",
    "meta_data": {
      "speaker": "Dr. Jones",
      "registration_link": "https://new-link.com"
    }
  }
}
```

### Delete Event (Protected)
**Endpoint:** `DELETE /api/events/:id`  
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "Event deleted successfully"
}
```

---

## 📢 Announcements

### Get All Announcements
**Endpoint:** `GET /api/announcements`
**Description:** Get all announcements.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "event_id": 2,
    "title": "Change of Venue",
    "content": "The event will now be held in Room 101 due to maintenance.",
    "created_at": "2024-04-09T10:00:00Z",
    "updated_at": "2024-04-09T10:00:00Z"
  }
]
```

### Get Event Announcements
**Endpoint:** `GET /api/announcements/event/:event_id`
**Description:** Get all announcements for a specific event.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "event_id": 2,
    "title": "Change of Venue",
    "content": "The event will now be held in Room 101 due to maintenance.",
    "created_at": "2024-04-09T10:00:00Z",
    "updated_at": "2024-04-09T10:00:00Z"
  }
]
```

### Create Announcement (Protected - Owner Only)
**Endpoint:** `POST /api/announcements`
**Headers:** `Authorization: Bearer <token>`
**Description:** Create a new announcement for an event. Must be the owner of the club hosting the event.

**Request Body:**
```json
{
  "event_id": 2,
  "title": "Speaker Delay",
  "content": "The main speaker will be arriving 15 minutes late."
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "event_id": 2,
  "title": "Speaker Delay",
  "content": "The main speaker will be arriving 15 minutes late.",
  "created_at": "2024-04-10T13:45:00Z",
  "updated_at": "2024-04-10T13:45:00Z"
}
```

### Update Announcement (Protected - Owner Only)
**Endpoint:** `PUT /api/announcements/:id`
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Speaker Delay (Updated)",
  "content": "The speaker has arrived, we start in 5 mins."
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "event_id": 2,
  "title": "Speaker Delay (Updated)",
  "content": "The speaker has arrived, we start in 5 mins.",
  "created_at": "2024-04-10T13:45:00Z",
  "updated_at": "2024-04-10T14:00:00Z"
}
```

### Delete Announcement (Protected - Owner Only)
**Endpoint:** `DELETE /api/announcements/:id`
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "Announcement deleted successfully"
}
```

---

## 🔑 OAuth

### Connect GitHub
**Endpoint:** `GET /api/oauth/github/connect`
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "url": "https://github.com/login/oauth/authorize?client_id=..."
}
```

### GitHub Callback
**Endpoint:** `POST /api/oauth/github/callback`
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "code": "auth_code_from_github"
}
```

**Response (200 OK):**
```json
{
  "message": "GitHub connected successfully",
  "data": {
    "provider": "github",
    "provider_user_id": "12345",
    "username": "praneeth",
    "access_token": "gho_..."
  }
}
```

### Disconnect GitHub
**Endpoint:** `DELETE /api/oauth/github/disconnect`
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "GitHub disconnected successfully"
}
```

### Connect LinkedIn
**Endpoint:** `GET /api/oauth/linkedin/connect`
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "url": "https://www.linkedin.com/oauth/v2/authorization?client_id=..."
}
```

### LinkedIn Callback
**Endpoint:** `POST /api/oauth/linkedin/callback`
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "code": "auth_code_from_linkedin"
}
```

**Response (200 OK):**
```json
{
  "message": "LinkedIn connected successfully",
  "data": {
    "provider": "linkedin",
    "provider_user_id": "12345",
    "username": "praneeth",
    "access_token": "AQU..."
  }
}
```

### Disconnect LinkedIn
**Endpoint:** `DELETE /api/oauth/linkedin/disconnect`
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "LinkedIn disconnected successfully"
}
```

---

## 📤 Upload

### Upload Media
**Endpoint:** `POST /api/upload/`
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `file`: The file to upload.

**Response (201 Created):**
```json
{
  "url": "https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg",
  "public_id": "sample",
  "format": "jpg",
  "resource_type": "image"
}
```
