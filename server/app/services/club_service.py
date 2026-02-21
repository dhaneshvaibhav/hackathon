from app.models.club import Club
from app.models.club_request import ClubRequest
from app.models.user import User
from app.extensions import db
from sqlalchemy.orm.attributes import flag_modified

class ClubService:
    @staticmethod
    def create_club(data, owner_id):
        owner_id = int(owner_id)
        user = User.query.get(owner_id)
        if not user or not user.is_admin:
             return None, "Only admins can create clubs"

        name = data.get('name')
        if not name:
            return None, "Club name is required"
        
        if Club.query.filter_by(name=name).first():
            return None, "Club with this name already exists"

        club = Club(
            name=name,
            description=data.get('description'),
            owner_id=owner_id,
            category=data.get('category'),
            logo_url=data.get('logo_url'),
            members=[{'user_id': owner_id, 'role': 'owner'}]
        )
        
        try:
            db.session.add(club)
            db.session.commit()
            return club, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def get_all_clubs():
        return Club.query.all()

    @staticmethod
    def get_clubs_by_owner(owner_id):
        return Club.query.filter_by(owner_id=int(owner_id)).all()

    @staticmethod
    def get_club_by_id(club_id):
        return Club.query.get(club_id)

    @staticmethod
    def request_to_join(club_id, user_id, message):
        user_id = int(user_id)
        club = Club.query.get(club_id)
        if not club:
            return None, "Club not found"

        # Check if already a member
        members = club.members or []
        if any(int(m['user_id']) == user_id for m in members):
            return None, "User is already a member"

        # Check if request already exists and is pending
        existing_req = ClubRequest.query.filter_by(club_id=club_id, user_id=user_id, status='pending').first()
        if existing_req:
            return None, "Pending request already exists"

        req = ClubRequest(
            club_id=club_id,
            user_id=user_id,
            message=message,
            status='pending'
        )

        try:
            db.session.add(req)
            db.session.commit()
            return req, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def get_club_requests(club_id, user_id):
        user_id = int(user_id)
        # user_id must be owner of the club
        club = Club.query.get(club_id)
        if not club:
            return None, "Club not found"
        
        if club.owner_id != user_id:
            # Also check if user is admin in members list? 
            # For now, strictly owner or admin logic
            return None, "Unauthorized"

        return ClubRequest.query.filter_by(club_id=club_id).all(), None

    @staticmethod
    def handle_request(request_id, status, admin_response, admin_id):
        admin_id = int(admin_id)
        req = ClubRequest.query.get(request_id)
        if not req:
            return None, "Request not found"
        
        club = req.club
        if club.owner_id != admin_id:
             return None, "Unauthorized"

        if status not in ['accepted', 'rejected']:
             return None, "Invalid status"

        req.status = status
        req.admin_response = admin_response

        if status == 'accepted':
            # Add to members
            members = list(club.members) if club.members else []
            if not any(int(m['user_id']) == req.user_id for m in members):
                members.append({'user_id': int(req.user_id), 'role': 'member'})
                club.members = members
                flag_modified(club, "members")

        try:
            db.session.commit()
            return req, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def get_user_requests(user_id):
        return ClubRequest.query.filter_by(user_id=int(user_id)).all()
