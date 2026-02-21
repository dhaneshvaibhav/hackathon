from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.services.event_service import EventService

class EventController:
    @staticmethod
    def create_event():
        """
        Create a new event.
        """
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        user_id = get_jwt_identity()
        
        event, error = EventService.create_event(data, user_id)
        if error:
            status_code = 403 if "Unauthorized" in error else 400
            return jsonify({"error": error}), status_code
        
        return jsonify({
            "message": "Event created successfully",
            "event": event.to_dict()
        }), 201

    @staticmethod
    def get_all_events():
        """
        Retrieve all events.
        """
        events = EventService.get_all_events()
        return jsonify([event.to_dict() for event in events]), 200

    @staticmethod
    def get_event(event_id):
        """
        Retrieve a single event by ID.
        """
        event = EventService.get_event_by_id(event_id)
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        return jsonify(event.to_dict()), 200

    @staticmethod
    def update_event(event_id):
        """
        Update an existing event.
        """
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        user_id = get_jwt_identity()

        event, error = EventService.update_event(event_id, data, user_id)
        if error:
            status_code = 403 if "Unauthorized" in error else 400
            return jsonify({"error": error}), status_code
        if not event:
            return jsonify({"error": "Event not found"}), 404

        return jsonify({
            "message": "Event updated successfully",
            "event": event.to_dict()
        }), 200

    @staticmethod
    def delete_event(event_id):
        """
        Delete an event.
        """
        user_id = get_jwt_identity()
        success, error = EventService.delete_event(event_id, user_id)
        if not success:
            if error == "Event not found":
                return jsonify({"error": "Event not found"}), 404
            status_code = 403 if "Unauthorized" in error else 500
            return jsonify({"error": error}), status_code
        
        return jsonify({"message": "Event deleted successfully"}), 200
