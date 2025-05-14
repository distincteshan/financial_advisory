from flask import Blueprint, request, jsonify
from config import users_collection, SECRET_KEY
from utils.hash_password import hash_password, check_password
import jwt
from datetime import datetime, date, time, timedelta
from bson import ObjectId

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

@auth_blueprint.route("/submit-questionnaire", methods=["POST"])
def submit_questionnaire():
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"message": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode token
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        # Get answers from request
        data = request.json
        answers = data.get('answers', {})
        
        if len(answers) == 0:
            return jsonify({"message": "No answers provided"}), 400

        # Question weights based on importance
        weights = {
            0: 1.5,  # Investment goal (most important)
            1: 1.2,  # Investment timeline
            2: 1.5,  # Risk reaction
            3: 0.8,  # Investment knowledge
            4: 0.7,  # Savings capacity
            5: 1.3,  # Investment preference
            6: 0.5,  # Monitoring frequency
            7: 0.8,  # Income source
            8: 1.2,  # Financial obligations
            9: 1.0,  # Age group
        }
        
        # Calculate weighted risk score
        weighted_sum = 0
        total_weights = 0
        
        for question_index, answer_value in answers.items():
            question_weight = weights.get(int(question_index), 1.0)
            weighted_sum += answer_value * question_weight
            total_weights += question_weight
            
        risk_score = weighted_sum / total_weights
        
        # More granular risk category determination
        risk_category = "Unknown"
        if risk_score <= 1.8:
            risk_category = "Very Conservative"
            risk_description = "Focus on capital preservation with minimal risk tolerance"
        elif risk_score <= 2.6:
            risk_category = "Conservative"
            risk_description = "Emphasis on stability with some growth potential"
        elif risk_score <= 3.4:
            risk_category = "Moderate"
            risk_description = "Balanced approach between stability and growth"
        elif risk_score <= 4.2:
            risk_category = "Aggressive"
            risk_description = "Growth-oriented with higher risk tolerance"
        else:
            risk_category = "Very Aggressive"
            risk_description = "Maximum growth potential with highest risk tolerance"

        # Update user in database
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "risk_score": round(risk_score, 2),
                    "risk_category": risk_category,
                    "risk_description": risk_description,
                    "has_completed_questionnaire": True,
                    "questionnaire_answers": answers,
                    "questionnaire_completed_at": datetime.utcnow()
                }
            }
        )

        return jsonify({
            "message": "Questionnaire submitted successfully",
            "risk_score": round(risk_score, 2),
            "risk_category": risk_category,
            "risk_description": risk_description
        }), 200

    except Exception as e:
        print("Questionnaire submission error:", str(e))
        return jsonify({"message": "An error occurred during questionnaire submission"}), 500