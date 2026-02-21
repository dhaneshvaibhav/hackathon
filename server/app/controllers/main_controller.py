from flask import jsonify
from app.services.main_service import MainService

def home_controller():
    data = MainService.get_home_message()
    return jsonify(data)

def test_db_controller():
    data, error = MainService.check_db_connection()
    if error:
        return jsonify({"error": error}), 500
    return jsonify(data)
