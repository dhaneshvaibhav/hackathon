from flask import Blueprint
from app.controllers.main_controller import home_controller, test_db_controller

main_bp = Blueprint('main', __name__)

@main_bp.route('/', methods=['GET'])
def home():
    return home_controller()

@main_bp.route('/test-db', methods=['GET'])
def test_db():
    return test_db_controller()
