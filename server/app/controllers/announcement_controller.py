from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.services.announcement_service import AnnouncementService

def create_announcement():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    announcement, error = AnnouncementService.create_announcement(data, current_user_id)
    
    if error:
        status_code = 403 if "Unauthorized" in error else 400
        return jsonify({'error': error}), status_code
        
    return jsonify(announcement.to_dict()), 201

def get_event_announcements(event_id):
    announcements = AnnouncementService.get_announcements_by_event(event_id)
    return jsonify([a.to_dict() for a in announcements]), 200

def get_all_announcements():
    announcements = AnnouncementService.get_all_announcements()
    return jsonify([a.to_dict() for a in announcements]), 200

def update_announcement(announcement_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
        
    announcement, error = AnnouncementService.update_announcement(announcement_id, data, current_user_id)
    
    if error:
        status_code = 403 if "Unauthorized" in error else 400
        return jsonify({'error': error}), status_code
        
    return jsonify(announcement.to_dict()), 200

def delete_announcement(announcement_id):
    current_user_id = get_jwt_identity()
    
    success, error = AnnouncementService.delete_announcement(announcement_id, current_user_id)
    
    if error:
        status_code = 403 if "Unauthorized" in error else 400
        return jsonify({'error': error}), status_code
        
    if not success:
        return jsonify({'error': 'Announcement not found'}), 404
        
    return jsonify({'message': 'Announcement deleted successfully'}), 200
