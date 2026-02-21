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
        import urllib.parse
        
        client_id = current_app.config.get('LINKEDIN_CLIENT_ID')
        redirect_uri = current_app.config.get('LINKEDIN_REDIRECT_URI')
        if not client_id or not redirect_uri:
            return None, "LinkedIn credentials not configured"
        
        # Scope: r_liteprofile, r_emailaddress, openid are often not available with just Community Management.
        # We will request ONLY the organization scopes.
        # This means we cannot identify the user (get name/ID) or list organizations automatically (requires admin).
        # We will rely on the user manually providing their Organization ID if listing fails.
        scopes = [
            "w_organization_social",
            "r_organization_social"
        ]
        
        scope_string = " ".join(scopes)
        encoded_scope = urllib.parse.quote(scope_string)
        encoded_redirect_uri = urllib.parse.quote(redirect_uri)
        state = "linkedin"
        
        url = f"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={client_id}&redirect_uri={encoded_redirect_uri}&scope={encoded_scope}&state={state}"
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
        
        # Fetch followers and following (limit to first 100 for performance)
        followers_url = "https://api.github.com/user/followers?per_page=100"
        following_url = "https://api.github.com/user/following?per_page=100"
        
        followers_response = requests.get(followers_url, headers=user_headers)
        following_response = requests.get(following_url, headers=user_headers)
        
        if followers_response.status_code == 200:
            github_user['followers_list'] = followers_response.json()
        
        if following_response.status_code == 200:
            github_user['following_list'] = following_response.json()
            
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

        # We might not have profile scopes, so we cannot call /v2/me or /v2/userinfo
        # Instead, we will fetch organization ACLs to get the user's URN (provider_user_id)
        
        user_headers = {
            'Authorization': f'Bearer {access_token}',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        linkedin_user = {}
        
        # 1. Try to identify the user via /v2/me (requires r_liteprofile)
        user_url = "https://api.linkedin.com/v2/me"
        user_response = requests.get(user_url, headers=user_headers)
        
        provider_user_id = None
        
        if user_response.status_code == 200:
             user_data = user_response.json()
             provider_user_id = str(user_data.get('id'))
             linkedin_user = user_data
             linkedin_user['sub'] = provider_user_id
             linkedin_user['name'] = f"{user_data.get('localizedFirstName', '')} {user_data.get('localizedLastName', '')}"
        
        # 2. Try to fetch organizations (might fail if r_organization_admin is missing)
        # The 'q=roleAssignee' parameter filters by the current user
        org_url = "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&state=APPROVED"
        org_response = requests.get(org_url, headers=user_headers)
        
        linkedin_user['organizations'] = []
        
        if org_response.status_code == 200:
            org_data = org_response.json()
            
            # If we still don't have provider_user_id, try to extract from roleAssignee
            if not provider_user_id and org_data.get('elements'):
                role_assignee_urn = org_data['elements'][0].get('roleAssignee', '')
                if 'person' in role_assignee_urn:
                    provider_user_id = role_assignee_urn.split(':')[-1]
                    linkedin_user['sub'] = provider_user_id
                    linkedin_user['name'] = "LinkedIn User" # Fallback name
            
            for element in org_data.get('elements', []):
                org_urn = element.get('organizationalTarget', '')
                if 'organization' in org_urn:
                    org_id = org_urn.split(':')[-1]
                    
                    # Fetch basic organization details
                    org_details_url = f"https://api.linkedin.com/v2/organizations/{org_id}"
                    org_details_resp = requests.get(org_details_url, headers=user_headers)
                    
                    org_name = 'Unknown Organization'
                    org_vanity = None
                    org_logo = ''
                    
                    if org_details_resp.status_code == 200:
                        org_info = org_details_resp.json()
                        org_name = org_info.get('localizedName', 'Unknown Organization')
                        org_vanity = org_info.get('vanityName')
                        logo_data = org_info.get('logoV2', {})
                        if 'original' in logo_data:
                            org_logo = logo_data['original']
                    
                    org_entry = {
                        'id': org_id,
                        'urn': org_urn,
                        'name': org_name,
                        'vanity_name': org_vanity,
                        'logo': org_logo,
                        'follower_stats': {}
                    }
                    
                    # Fetch follower statistics (requires r_organization_social)
                    follower_stats_url = f"https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity={org_urn}"
                    follower_stats_resp = requests.get(follower_stats_url, headers=user_headers)
                    
                    if follower_stats_resp.status_code == 200:
                        stats_data = follower_stats_resp.json()
                        if stats_data.get('elements'):
                            org_entry['follower_stats'] = stats_data['elements'][0]
                            
                    linkedin_user['organizations'].append(org_entry)
        else:
            # Log failure but do not crash if we have user ID
            print(f"Warning: Failed to fetch organizations: {org_response.status_code} {org_response.text}")
            
        if not provider_user_id:
            return None, f"Failed to identify LinkedIn user. /v2/me status: {user_response.status_code}. Please ensure 'r_liteprofile' is authorized."

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
