from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.upload_controller import upload_media

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/', methods=['POST'])
@jwt_required()
def upload():
    from flask import request
    # Debug print
    print("Files in request:", request.files)
    print("Headers:", request.headers)
    return upload_media()
