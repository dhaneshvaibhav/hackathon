# Backend Architecture & Contribution Guidelines

This project follows a strict **Routes -> Controllers -> Services -> Utils** architecture pattern to ensure scalability, maintainability, and separation of concerns.

## 🏗 Project Structure

```
server/
├── app/
│   ├── __init__.py          # Application Factory (create_app), Extensions, Blueprints
│   ├── config.py            # Environment Configuration (Dev, Prod, Test)
│   ├── extensions.py        # Extensions Initialization (db, cors, jwt, migrate)
│   ├── models/              # Database Models (SQLAlchemy)
│   │   ├── user.py          # User Model
│   │   ├── club.py          # Club Model
│   │   └── event.py         # Event Model
│   ├── routes/              # API Route Definitions (Blueprints)
    │   │   ├── auth.py          # Authentication Routes
    │   │   ├── user.py          # User Management Routes
    │   │   ├── club.py          # Club Management Routes
    │   │   ├── event.py         # Event Management Routes
    │   │   └── main.py          # General Routes
    │   ├── controllers/         # Request Handling & Validation
    │   │   ├── auth_controller.py
    │   │   ├── user_controller.py
    │   │   ├── club_controller.py
    │   │   ├── event_controller.py
    │   │   └── main_controller.py
    │   ├── services/            # Core Business Logic & DB Interactions
    │   │   ├── auth_service.py
    │   │   ├── user_service.py
    │   │   ├── club_service.py
    │   │   ├── event_service.py
    │   │   └── main_service.py
│   └── utils/               # Helper Functions
│       └── auth_utils.py    # Password Hashing, Token Generation
├── migrations/              # Database Migrations (Alembic)
├── run.py                   # Application Entry Point
├── .env                     # Environment Variables (Git-ignored)
└── requirements.txt         # Dependencies
```

## 🚀 Architectural Layers

### 1. **Routes (`app/routes/`)**
- **Purpose**: Define API endpoints and HTTP methods.
- **Responsibility**: Delegate request handling to the appropriate **Controller**.
- **Rules**:
  - NO business logic.
  - NO database queries.
  - ONLY calls Controller functions.
- **Example**:
  ```python
  @user_bp.route('/me', methods=['GET'])
  @jwt_required()
  def get_profile():
      return get_current_user_profile()
  ```

### 2. **Controllers (`app/controllers/`)**
- **Purpose**: Orchestrate the request/response flow.
- **Responsibility**:
  - Parse request data (JSON, args).
  - Validate input.
  - Call **Service** methods.
  - Handle exceptions and format error responses.
  - Return JSON responses with appropriate HTTP status codes.
- **Rules**:
  - NO direct database queries.
  - Keep it thin; delegate heavy lifting to Services.
- **Example**:
  ```python
  def register():
      data = request.get_json()
      user, error = AuthService.register_user(data)
      if error:
          return jsonify({'error': error}), 400
      return jsonify({'user': user.to_dict()}), 201
  ```

### 3. **Services (`app/services/`)**
- **Purpose**: Encapsulate business logic and data persistence.
- **Responsibility**:
  - Interact with the database (Models).
  - Perform calculations or complex operations.
  - Handle external API calls.
- **Rules**:
  - NO direct dependency on Flask `request` or `response` objects (keep it framework-agnostic where possible).
  - Return raw data or objects, NOT JSON responses.
- **Example**:
  ```python
  class AuthService:
      @staticmethod
      def register_user(data):
          if User.query.filter_by(email=data['email']).first():
              return None, "User already exists"
          
          hashed_password = hash_password(data['password'])
          new_user = User(email=data['email'], password_hash=hashed_password)
          db.session.add(new_user)
          db.session.commit()
          return new_user, None
  ```

### 4. **Utils (`app/utils/`)**
- **Purpose**: Reusable helper functions.
- **Example**: Password hashing, JWT token generation.
- **Code**:
  ```python
  def hash_password(password):
      return generate_password_hash(password)
  ```

---

## 🛠 Workflow for New Features
1. **Model**: Define the database model in `app/models/`.
2. **Service**: Create a service class in `app/services/` with business logic.
3. **Controller**: Create a controller function in `app/controllers/` to handle input/output.
4. **Route**: Define the route in `app/routes/` and link it to the controller.
5. **Register**: Register the new blueprint in `app/__init__.py` if creating a new route file.

## ⚠️ Important Rules
1. **Migrations**: Always run `flask db migrate` and `flask db upgrade` after modifying models.
2. **Environment Variables**: Never commit `.env` files.
3. **Dependency Management**: Update `requirements.txt` when installing new packages.
