from flask import Blueprint, request, jsonify
from config import users_collection, SECRET_KEY
from utils.hash_password import hash_password, check_password
import jwt
from datetime import datetime, date, time, timedelta

auth_blueprint = Blueprint("auth", __name__)

@auth_blueprint.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if users_collection.find_one({"username": data["username"]}):
        return jsonify({"message": "Username already exists"}), 400

    hashed_pw = hash_password(data["password"])
    user = {
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "username": data["username"],
        "password": hashed_pw,
        "risk_score": None,
        "has_completed_questionnaire": False,
        "risk_category": None
    }
    users_collection.insert_one(user)

    return jsonify({"message": "User created successfully"}), 201

@auth_blueprint.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        print("Login request data:", data)  # Add this for debugging

        # Find user by username
        user = users_collection.find_one({"username": data["username"]})
        
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Verify password
        if check_password(data["password"], user["password"]):
            # Generate JWT token
            token = jwt.encode({
                'user_id': str(user['_id']),
                'username': user['username'],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, SECRET_KEY)

            has_completed = user.get('has_completed_questionnaire', False)
            
            return jsonify({
                "message": "Login successful",
                "token": token,
                "user_id": str(user['_id']),
                "has_completed_questionnaire": has_completed
            }), 200
        
        return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        print("Login error:", str(e))  # Add this for debugging
        return jsonify({"message": "An error occurred during login"}), 500