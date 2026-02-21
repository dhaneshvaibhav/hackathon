from app.extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON

class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)
    poster_url = db.Column(db.String(255), nullable=True)
    event_date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255), nullable=True)
    fee = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='upcoming')  # upcoming, ongoing, completed, cancelled
    meta_data = db.Column(JSON, nullable=True, default={})
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    club = db.relationship('Club', backref=db.backref('events', lazy=True))

    def to_dict(self):
        """Converts event object to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'club_id': self.club_id,
            'poster_url': self.poster_url,
            'event_date': self.event_date.isoformat(),
            'location': self.location,
            'fee': self.fee,
            'status': self.status,
            'meta_data': self.meta_data,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<Event {self.title}>'
