from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.announcement_controller import (
    create_announcement,
    get_event_announcements,
    get_all_announcements,
    update_announcement,
    delete_announcement
)

announcement_bp = Blueprint('announcement', __name__)

# Public: Get all announcements
@announcement_bp.route('/', methods=['GET'])
def get_all():
    return get_all_announcements()

# Public: Get announcements for an event
@announcement_bp.route('/event/<int:event_id>', methods=['GET'])
def get_announcements(event_id):
    return get_event_announcements(event_id)

# Protected: Create announcement (Only club owner)
@announcement_bp.route('/', methods=['POST'])
@jwt_required()
def create():
    return create_announcement()

# Protected: Update announcement (Only club owner)
@announcement_bp.route('/<int:announcement_id>', methods=['PUT'])
@jwt_required()
def update(announcement_id):
    return update_announcement(announcement_id)

# Protected: Delete announcement (Only club owner)
@announcement_bp.route('/<int:announcement_id>', methods=['DELETE'])
@jwt_required()
def delete(announcement_id):
    return delete_announcement(announcement_id)
