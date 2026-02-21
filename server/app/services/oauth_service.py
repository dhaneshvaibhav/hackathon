import requests
from urllib.parse import quote
from datetime import datetime, timedelta
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
        
        # Scopes requested
        scopes = [
            "openid",
            "profile",
            "r_ads_reporting",
            "r_organization_social",
            "rw_organization_admin",
            "w_member_social",
            "rw_events",
            "r_ads",
            "w_organization_social",
            "rw_ads",
            "r_basicprofile",
            "r_events",
            "r_organization_admin",
            "email",
            "r_1st_connections_size"
        ]
        
        scope_str = " ".join(scopes)
        encoded_scope = quote(scope_str)
        state = "linkedin"
        
        url = f"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope={encoded_scope}&state={state}"
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
        
        # Fetch repositories for analysis
        repos_url = "https://api.github.com/user/repos?sort=updated&per_page=10&type=owner"
        repos_resp = requests.get(repos_url, headers=user_headers)
        if repos_resp.status_code == 200:
            repos = repos_resp.json()
            repo_data = []
            for repo in repos:
                repo_data.append({
                    'name': repo.get('name'),
                    'description': repo.get('description'),
                    'language': repo.get('language'),
                    'stargazers_count': repo.get('stargazers_count'),
                    'forks_count': repo.get('forks_count'),
                    'html_url': repo.get('html_url')
                })
            github_user['repositories'] = repo_data
        
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
    def fetch_linkedin_additional_data(access_token, linkedin_user):
        """
        Fetch additional data from LinkedIn:
        - Network size
        - Organization list
        - Events hosted
        """
        headers = {'Authorization': f'Bearer {access_token}', 'X-Restli-Protocol-Version': '2.0.0'}
        data = {}

        # 1. Network Size
        print("Fetching LinkedIn Network Size...")
        try:
            # Extract Person ID from 'sub' (OIDC ID)
            person_id = linkedin_user.get('sub')
            if person_id.startswith('urn:li:person:'):
                person_id = person_id.split(':')[-1]
            
            # Construct the URN and URL encode it for the path
            person_urn = f"urn:li:person:{person_id}"
            encoded_person_urn = quote(person_urn)
            network_url = f"https://api.linkedin.com/v2/connections/{encoded_person_urn}"
            
            conn_resp = requests.get(network_url, headers=headers)
            print(f"Network Size Response: {conn_resp.status_code} - {conn_resp.text}")
            
            if conn_resp.status_code == 200:
                conn_data = conn_resp.json()
                data['network_size'] = conn_data.get('firstDegreeSize', 0)
            else:
                # Fallback to /v2/me if connections endpoint fails
                print("Fallback: Fetching Network Size from /v2/me")
                me_url = "https://api.linkedin.com/v2/me?projection=(id,numConnections)"
                me_resp = requests.get(me_url, headers=headers)
                print(f"Me Response: {me_resp.status_code} - {me_resp.text}")
                if me_resp.status_code == 200:
                    data['network_size'] = me_resp.json().get('numConnections', 0)
                else:
                    data['network_size'] = 0
        except Exception as e:
            print(f"Error fetching network size: {e}")
            data['network_size'] = 0

        # 2. Organization List
        print("Fetching LinkedIn Organizations...")
        try:
            orgs_url = "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&state=APPROVED"
            orgs_resp = requests.get(orgs_url, headers=headers)
            print(f"Orgs Response: {orgs_resp.status_code} - {orgs_resp.text}")
            
            if orgs_resp.status_code == 200:
                orgs_data = orgs_resp.json()
                elements = orgs_data.get('elements', [])
                
                organizations = []
                for el in elements:
                    org_urn = el.get('organizationalTarget')
                    role = el.get('role')
                    state = el.get('state')
                    
                    org_details = {
                        'urn': org_urn,
                        'role': role,
                        'state': state
                    }
                    
                    try:
                        # Extract Organization ID
                        org_id = org_urn.split(':')[-1]
                        
                        # Fetch Organization Details (Name)
                        if 'organization' in org_urn:
                            details_url = f"https://api.linkedin.com/v2/organizations/{org_id}?projection=(localizedName)"
                            details_resp = requests.get(details_url, headers=headers)
                            if details_resp.status_code == 200:
                                org_details['organizationName'] = details_resp.json().get('localizedName', 'Unknown Organization')
                            else:
                                print(f"Failed to fetch details for {org_urn}: {details_resp.text}")
                                org_details['organizationName'] = 'Unknown Organization'

                        # Fetch Organization Follower Statistics
                        if 'organization' in org_urn:
                            stats_url = "https://api.linkedin.com/v2/organizationalEntityFollowerStatistics"
                            params = {
                                'q': 'organizationalEntity',
                                'organizationalEntity': org_urn
                            }
                            stats_resp = requests.get(stats_url, headers=headers, params=params)
                            print(f"Org Stats Response for {org_urn}: {stats_resp.status_code}")
                            
                            if stats_resp.status_code == 200:
                                stats_data = stats_resp.json()
                                total_followers = 0
                                if 'elements' in stats_data:
                                    for stat_el in stats_data['elements']:
                                        follower_counts = stat_el.get('followerCountsByAssociationType', [])
                                        for fc in follower_counts:
                                            counts = fc.get('followerCounts', {})
                                            total_followers += counts.get('organicFollowerCount', 0)
                                            total_followers += counts.get('paidFollowerCount', 0)
                                
                                org_details['followers'] = total_followers
                                print(f"Followers for {org_urn}: {total_followers}")
                            else:
                                print(f"Failed to fetch stats: {stats_resp.text}")
                    except Exception as e:
                        print(f"Error fetching details/followers for {org_urn}: {e}")
                        pass
                        
                    organizations.append(org_details)
                
                data['orgs'] = organizations
        except Exception as e:
            print(f"Error fetching organizations: {e}")

        # 3. Events Hosted
        print("Fetching LinkedIn Events...")
        try:
            # Try to fetch events using eventAcls
            events_url = "https://api.linkedin.com/v2/eventAcls?q=roleAssignee&state=APPROVED"
            events_resp = requests.get(events_url, headers=headers)
            print(f"Events Response: {events_resp.status_code} - {events_resp.text}")
            
            if events_resp.status_code == 200:
                events_data = events_resp.json()
                elements = events_data.get('elements', [])
                
                events = []
                for el in elements:
                    event_urn = el.get('event')
                    role = el.get('role')
                    events.append({
                        'urn': event_urn,
                        'role': role
                    })
                data['events'] = events
            else:
                data['events'] = []
        except Exception as e:
            print(f"Error fetching events: {e}")
            data['events'] = []

        return data

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
        refresh_token = token_data.get('refresh_token')
        expires_in = token_data.get('expires_in')
        
        token_expiry = None
        if expires_in:
            token_expiry = datetime.utcnow() + timedelta(seconds=expires_in)

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
        
        # Fetch additional data (network size, orgs, events)
        additional_data = OAuthService.fetch_linkedin_additional_data(access_token, linkedin_user)
        linkedin_user.update(additional_data)

        # Check existing connection
        existing_oauth = OAuth.query.filter_by(provider='linkedin', provider_user_id=provider_user_id).first()
        if existing_oauth and existing_oauth.user_id != user_id:
            return None, "This LinkedIn account is already connected to another user"

        user_oauth = OAuth.query.filter_by(user_id=user_id, provider='linkedin').first()
        
        if user_oauth:
            user_oauth.provider_user_id = provider_user_id
            user_oauth.access_token = access_token
            if refresh_token:
                user_oauth.refresh_token = refresh_token
            if token_expiry:
                user_oauth.token_expiry = token_expiry
            user_oauth.meta_data = linkedin_user
            user_oauth.updated_at = datetime.utcnow()
        else:
            user_oauth = OAuth(
                user_id=user_id,
                provider='linkedin',
                provider_user_id=provider_user_id,
                access_token=access_token,
                refresh_token=refresh_token,
                token_expiry=token_expiry,
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
