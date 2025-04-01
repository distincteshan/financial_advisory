from functools import wraps
from flask import request, jsonify
import jwt
from config import SECRET_KEY

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            # Remove 'Bearer ' if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Decode the token
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            # Add user_id to request object
            request.user_id = data['user_id']
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated