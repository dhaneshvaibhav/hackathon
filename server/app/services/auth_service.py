from app.models.user import User
from app.extensions import db
from app.utils.auth_utils import hash_password, verify_password, create_token

class AuthService:
    @staticmethod
    def register_user(data):
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        # Combine first and last name if name is not provided
        name = data.get('name')
        if not name and first_name and last_name:
            name = f"{first_name} {last_name}"
        elif not name:
            name = first_name or last_name or "Unknown"
            
        role = data.get('role', 'student')
        is_admin = (role == 'club_leader')

        if User.query.filter_by(email=email).first():
            return None, "User already exists"

        hashed_password = hash_password(password)
        new_user = User(
            email=email,
            password_hash=hashed_password,
            name=name,
            is_admin=is_admin
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return new_user, None

    @staticmethod
    def login_user(data):
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        
        if not user or not verify_password(user.password_hash, password):
            return None, "Invalid email or password"
            
        access_token = create_token(identity=user.id)
        
        return {
            'token': access_token,
            'user': user.to_dict()
        }, None
