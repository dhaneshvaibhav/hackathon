from flask import jsonify, request
from app.services.ai_service import AIService
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

def chat():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400

    user_input = data['message']
    
    # Process chat with AI Service
    result = AIService.process_chat(user_input, current_user_id)
    
    return jsonify(result), 200
