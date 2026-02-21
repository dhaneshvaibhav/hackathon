from flask import jsonify, current_app
from app.services.oauth_service import OAuthService

def get_github_auth_url():
    url, error = OAuthService.get_github_auth_url()
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'url': url}), 200

def handle_github_callback(code, user_id):
    oauth, error = OAuthService.handle_github_callback(code, user_id)
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'message': 'GitHub connected successfully', 'data': oauth.to_dict()}), 200

def disconnect_github(user_id):
    success, error = OAuthService.disconnect_github(user_id)
    if not success:
        return jsonify({'error': error}), 400
    return jsonify({'message': 'GitHub disconnected successfully'}), 200

def get_linkedin_auth_url():
    url, error = OAuthService.get_linkedin_auth_url()
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'url': url}), 200

def handle_linkedin_callback(code, user_id):
    oauth, error = OAuthService.handle_linkedin_callback(code, user_id)
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'message': 'LinkedIn connected successfully', 'data': oauth.to_dict()}), 200

def disconnect_linkedin(user_id):
    success, error = OAuthService.disconnect_linkedin(user_id)
    if not success:
        return jsonify({'error': error}), 400
    return jsonify({'message': 'LinkedIn disconnected successfully'}), 200
