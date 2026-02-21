from flask import Flask
from app.config import config
from app.extensions import db, cors, jwt, migrate

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
   
    # Import models to ensure they are registered with SQLAlchemy
    from app.models.user import User
    from app.models.club import Club
    from app.models.event import Event
    
    # Created Routes
    from app.routes.main import main_bp
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.club import club_bp
    from app.routes.event import event_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(club_bp, url_prefix='/api/clubs')
    app.register_blueprint(event_bp, url_prefix='/api/events')

    # Create tables for development
    with app.app_context():
        from app.models.user import User
        from app.models.club import Club
        from app.models.club_request import ClubRequest
        db.create_all()
    
    return app
