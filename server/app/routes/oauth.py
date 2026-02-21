from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.oauth_service import OAuthService

oauth_bp = Blueprint('oauth', __name__)

@oauth_bp.route('/github/connect', methods=['GET'])
@jwt_required()
def connect_github():
    url, error = OAuthService.get_github_auth_url()
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'url': url}), 200

@oauth_bp.route('/github/callback', methods=['POST'])
@jwt_required()
def github_callback():
    data = request.get_json()
    code = data.get('code')
    if not code:
        return jsonify({'error': 'Code is required'}), 400
    
    current_user_id = get_jwt_identity()
    oauth, error = OAuthService.handle_github_callback(code, current_user_id)
    
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify({
        'message': 'GitHub connected successfully',
        'data': oauth.to_dict()
    }), 200

@oauth_bp.route('/github/disconnect', methods=['DELETE'])
@jwt_required()
def disconnect_github():
    current_user_id = get_jwt_identity()
    success, error = OAuthService.disconnect_github(current_user_id)
    
    if not success:
        return jsonify({'error': error}), 400
    
    return jsonify({'message': 'GitHub disconnected successfully'}), 200

@oauth_bp.route('/linkedin/connect', methods=['GET'])
@jwt_required()
def connect_linkedin():
    url, error = OAuthService.get_linkedin_auth_url()
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'url': url}), 200

@oauth_bp.route('/linkedin/callback', methods=['POST'])
@jwt_required()
def linkedin_callback():
    data = request.get_json()
    code = data.get('code')
    if not code:
        return jsonify({'error': 'Code is required'}), 400
    
    current_user_id = get_jwt_identity()
    oauth, error = OAuthService.handle_linkedin_callback(code, current_user_id)
    
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify({
        'message': 'LinkedIn connected successfully',
        'data': oauth.to_dict()
    }), 200

@oauth_bp.route('/linkedin/disconnect', methods=['DELETE'])
@jwt_required()
def disconnect_linkedin():
    current_user_id = get_jwt_identity()
    success, error = OAuthService.disconnect_linkedin(current_user_id)
    
    if not success:
        return jsonify({'error': error}), 400
    
    return jsonify({'message': 'LinkedIn disconnected successfully'}), 200
