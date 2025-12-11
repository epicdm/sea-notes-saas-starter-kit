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
    
    # Health check endpoint
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'service': 'livekit-backend'}, 200
    
    # Import and register blueprints
    try:
        from agent_api import bp as agent_bp
        app.register_blueprint(agent_bp, url_prefix='/api/agents')
    except ImportError as e:
        print(f"Warning: Could not import agent_api blueprint: {e}")
    
    try:
        from brands_api import bp as brands_bp
        app.register_blueprint(brands_bp, url_prefix='/api/brands')
    except ImportError as e:
        print(f"Warning: Could not import brands_api blueprint: {e}")
    
    return app

# Create the app instance for Gunicorn
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 8080)), debug=False)
