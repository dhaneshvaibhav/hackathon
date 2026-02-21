from app.models.event import Event
from app.extensions import db
from datetime import datetime

class EventService:
    @staticmethod
    def create_event(data):
        """
        Create a new event.
        :param data: Dictionary containing event data
        :return: Created Event object or None, Error message
        """
        try:
            # Validate required fields
            required_fields = ['title', 'description', 'club_id', 'poster_url', 'start_date', 'end_date', 'fee']
            for field in required_fields:
                if field not in data:
                    return None, f"Missing required field: {field}"

            # Parse start_date and end_date
            try:
                start_date = data['start_date']
                if isinstance(start_date, str):
                    start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                
                end_date = data['end_date']
                if isinstance(end_date, str):
                    end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            except ValueError:
                return None, "Invalid date format. Use ISO 8601 format."

            # Determine status based on dates
            now = datetime.utcnow()
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
    def update_event(event_id, data):
        """
        Update an existing event.
        :param event_id: ID of the event to update
        :param data: Dictionary containing updated data
        :return: Updated Event object or None, Error message
        """
        event = Event.query.get(event_id)
        if not event:
            return None, "Event not found"

        try:
            if 'title' in data:
                event.title = data['title']
            if 'description' in data:
                event.description = data['description']
            if 'poster_url' in data:
                event.poster_url = data['poster_url']
            
            # Handle dates
            start_date = event.start_date
            end_date = event.end_date
            
            if 'start_date' in data:
                try:
                    start_date = data['start_date']
                    if isinstance(start_date, str):
                        start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                    event.start_date = start_date
                except ValueError:
                    return None, "Invalid date format for start_date. Use ISO 8601 format."
            
            if 'end_date' in data:
                try:
                    end_date = data['end_date']
                    if isinstance(end_date, str):
                        end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                    event.end_date = end_date
                except ValueError:
                    return None, "Invalid date format for end_date. Use ISO 8601 format."

            # Update status based on new/existing dates
            now = datetime.utcnow()
            if now < start_date:
                event.status = 'upcoming'
            elif start_date <= now <= end_date:
                event.status = 'ongoing'
            else:
                event.status = 'completed'

            if 'location' in data:
                event.location = data['location']
            if 'fee' in data:
                event.fee = data['fee']
            if 'meta_data' in data:
                event.meta_data = data['meta_data']
            
            db.session.commit()
            return event, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def delete_event(event_id):
        """
        Delete an event.
        :param event_id: ID of the event to delete
        :return: True if deleted, False, Error message otherwise
        """
        event = Event.query.get(event_id)
        if not event:
            return False, "Event not found"

        try:
            db.session.delete(event)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
