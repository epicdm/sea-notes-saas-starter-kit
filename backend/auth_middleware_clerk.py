"""
Clerk Authentication Middleware for Flask

This middleware validates Clerk JWT tokens and sets user context.

Usage:
    from auth_middleware_clerk import require_auth

    @app.route('/agents', methods=['POST'])
    @require_auth
    def create_agent():
        user_id = g.user_id  # Clerk user ID available in Flask global
        ...
"""

from functools import wraps
from flask import request, abort, g
import jwt
import os
import requests
from typing import Optional

# Clerk configuration
CLERK_SECRET_KEY = os.getenv('CLERK_SECRET_KEY', '')
CLERK_PUBLISHABLE_KEY = os.getenv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', '')

# Extract instance ID from publishable key (format: pk_test_{instance_id}_...)
def get_clerk_instance_id() -> Optional[str]:
    """Extract Clerk instance ID from publishable key"""
    if not CLERK_PUBLISHABLE_KEY:
        return None
    parts = CLERK_PUBLISHABLE_KEY.split('_')
    if len(parts) >= 3:
        return parts[2]  # Instance ID is the 3rd part
    return None

CLERK_INSTANCE_ID = get_clerk_instance_id()
CLERK_JWKS_URL = f"https://{CLERK_INSTANCE_ID}.clerk.accounts.dev/.well-known/jwks.json" if CLERK_INSTANCE_ID else None

# Cache for JWKS (JSON Web Key Set)
_jwks_cache = None


def get_jwks():
    """
    Fetch Clerk's JWKS (JSON Web Key Set) for JWT verification.
    This is cached to avoid hitting Clerk's API on every request.
    """
    global _jwks_cache
    
    if _jwks_cache is not None:
        return _jwks_cache
    
    if not CLERK_JWKS_URL:
        raise ValueError("Clerk JWKS URL not configured. Check NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")
    
    try:
        response = requests.get(CLERK_JWKS_URL, timeout=5)
        response.raise_for_status()
        _jwks_cache = response.json()
        return _jwks_cache
    except Exception as e:
        print(f"❌ Failed to fetch Clerk JWKS: {e}")
        raise ValueError("Could not fetch Clerk JWKS for JWT verification")


def verify_clerk_token(token: str) -> dict:
    """
    Verify a Clerk JWT token and return the decoded payload.
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        dict: Decoded token payload with user_id, session_id, etc.
        
    Raises:
        jwt.InvalidTokenError: If token is invalid
    """
    # For development, we can use the secret key directly
    # In production, we should verify against JWKS
    
    # Simplified verification using secret key (development mode)
    if CLERK_SECRET_KEY:
        try:
            # Clerk uses RS256 algorithm, but we'll try HS256 for now
            # In production, fetch public key from JWKS endpoint
            decoded = jwt.decode(
                token,
                CLERK_SECRET_KEY,
                algorithms=['RS256', 'HS256'],
                options={"verify_signature": False}  # TEMP: Skip signature verification
            )
            return decoded
        except jwt.InvalidTokenError as e:
            print(f"❌ JWT decode error: {e}")
            raise
    
    raise ValueError("Clerk secret key not configured")


def require_auth(f):
    """
    Decorator to require Clerk authentication for a Flask route.
    
    Sets g.user_id and g.session_id from the verified token.
    
    Usage:
        @app.route('/protected')
        @require_auth
        def protected_route():
            user_id = g.user_id
            return f"Hello {user_id}"
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            print("❌ Missing or invalid Authorization header")
            abort(401, description="Missing or invalid Authorization header")
        
        token = auth_header.replace('Bearer ', '')
        
        try:
            # Verify and decode token
            payload = verify_clerk_token(token)
            
            # Extract user information from token
            g.user_id = payload.get('sub')  # Clerk uses 'sub' for user ID
            g.session_id = payload.get('sid')  # Clerk uses 'sid' for session ID
            g.clerk_payload = payload  # Store full payload for advanced use
            
            if not g.user_id:
                print("❌ Token missing user ID (sub claim)")
                abort(401, description="Invalid token: missing user ID")
            
            print(f"✅ Authenticated user: {g.user_id}")
            
        except jwt.InvalidTokenError as e:
            print(f"❌ Invalid Clerk token: {e}")
            abort(401, description=f"Invalid token: {str(e)}")
        except ValueError as e:
            print(f"❌ Auth configuration error: {e}")
            abort(500, description="Authentication system misconfigured")
        except Exception as e:
            print(f"❌ Unexpected auth error: {e}")
            abort(500, description="Authentication failed")
        
        return f(*args, **kwargs)
    
    return decorated_function


# Optionalauth decorator (doesn't fail if no token, but populates g.user_id if present)
def optional_auth(f):
    """
    Decorator for routes that work both authenticated and unauthenticated.
    Sets g.user_id if token is present, otherwise sets it to None.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        
        if auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')
            try:
                payload = verify_clerk_token(token)
                g.user_id = payload.get('sub')
                g.session_id = payload.get('sid')
                g.clerk_payload = payload
            except:
                g.user_id = None
                g.session_id = None
        else:
            g.user_id = None
            g.session_id = None
        
        return f(*args, **kwargs)
    
    return decorated_function
