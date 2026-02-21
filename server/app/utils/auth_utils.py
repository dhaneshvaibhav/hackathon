from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import timedelta

def hash_password(password):
    """Hashes the password using Werkzeug's generate_password_hash."""
    return generate_password_hash(password)

def verify_password(stored_hash, password):
    """Verifies the password against the stored hash."""
    return check_password_hash(stored_hash, password)

def create_token(identity):
    """Creates a JWT access token with a 30-day expiration."""
    expires = timedelta(days=30)
    # Ensure identity is a string as required by flask-jwt-extended
    return create_access_token(identity=str(identity), expires_delta=expires)
