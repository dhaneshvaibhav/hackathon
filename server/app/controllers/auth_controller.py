from flask import request, jsonify
from app.services.auth_service import AuthService

def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
        
    user, error = AuthService.register_user(data)
    if error:
        return jsonify({'error': error}), 400
        
    return jsonify({'message': 'User created successfully', 'user': user.to_dict()}), 201

def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
        
    result, error = AuthService.login_user(data)
    if error:
        return jsonify({'error': error}), 401
        
    return jsonify(result), 200
