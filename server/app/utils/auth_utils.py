from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password):
    """Hashes the password using Werkzeug's generate_password_hash."""
    return generate_password_hash(password)

def verify_password(stored_hash, password):
    """Verifies the password against the stored hash."""
    return check_password_hash(stored_hash, password)
