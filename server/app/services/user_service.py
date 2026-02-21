from app.models.user import User
from app.extensions import db

class UserService:
    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def get_all_users():
        return User.query.all()

    @staticmethod
    def update_user(user_id, data):
        user = User.query.get(user_id)
        if not user:
            return None, "User not found"

        # Update fields if provided
        if 'name' in data:
            user.name = data['name']
        if 'bio' in data:
            user.bio = data['bio']
        if 'social_media' in data:
            user.social_media = data['social_media']
            
        # Commit changes
        try:
            db.session.commit()
            return user, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def delete_user(user_id):
        user = User.query.get(user_id)
        if not user:
            return None, "User not found"

        try:
            db.session.delete(user)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
