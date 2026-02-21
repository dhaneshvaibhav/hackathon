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
        
        # Scope: r_liteprofile, r_emailaddress are legacy scopes.
        # If the user only has "Community Management API", they might not have profile scopes.
        # We will try to request only the organization scopes to avoid authorization errors.
        scopes = [
            "w_organization_social",
            "r_organization_social",
            "r_organization_admin",
            "rw_organization_admin"
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
        
        # Fetch organizations the user administers
        # The 'q=roleAssignee' parameter filters by the current user
        org_url = "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED"
        org_response = requests.get(org_url, headers=user_headers)
        
        if org_response.status_code != 200:
             # Fallback: try fetching /v2/me just in case, or fail gracefully
             user_url = "https://api.linkedin.com/v2/me"
             user_response = requests.get(user_url, headers=user_headers)
             if user_response.status_code == 200:
                 user_data = user_response.json()
                 provider_user_id = str(user_data.get('id'))
                 linkedin_user = user_data
                 linkedin_user['sub'] = provider_user_id
                 linkedin_user['name'] = f"{user_data.get('localizedFirstName', '')} {user_data.get('localizedLastName', '')}"
             else:
                 return None, f"Failed to fetch LinkedIn data. Status: {org_response.status_code}. Response: {org_response.text}"
        else:
            org_data = org_response.json()
            linkedin_user['organizations'] = []
            
            # Extract user ID from the first element's roleAssignee if available
            provider_user_id = None
            if org_data.get('elements'):
                # roleAssignee is like "urn:li:person:12345"
                role_assignee_urn = org_data['elements'][0].get('roleAssignee', '')
                if 'person' in role_assignee_urn:
                    provider_user_id = role_assignee_urn.split(':')[-1]
            
            if not provider_user_id:
                # If no organizations found, we can't get the ID this way.
                # Try /v2/me as a last resort (even if we didn't ask for scope, sometimes it works?)
                # Actually, without scope it will fail.
                # We need at least one organization to identify the user if we don't have profile scopes.
                return None, "No managed organizations found to identify user. Please ensure you manage at least one LinkedIn page."

            linkedin_user['sub'] = provider_user_id
            linkedin_user['name'] = "LinkedIn User" # We don't have name access
            
            for element in org_data.get('elements', []):
                org_urn = element.get('organizationalTarget', '')
                # org_urn format: "urn:li:organization:123456"
                
                # Fetch basic organization details (name, logo)
                # We need to extract the ID from the URN
                if 'organization' in org_urn:
                    org_id = org_urn.split(':')[-1]
                    org_details_url = f"https://api.linkedin.com/v2/organizations/{org_id}"
                    org_details_resp = requests.get(org_details_url, headers=user_headers)
                    
                    if org_details_resp.status_code == 200:
                        org_info = org_details_resp.json()
                        linkedin_user['organizations'].append({
                            'id': org_id,
                            'urn': org_urn,
                            'name': org_info.get('localizedName', 'Unknown Organization'),
                            'vanity_name': org_info.get('vanityName'),
                            'logo': org_info.get('logoV2', {}).get('original', '') # Simplified, structure might vary
                        })
                        
                        # Fetch follower statistics for this organization
                        # Note: This requires 'r_organization_social' scope
                        follower_stats_url = f"https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity={org_urn}"
                        follower_stats_resp = requests.get(follower_stats_url, headers=user_headers)
                        
                        if follower_stats_resp.status_code == 200:
                            stats_data = follower_stats_resp.json()
                            if stats_data.get('elements'):
                                # Get the most recent stats
                                latest_stat = stats_data['elements'][0]
                                linkedin_user['organizations'][-1]['follower_stats'] = {
                                    'follower_count': latest_stat.get('followerCountsByAssociationType', {}).get('followers', 0),
                                    'organic_follower_count': latest_stat.get('followerCountsByAssociationType', {}).get('organicFollowers', 0),
                                    'paid_follower_count': latest_stat.get('followerCountsByAssociationType', {}).get('paidFollowers', 0)
                                }

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
