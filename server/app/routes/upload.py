from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.upload_controller import upload_media

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/', methods=['POST'])
@jwt_required()
def upload():
    return upload_media()
