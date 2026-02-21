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
        
        # Add state=github to distinguish in callback
        url = f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope=read:user&state=github"
        return url, None

    @staticmethod
    def get_linkedin_auth_url():
        """
        Generate LinkedIn OAuth authorization URL.
        """
        client_id = current_app.config.get('LINKEDIN_CLIENT_ID')
        redirect_uri = current_app.config.get('LINKEDIN_REDIRECT_URI')
        if not client_id or not redirect_uri:
            return None, "LinkedIn credentials not configured"
        
        # Scope: openid, profile, email are standard for Sign In with LinkedIn using OpenID Connect
        # For older apps: r_liteprofile r_emailaddress
        scope = "openid profile email"
        state = "linkedin"
        
        url = f"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}&state={state}"
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
    def handle_linkedin_callback(code, user_id):
        """
        Exchange code for token and save LinkedIn OAuth data.
        """
        client_id = current_app.config.get('LINKEDIN_CLIENT_ID')
        client_secret = current_app.config.get('LINKEDIN_CLIENT_SECRET')
        redirect_uri = current_app.config.get('LINKEDIN_REDIRECT_URI')

        if not client_id or not client_secret:
            return None, "LinkedIn credentials not configured"

        # Exchange code for access token
        token_url = "https://www.linkedin.com/oauth/v2/accessToken"
        payload = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': client_id,
            'client_secret': client_secret
        }
        
        # LinkedIn expects x-www-form-urlencoded, requests handles this by default with data=
        # But 'requests.post' with 'data=' sends form-urlencoded.
        response = requests.post(token_url, data=payload)
        
        if response.status_code != 200:
            return None, f"Failed to exchange code for token: {response.text}"
        
        token_data = response.json()
        access_token = token_data.get('access_token')
        if not access_token:
            return None, "No access token in response"

        # Get user info using OpenID Connect endpoint
        user_url = "https://api.linkedin.com/v2/userinfo"
        user_headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_url, headers=user_headers)
        
        if user_response.status_code != 200:
            return None, "Failed to fetch LinkedIn user info"
        
        linkedin_user = user_response.json()
        provider_user_id = str(linkedin_user.get('sub'))  # 'sub' is the unique ID in OIDC
        
        # Try to fetch additional info if possible, but basic profile is in linkedin_user
        # linkedin_user keys: sub, name, given_name, family_name, picture, email, email_verified
        
        # Check existing connection
        existing_oauth = OAuth.query.filter_by(provider='linkedin', provider_user_id=provider_user_id).first()
        if existing_oauth and existing_oauth.user_id != user_id:
            return None, "This LinkedIn account is already connected to another user"

        user_oauth = OAuth.query.filter_by(user_id=user_id, provider='linkedin').first()
        
        if user_oauth:
            user_oauth.provider_user_id = provider_user_id
            user_oauth.access_token = access_token
            user_oauth.meta_data = linkedin_user
            user_oauth.updated_at = datetime.utcnow()
        else:
            user_oauth = OAuth(
                user_id=user_id,
                provider='linkedin',
                provider_user_id=provider_user_id,
                access_token=access_token,
                meta_data=linkedin_user
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

    @staticmethod
    def disconnect_linkedin(user_id):
        """
        Disconnect LinkedIn account.
        """
        oauth = OAuth.query.filter_by(user_id=user_id, provider='linkedin').first()
        if not oauth:
            return False, "LinkedIn account not connected"
        
        try:
            db.session.delete(oauth)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
