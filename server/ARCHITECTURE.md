# Backend Architecture & Contribution Guidelines

This project follows a strict **Routes -> Controllers -> Services -> Utils** architecture pattern to ensure scalability, maintainability, and separation of concerns.

## 🏗 Project Structure

```
server/
├── app/
│   ├── __init__.py          # Application Factory (create_app)
│   ├── config.py            # Environment Configuration (Dev, Prod, Test)
│   ├── extensions.py        # Extensions Initialization (db, cors, etc.)
│   ├── models/              # Database Models (SQLAlchemy)
│   ├── routes/              # API Route Definitions (Blueprints)
│   ├── controllers/         # Request Handling & Validation
│   ├── services/            # Core Business Logic & DB Interactions
│   └── utils/               # Helper Functions
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
  @user_bp.route('/users', methods=['POST'])
  def create_user():
      return user_controller.create_user()
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
  def create_user():
      data = request.get_json()
      if not data.get('email'):
          return jsonify({'error': 'Email required'}), 400
      
      user, error = UserService.create(data)
      if error:
          return jsonify({'error': error}), 400
          
      return jsonify(user.to_dict()), 201
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
  class UserService:
      @staticmethod
      def create(data):
          if User.query.filter_by(email=data['email']).first():
              return None, "User already exists"
          
          new_user = User(email=data['email'])
          db.session.add(new_user)
          db.session.commit()
          return new_user, None
  ```

### 4. **Utils (`app/utils/`)**
- **Purpose**: Reusable helper functions.
- **Example**: Date formatting, token generation, custom validators.

---

## 🛠 Workflow for New Features
1. **Model**: Define the database model in `app/models/`.
2. **Service**: Create a service class in `app/services/` with business logic.
3. **Controller**: Create a controller function in `app/controllers/` to handle input/output.
4. **Route**: Define the route in `app/routes/` and link it to the controller.
5. **Register**: Register the new blueprint in `app/__init__.py` if creating a new route file.

## ⚠️ Important Rules
- **Circular Imports**: Avoid them by using `app/extensions.py` for shared instances like `db`.
- **Environment Variables**: Always use `current_app.config` or `os.getenv` for configuration.
- **Error Handling**: Catch exceptions in Controllers or Services, never let the server crash.

Please adhere to this structure to maintain code quality and consistency.
