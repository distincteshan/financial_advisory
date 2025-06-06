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
    result = users_collection.insert_one(user)
    user_id = str(result.inserted_id)

    # Generate JWT token
    token = jwt.encode({
        'user_id': user_id,
        'username': data['username'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "message": "User created successfully",
        "token": token,
        "user_id": user_id,
        "has_completed_questionnaire": False
    }), 201

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

        # Get answers and investment amount from request
        data = request.json
        answers = data.get('answers', {})
        investment_amount = data.get('investmentAmount', 0)
        
        if len(answers) == 0:
            return jsonify({"message": "No answers provided"}), 400

        if investment_amount < 50000:  # Minimum ₹50,000
            return jsonify({"message": "Minimum investment amount is ₹50,000"}), 400

        # Question weights for 6 questions
        weights = {
            1: 1.5,  # Investment horizon (most important)
            2: 1.5,  # Risk comfort
            3: 1.0,  # Income stability
            4: 1.0,  # Emergency fund
            5: 1.0,  # Investment knowledge
        }
        
        # Calculate weighted risk score (excluding investment amount question)
        weighted_sum = 0
        total_weights = 0
        
        for question_index, answer_value in answers.items():
            if int(question_index) > 0:  # Skip investment amount question
                question_weight = weights.get(int(question_index), 1.0)
                weighted_sum += answer_value * question_weight
                total_weights += question_weight
            
        risk_score = weighted_sum / total_weights
        
        # More granular risk category determination
        risk_category = "Unknown"
        if risk_score <= 1.8:
            risk_category = "Very Conservative"
            risk_description = "Focus on capital preservation with minimal risk tolerance"
            allocation = {
                "NIFTY50": {"max": 0.20, "min_amount": 50000},
                "GOLD": {"max": 0.60, "min_amount": 25000},
                "BTC": {"max": 0.05, "min_amount": 10000},
                "ETH": {"max": 0.05, "min_amount": 10000}
            }
        elif risk_score <= 2.6:
            risk_category = "Conservative"
            risk_description = "Emphasis on stability with some growth potential"
            allocation = {
                "NIFTY50": {"max": 0.30, "min_amount": 50000},
                "GOLD": {"max": 0.40, "min_amount": 25000},
                "BTC": {"max": 0.10, "min_amount": 10000},
                "ETH": {"max": 0.10, "min_amount": 10000}
            }
        elif risk_score <= 3.4:
            risk_category = "Moderate"
            risk_description = "Balanced approach between stability and growth"
            allocation = {
                "NIFTY50": {"max": 0.40, "min_amount": 50000},
                "GOLD": {"max": 0.30, "min_amount": 25000},
                "BTC": {"max": 0.15, "min_amount": 10000},
                "ETH": {"max": 0.15, "min_amount": 10000}
            }
        elif risk_score <= 4.2:
            risk_category = "Aggressive"
            risk_description = "Growth-oriented with higher risk tolerance"
            allocation = {
                "NIFTY50": {"max": 0.50, "min_amount": 50000},
                "GOLD": {"max": 0.20, "min_amount": 25000},
                "BTC": {"max": 0.20, "min_amount": 10000},
                "ETH": {"max": 0.15, "min_amount": 10000}
            }
        else:
            risk_category = "Very Aggressive"
            risk_description = "Maximum growth potential with highest risk tolerance"
            allocation = {
                "NIFTY50": {"max": 0.60, "min_amount": 50000},
                "GOLD": {"max": 0.15, "min_amount": 25000},
                "BTC": {"max": 0.20, "min_amount": 10000},
                "ETH": {"max": 0.15, "min_amount": 10000}
            }

        # Calculate actual allocation based on investment amount
        actual_allocation = {}
        remaining_amount = investment_amount

        # First, allocate minimum amounts
        for asset, details in allocation.items():
            min_amount = details["min_amount"]
            if remaining_amount >= min_amount:
                actual_allocation[asset] = min_amount
                remaining_amount -= min_amount
            else:
                actual_allocation[asset] = 0

        # Then, distribute remaining amount according to max percentages
        if remaining_amount > 0:
            for asset, details in allocation.items():
                max_additional = (details["max"] * investment_amount) - actual_allocation[asset]
                if max_additional > 0:
                    allocated = min(remaining_amount, max_additional)
                    actual_allocation[asset] += allocated
                    remaining_amount -= allocated

        # Convert absolute amounts to percentages
        percentage_allocation = {
            asset: (amount / investment_amount) * 100 
            for asset, amount in actual_allocation.items()
        }

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
                    "investment_amount": investment_amount,
                    "asset_allocation": percentage_allocation,
                    "questionnaire_completed_at": datetime.utcnow()
                }
            }
        )

        return jsonify({
            "message": "Questionnaire submitted successfully",
            "risk_score": round(risk_score, 2),
            "risk_category": risk_category,
            "risk_description": risk_description,
            "investment_amount": investment_amount,
            "asset_allocation": percentage_allocation
        }), 200

    except Exception as e:
        print("Questionnaire submission error:", str(e))
        return jsonify({"message": "An error occurred during questionnaire submission"}), 500

@auth_blueprint.route("/user-portfolio", methods=["GET"])
def get_user_portfolio():
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

        # Get user data from database
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Return portfolio data
        portfolio_data = {
            "risk_score": user.get("risk_score"),
            "risk_category": user.get("risk_category"),
            "risk_description": user.get("risk_description"),
            "investment_amount": user.get("investment_amount"),
            "asset_allocation": user.get("asset_allocation", {}),
            "questionnaire_completed_at": user.get("questionnaire_completed_at")
        }

        return jsonify(portfolio_data), 200

    except Exception as e:
        print("Error fetching user portfolio:", str(e))
        return jsonify({"message": "An error occurred while fetching portfolio data"}), 500