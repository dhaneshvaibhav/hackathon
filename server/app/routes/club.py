from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.club_controller import (
    get_all_clubs as get_all_clubs_controller,
    get_managed_clubs as get_managed_clubs_controller,
    get_club as get_club_controller,
    create_club as create_club_controller,
    update_club as update_club_controller,
    delete_club as delete_club_controller,
    request_join as request_join_controller,
    get_requests as get_requests_controller,
    handle_request as handle_request_controller,
    get_my_requests as get_my_requests_controller
)

club_bp = Blueprint('club', __name__)

@club_bp.route('/', methods=['GET'])
def get_all_clubs():
    return get_all_clubs_controller()

@club_bp.route('/managed', methods=['GET'])
@jwt_required()
def get_managed_clubs():
    return get_managed_clubs_controller()

@club_bp.route('/<int:club_id>', methods=['GET'])
def get_club(club_id):
    return get_club_controller(club_id)

@club_bp.route('/', methods=['POST'])
@jwt_required()
def create_club():
    return create_club_controller()

@club_bp.route('/<int:club_id>', methods=['PUT'])
@jwt_required()
def update_club(club_id):
    return update_club_controller(club_id)

@club_bp.route('/<int:club_id>', methods=['DELETE'])
@jwt_required()
def delete_club(club_id):
    return delete_club_controller(club_id)

@club_bp.route('/<int:club_id>/join', methods=['POST'])
@jwt_required()
def request_join(club_id):
    return request_join_controller(club_id)

@club_bp.route('/<int:club_id>/requests', methods=['GET'])
@jwt_required()
def get_requests(club_id):
    return get_requests_controller(club_id)

@club_bp.route('/requests/<int:request_id>', methods=['PUT'])
@jwt_required()
def handle_request(request_id):
    return handle_request_controller(request_id)

@club_bp.route('/my-requests', methods=['GET'])
@jwt_required()
def get_my_requests():
    return get_my_requests_controller()
