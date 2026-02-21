from app.models.user import User
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

class AuthService:
    @staticmethod
    def register_user(data):
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        role = data.get('role', 'student')

        if User.query.filter_by(email=email).first():
            return None, "User already exists"

        hashed_password = generate_password_hash(password)
        new_user = User(
            email=email,
            password_hash=hashed_password,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return new_user, None

    @staticmethod
    def login_user(data):
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return None, "Invalid email or password"
            
        access_token = create_access_token(identity=user.id)
        
        return {
            'token': access_token,
            'user': user.to_dict()
        }, None
