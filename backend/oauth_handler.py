"""
Google OAuth Handler for Flask Backend
"""
from authlib.integrations.flask_client import OAuth
from flask import session, url_for
import os

oauth = OAuth()

def init_oauth(app):
    """Initialize OAuth with Flask app"""
    oauth.init_app(app)
    
    # Configure Google OAuth
    google = oauth.register(
        name='google',
        client_id=os.getenv('GOOGLE_CLIENT_ID'),
        client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )
    
    return oauth

def setup_oauth_routes(app, db, User):
    """Setup OAuth routes for Flask app"""
    from flask import redirect, request, jsonify
    import uuid
    from datetime import datetime
    
    @app.route('/oauth/google/login')
    def google_login():
        """Redirect to Google OAuth"""
        # Use X-Forwarded-Host from Apache proxy, or fall back to Host header
        forwarded_host = request.headers.get('X-Forwarded-Host') or request.headers.get('Host', 'localhost:5001')

        # Handle comma-separated hosts (take the first one)
        if ',' in forwarded_host:
            forwarded_host = forwarded_host.split(',')[0].strip()

        scheme = 'https' if request.is_secure or request.headers.get('X-Forwarded-Proto') == 'https' else 'http'

        # Manually construct redirect URI to respect proxy headers
        redirect_uri = f"{scheme}://{forwarded_host}/oauth/google/callback"
        print(f"OAuth redirect URI: {redirect_uri}")

        return oauth.google.authorize_redirect(redirect_uri)

    @app.route('/oauth/google/callback')
    def google_callback():
        """Handle Google OAuth callback"""
        print("=== OAuth callback received ===")
        try:
            print("Getting OAuth token...")
            token = oauth.google.authorize_access_token()
            print(f"Token received: {bool(token)}")

            user_info = token.get('userinfo')
            print(f"User info: {user_info}")

            if not user_info:
                print("ERROR: No user info in token")
                return redirect(f"{os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')}/auth/signin?error=no_user_info")

            email = user_info.get('email')
            name = user_info.get('name', email.split('@')[0])
            print(f"User: {name} ({email})")

            # Find or create user
            from database import SessionLocal
            db = SessionLocal()
            user = db.query(User).filter(User.email == email).first()

            if not user:
                print(f"Creating new user: {email}")
                # Create new user
                user = User(
                    id=str(uuid.uuid4()),
                    email=email,
                    name=name,
                    password=None  # OAuth users don't have passwords
                )
                db.add(user)
                db.commit()
                print(f"User created with ID: {user.id}")
            else:
                print(f"Existing user found: {user.id}")

            # Set session as permanent (24 hour lifetime)
            session.permanent = True
            session['user_id'] = user.id
            print(f"Session set for user: {user.id}")

            db.close()

            # Redirect to dashboard
            redirect_url = f"{os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')}/dashboard"
            print(f"Redirecting to: {redirect_url}")
            return redirect(redirect_url)

        except Exception as e:
            import traceback
            print(f"OAuth error: {e}")
            print(traceback.format_exc())
            return redirect(f"{os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')}/auth/signin?error=oauth_failed")
