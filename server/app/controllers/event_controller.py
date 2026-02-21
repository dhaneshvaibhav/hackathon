from flask import Blueprint, jsonify, request
from app.services.event_service import EventService
from app.models.event import Event

class EventController:
    @staticmethod
    def create_event():
        """
        Create a new event.
        """
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Optional: Add user authorization check here
        
        event, error = EventService.create_event(data)
        if error:
            return jsonify({"error": error}), 400
        
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

        event, error = EventService.update_event(event_id, data)
        if error:
            return jsonify({"error": error}), 400
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
        success, error = EventService.delete_event(event_id)
        if not success:
            if error == "Event not found":
                return jsonify({"error": "Event not found"}), 404
            return jsonify({"error": error}), 500
        
        return jsonify({"message": "Event deleted successfully"}), 200
