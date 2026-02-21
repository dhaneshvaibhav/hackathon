from app.extensions import db
from sqlalchemy import text

class MainService:
    @staticmethod
    def get_home_message():
        return {"message": "Hello from Flask!"}

    @staticmethod
    def check_db_connection():
        try:
            db.session.execute(text('SELECT 1'))
            return {"message": "Database connection successful!"}, None
        except Exception as e:
            return None, str(e)
