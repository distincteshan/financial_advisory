# routes/questionnaire.py
from flask import Blueprint, request, jsonify
from config import questionnaire_collection
from utils.auth_middleware import token_required
from database.questionnaire_db import QuestionnaireDB
from bson.errors import InvalidId

questionnaire_blueprint = Blueprint("questionnaire", __name__)
questionnaire_db = QuestionnaireDB(questionnaire_collection)

@questionnaire_blueprint.route("/submit", methods=["POST"])
@token_required
def submit_questionnaire():
    try:
        data = request.json
        
        # Basic validation
        required_fields = ['age', 'retirement_age', 'monthly_investment', 
                         'risk_tolerance', 'investment_goals']
        if not all(field in data for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400

        # Get user_id from token (assuming it's added by auth middleware)
        user_id = request.user_id  # You'll need to modify auth middleware to add this

        # Add user_id to data
        data['user_id'] = user_id

        # Check if questionnaire already exists
        existing = questionnaire_db.get_questionnaire(user_id)
        
        if existing:
            # Update existing questionnaire
            result = questionnaire_db.update_questionnaire(user_id, data)
            return jsonify({
                'message': 'Questionnaire updated successfully',
                'result': result
            }), 200
        else:
            # Create new questionnaire
            result = questionnaire_db.create_questionnaire(data)
            return jsonify({
                'message': 'Questionnaire submitted successfully',
                'result': result
            }), 201

    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except InvalidId:
        return jsonify({'message': 'Invalid user ID'}), 400
    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

@questionnaire_blueprint.route("/get/<user_id>", methods=["GET"])
@token_required
def get_questionnaire(user_id):
    try:
        questionnaire = questionnaire_db.get_questionnaire(user_id)
        if questionnaire:
            return jsonify(questionnaire), 200
        return jsonify({'message': 'Questionnaire not found'}), 404
    except InvalidId:
        return jsonify({'message': 'Invalid user ID'}), 400
    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500
