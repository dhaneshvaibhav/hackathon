from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.services.user_service import UserService

def get_current_user_profile():
    current_user_id = get_jwt_identity()
    user = UserService.get_user_by_id(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify(user.to_dict()), 200

def update_current_user_profile():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
        
    user, error = UserService.update_user(current_user_id, data)
    
    if error:
        return jsonify({'error': error}), 400
        
    return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200

def become_creator():
    current_user_id = get_jwt_identity()
    user, error = UserService.promote_to_admin(current_user_id)
    
    if error:
        return jsonify({'error': error}), 400
        
    return jsonify({'message': 'User promoted to creator successfully', 'user': user.to_dict()}), 200

def delete_current_user_account():
    current_user_id = get_jwt_identity()
    
    success, error = UserService.delete_user(current_user_id)
    
    if error:
        return jsonify({'error': error}), 500
        
    if not success:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({'message': 'Account deleted successfully'}), 200
