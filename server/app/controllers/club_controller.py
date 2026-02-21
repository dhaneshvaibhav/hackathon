from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.services.club_service import ClubService

def get_all_clubs():
    clubs = ClubService.get_all_clubs()
    return jsonify([c.to_dict() for c in clubs]), 200

def get_managed_clubs():
    current_user_id = get_jwt_identity()
    clubs = ClubService.get_clubs_by_owner(current_user_id)
    return jsonify([c.to_dict() for c in clubs]), 200

def get_club(club_id):
    club = ClubService.get_club_by_id(club_id)
    if not club:
        return jsonify({'error': 'Club not found'}), 404
    return jsonify(club.to_dict()), 200

def create_club():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
        
    club, error = ClubService.create_club(data, current_user_id)
    
    if error:
        return jsonify({'error': error}), 400
        
    return jsonify(club.to_dict()), 201

def update_club(club_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
        
    club, error = ClubService.update_club(club_id, data, current_user_id)
    
    if error:
        status_code = 403 if "Unauthorized" in error else 400
        return jsonify({'error': error}), status_code
        
    return jsonify(club.to_dict()), 200

def delete_club(club_id):
    current_user_id = get_jwt_identity()
    
    success, error = ClubService.delete_club(club_id, current_user_id)
    
    if error:
        status_code = 403 if "Unauthorized" in error else 400
        return jsonify({'error': error}), status_code
        
    return jsonify({'message': 'Club deleted successfully'}), 200

def request_join(club_id):
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    message = data.get('message', '')
    role = data.get('role')

    if not role:
        return jsonify({'error': 'Role is required'}), 400
    
    req, error = ClubService.request_to_join(club_id, current_user_id, message, role)
    
    if error:
        return jsonify({'error': error}), 400
        
    return jsonify(req.to_dict()), 201

def get_requests(club_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is owner of the club
    requests, error = ClubService.get_club_requests(club_id, current_user_id)
    
    if error:
        return jsonify({'error': error}), 403
        
    return jsonify([r.to_dict() for r in requests]), 200

def get_request_details(request_id):
    current_user_id = get_jwt_identity()
    req, error = ClubService.get_request_details(request_id, current_user_id)
    
    if error:
        status_code = 403 if "Unauthorized" in error else 404
        return jsonify({'error': error}), status_code
    
    # Construct detailed response
    user = req.user
    response = req.to_dict()
    response['user_details'] = user.to_dict() # This includes oauth_accounts
    
    return jsonify(response), 200

def handle_request(request_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    status = data.get('status')
    admin_response = data.get('admin_response')
    
    if not status:
        return jsonify({'error': 'Status is required'}), 400

    req, error = ClubService.handle_request(request_id, status, admin_response, current_user_id)
    
    if error:
        return jsonify({'error': error}), 400
        
    return jsonify(req.to_dict()), 200

def get_my_requests():
    current_user_id = get_jwt_identity()
    requests = ClubService.get_user_requests(current_user_id)
    return jsonify([r.to_dict() for r in requests]), 200
