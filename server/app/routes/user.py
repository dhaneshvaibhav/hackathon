from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.user_controller import (
    get_current_user_profile,
    update_current_user_profile,
    delete_current_user_account
)

user_bp = Blueprint('user', __name__)

@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    return get_current_user_profile()

@user_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    return update_current_user_profile()

@user_bp.route('/me', methods=['DELETE'])
@jwt_required()
def delete_account():
    return delete_current_user_account()
