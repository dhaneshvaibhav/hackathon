from flask import jsonify, request
from app.services.main_service import MainService
from app.services.club_service import ClubService
from app.services.event_service import EventService

def home_controller():
    data = MainService.get_home_message()
    return jsonify(data)

def test_db_controller():
    data, error = MainService.check_db_connection()
    if error:
        return jsonify({"error": error}), 500
    return jsonify(data)

def search_controller():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'clubs': [], 'events': []}), 200
        
    clubs = ClubService.search_clubs(query)
    events = EventService.search_events(query)
    
    return jsonify({
        'clubs': [c.to_dict() for c in clubs],
        'events': [e.to_dict() for e in events]
    }), 200
