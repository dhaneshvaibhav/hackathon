from app.models.event import Event
from app.models.club import Club
from app.models.user import User
from app.extensions import db
from datetime import datetime, timezone

class EventService:
    @staticmethod
    def create_event(data, user_id):
        """
        Create a new event.
        :param data: Dictionary containing event data
        :param user_id: ID of the user creating the event
        :return: Created Event object or None, Error message
        """
        try:
            # Validate required fields
            required_fields = ['title', 'description', 'club_id', 'poster_url', 'start_date', 'end_date', 'fee']
            for field in required_fields:
                if field not in data:
                    return None, f"Missing required field: {field}"

            # Validate Club Ownership
            club_id = data.get('club_id')
            club = Club.query.get(club_id)
            if not club:
                return None, "Club not found"

            if club.owner_id != user_id:
                user = User.query.get(user_id)
                if not user or not user.is_admin:
                    return None, "Unauthorized: Only club owner or admin can create events"

            # Parse start_date and end_date
            try:
                # Helper to parse and ensure offset-naive UTC
                def parse_to_naive_utc(date_str):
                    if not isinstance(date_str, str):
                        return date_str
                    # Parse ISO string
                    dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    # Convert to UTC if aware, then make naive
                    if dt.tzinfo is not None:
                        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
                    return dt

                start_date = parse_to_naive_utc(data['start_date'])
                end_date = parse_to_naive_utc(data['end_date'])

            except ValueError:
                return None, "Invalid date format. Use ISO 8601 format."

            # Determine status based on dates
            now = datetime.now(timezone.utc).replace(tzinfo=None)
            if now < start_date:
                status = 'upcoming'
            elif start_date <= now <= end_date:
                status = 'ongoing'
            else:
                status = 'completed'

            new_event = Event(
                title=data['title'],
                description=data['description'],
                club_id=data['club_id'],
                poster_url=data['poster_url'],
                start_date=start_date,
                end_date=end_date,
                location=data.get('location'),
                link=data.get('link'),
                fee=data['fee'],
                status=status,
                meta_data=data.get('meta_data', {})
            )

            db.session.add(new_event)
            db.session.commit()
            return new_event, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def get_all_events():
        """
        Retrieve all events.
        :return: List of Event objects
        """
        return Event.query.all()

    @staticmethod
    def get_event_by_id(event_id):
        """
        Retrieve a single event by ID.
        :param event_id: ID of the event
        :return: Event object or None
        """
        return Event.query.get(event_id)

    @staticmethod
    def search_events(query):
        """
        Search events by title, description, or location.
        :param query: Search query string
        :return: List of Event objects
        """
        search = f"%{query}%"
        return Event.query.filter(
            (Event.title.ilike(search)) |
            (Event.description.ilike(search)) |
            (Event.location.ilike(search))
        ).all()

    @staticmethod
    def update_event(event_id, data, user_id):
        """
        Update an existing event.
        :param event_id: ID of the event to update
        :param data: Dictionary containing updated data
        :param user_id: ID of the user requesting update
        :return: Updated Event object or None, Error message
        """
        event = Event.query.get(event_id)
        if not event:
            return None, "Event not found"

        # Check authorization
        club = Club.query.get(event.club_id)
        if club.owner_id != user_id:
            user = User.query.get(user_id)
            if not user or not user.is_admin:
                return None, "Unauthorized: Only club owner or admin can update events"

        try:
            if 'title' in data:
                event.title = data['title']
            if 'description' in data:
                event.description = data['description']
            if 'poster_url' in data:
                event.poster_url = data['poster_url']
            if 'location' in data:
                event.location = data['location']
            if 'link' in data:
                event.link = data['link']
            if 'fee' in data:
                event.fee = data['fee']
            if 'meta_data' in data:
                event.meta_data = data['meta_data']
            
            # Handle date updates if provided
            if 'start_date' in data or 'end_date' in data:
                def parse_to_naive_utc(date_str):
                    if not isinstance(date_str, str):
                        return date_str
                    dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    if dt.tzinfo is not None:
                        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
                    return dt

                if 'start_date' in data:
                    event.start_date = parse_to_naive_utc(data['start_date'])
                if 'end_date' in data:
                    event.end_date = parse_to_naive_utc(data['end_date'])
                
                # Update status
                now = datetime.now(timezone.utc).replace(tzinfo=None)
                if now < event.start_date:
                    event.status = 'upcoming'
                elif event.start_date <= now <= event.end_date:
                    event.status = 'ongoing'
                else:
                    event.status = 'completed'

            db.session.commit()
            return event, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def delete_event(event_id, user_id):
        """
        Delete an event.
        :param event_id: ID of the event to delete
        :param user_id: ID of the user requesting deletion
        :return: Boolean success, Error message
        """
        event = Event.query.get(event_id)
        if not event:
            return False, "Event not found"

        # Check authorization
        club = Club.query.get(event.club_id)
        # If club is deleted, club might be None?
        # Assuming cascade delete handles that, but here event exists so club should exist.
        if club and club.owner_id != user_id:
            user = User.query.get(user_id)
            if not user or not user.is_admin:
                return False, "Unauthorized: Only club owner or admin can delete events"

        try:
            db.session.delete(event)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
