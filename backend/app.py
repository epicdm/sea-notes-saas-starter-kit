"""
Main Flask Application Entry Point
"""
import os
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    # Enable CORS
    CORS(app)

    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    # Helper function for getting current user ID (used by brands_api)
    def get_current_user_id():
        from flask import request, session
        # Check Flask session first
        if 'user_id' in session:
            return session['user_id']

        # Check Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')
            try:
                import jwt
                decoded = jwt.decode(token, app.secret_key, algorithms=['HS256'])
                return decoded.get('user_id')
            except:
                pass

        # Check user_id cookie
        user_id_cookie = request.cookies.get('user_id')
        if user_id_cookie:
            return user_id_cookie

        # Check X-User-Email header
        user_email = request.headers.get('X-User-Email')
        if user_email:
            from database import SessionLocal, User
            db = SessionLocal()
            try:
                user = db.query(User).filter(User.email == user_email).first()
                if user:
                    return user.id
            finally:
                db.close()

        return None

    # Attach to app for brands_api to use
    app.get_current_user_id = get_current_user_id
    
    # Health check endpoint
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'service': 'livekit-backend'}, 200
    
    # Import and register blueprints
    try:
        from agent_api import agent_api
        app.register_blueprint(agent_api)
        print("✅ agent_api blueprint registered")
    except ImportError as e:
        print(f"⚠️ Warning: Could not import agent_api blueprint: {e}")
    except Exception as e:
        print(f"⚠️ Error registering agent_api blueprint: {e}")

    try:
        from brands_api import setup_brands_endpoints
        setup_brands_endpoints(app)
        print("✅ brands_api endpoints registered")
    except ImportError as e:
        print(f"⚠️ Warning: Could not import brands_api: {e}")
    except Exception as e:
        print(f"⚠️ Error setting up brands_api: {e}")
    
    return app

# Create the app instance for Gunicorn
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 8080)), debug=False)
