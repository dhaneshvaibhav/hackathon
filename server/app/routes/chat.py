from flask import Blueprint
from app.controllers.chat_controller import chat
from flask_jwt_extended import jwt_required

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/', methods=['POST'])
@jwt_required()
def chat_route():
    return chat()
