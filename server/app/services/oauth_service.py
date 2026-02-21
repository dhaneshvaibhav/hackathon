import requests
from datetime import datetime
from flask import current_app, jsonify
from app.extensions import db
from app.models.oauth import OAuth
from app.models.user import User

class OAuthService:
    @staticmethod
    def get_github_auth_url():
        """
        Generate GitHub OAuth authorization URL.
        """
        client_id = current_app.config.get('GITHUB_CLIENT_ID')
        redirect_uri = current_app.config.get('GITHUB_REDIRECT_URI')
        if not client_id or not redirect_uri:
            return None, "GitHub credentials not configured"
        
        url = f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope=read:user"
        return url, None

    @staticmethod
    def handle_github_callback(code, user_id):
        """
        Exchange code for token and save OAuth data.
        """
        client_id = current_app.config.get('GITHUB_CLIENT_ID')
        client_secret = current_app.config.get('GITHUB_CLIENT_SECRET')
        redirect_uri = current_app.config.get('GITHUB_REDIRECT_URI')

        if not client_id or not client_secret:
            return None, "GitHub credentials not configured"

        # Exchange code for access token
        token_url = "https://github.com/login/oauth/access_token"
        payload = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': redirect_uri
        }
        headers = {'Accept': 'application/json'}
        
        response = requests.post(token_url, json=payload, headers=headers)
        if response.status_code != 200:
            return None, "Failed to exchange code for token"
        
        token_data = response.json()
        access_token = token_data.get('access_token')
        if not access_token:
            return None, f"No access token in response: {token_data}"

        # Get user info from GitHub
        user_url = "https://api.github.com/user"
        user_headers = {'Authorization': f'token {access_token}'}
        user_response = requests.get(user_url, headers=user_headers)
        
        if user_response.status_code != 200:
            return None, "Failed to fetch GitHub user info"
        
        github_user = user_response.json()
        provider_user_id = str(github_user.get('id'))
        
        # Check if this GitHub account is already linked to another user
        existing_oauth = OAuth.query.filter_by(provider='github', provider_user_id=provider_user_id).first()
        if existing_oauth and existing_oauth.user_id != user_id:
            return None, "This GitHub account is already connected to another user"

        # Check if the user already has a GitHub connection
        user_oauth = OAuth.query.filter_by(user_id=user_id, provider='github').first()
        
        if user_oauth:
            # Update existing connection
            user_oauth.provider_user_id = provider_user_id
            user_oauth.access_token = access_token
            user_oauth.meta_data = github_user
            user_oauth.updated_at = datetime.utcnow()
        else:
            # Create new connection
            user_oauth = OAuth(
                user_id=user_id,
                provider='github',
                provider_user_id=provider_user_id,
                access_token=access_token,
                meta_data=github_user
            )
            db.session.add(user_oauth)
        
        try:
            db.session.commit()
            return user_oauth, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def disconnect_github(user_id):
        """
        Disconnect GitHub account.
        """
        oauth = OAuth.query.filter_by(user_id=user_id, provider='github').first()
        if not oauth:
            return False, "GitHub account not connected"
        
        try:
            db.session.delete(oauth)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
