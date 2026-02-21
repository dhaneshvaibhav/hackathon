from app.extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON

class Club(db.Model):
    __tablename__ = 'clubs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    members = db.Column(JSON, nullable=True, default=[])  # List of {user_id, role}
    logo_url = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = db.relationship('User', backref=db.backref('owned_clubs', lazy=True))

    def to_dict(self):
        """Converts club object to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'owner_id': self.owner_id,
            'members': self.members,
            'logo_url': self.logo_url,
            'category': self.category,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<Club {self.name}>'
