from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app.services.media_service import MediaService

def upload_media():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    # Optional: Validate file type here
    
    result, error = MediaService.upload_file(file)
    
    if error:
        return jsonify({'error': error}), 500
        
    return jsonify({
        'url': result.get('secure_url'),
        'public_id': result.get('public_id'),
        'format': result.get('format'),
        'resource_type': result.get('resource_type')
    }), 201
