from app.models.announcement import Announcement
from app.models.event import Event
from app.models.club import Club
from app.extensions import db

class AnnouncementService:
    @staticmethod
    def create_announcement(data, user_id):
        """
        Create a new announcement for an event.
        Only the club owner (or admin) of the event's club can create announcements.
        """
        event_id = data.get('event_id')
        title = data.get('title')
        content = data.get('content') # Mapped to 'announcement'

        if not event_id or not title or not content:
            return None, "Missing required fields: event_id, title, content"

        event = Event.query.get(event_id)
        if not event:
            return None, "Event not found"

        # Check authorization: User must be the owner of the club hosting the event
        club = Club.query.get(event.club_id)
        if not club:
            return None, "Club not found"
            
        if club.owner_id != int(user_id):
            return None, "Unauthorized: Only the club owner can make announcements for this event"

        announcement = Announcement(
            event_id=event_id,
            title=title,
            content=content
        )

        try:
            db.session.add(announcement)
            db.session.commit()
            return announcement, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def get_announcements_by_event(event_id):
        return Announcement.query.filter_by(event_id=event_id).order_by(Announcement.created_at.desc()).all()

    @staticmethod
    def get_all_announcements():
        return Announcement.query.order_by(Announcement.created_at.desc()).all()

    @staticmethod
    def update_announcement(announcement_id, data, user_id):
        announcement = Announcement.query.get(announcement_id)
        if not announcement:
            return None, "Announcement not found"

        # Authorization check
        event = Event.query.get(announcement.event_id)
        club = Club.query.get(event.club_id)
        if club.owner_id != int(user_id):
            return None, "Unauthorized"

        if 'title' in data:
            announcement.title = data['title']
        if 'content' in data:
            announcement.content = data['content']

        try:
            db.session.commit()
            return announcement, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def delete_announcement(announcement_id, user_id):
        announcement = Announcement.query.get(announcement_id)
        if not announcement:
            return None, "Announcement not found"

        # Authorization check
        event = Event.query.get(announcement.event_id)
        club = Club.query.get(event.club_id)
        if club.owner_id != int(user_id):
            return None, "Unauthorized"

        try:
            db.session.delete(announcement)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
