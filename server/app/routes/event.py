from flask import Blueprint
from app.controllers.event_controller import EventController

event_bp = Blueprint('event', __name__)

@event_bp.route('', methods=['POST'])
def create_event():
    return EventController.create_event()

@event_bp.route('', methods=['GET'])
def get_all_events():
    return EventController.get_all_events()

@event_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    return EventController.get_event(event_id)

@event_bp.route('/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    return EventController.update_event(event_id)

@event_bp.route('/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    return EventController.delete_event(event_id)
