# database/questionnaire_db.py
from datetime import datetime
from bson import ObjectId
from pymongo.collection import Collection
from typing import Dict, Any, Optional

class QuestionnaireDB:
    def __init__(self, collection: Collection):
        self.collection = collection

    def create_questionnaire(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new questionnaire entry"""
        questionnaire = {
            'user_id': ObjectId(data['user_id']),
            'age': int(data['age']),
            'retirement_age': int(data['retirement_age']),
            'monthly_investment': float(data['monthly_investment']),
            'risk_tolerance': data['risk_tolerance'],
            'investment_goals': data['investment_goals'],
            'created_at': datetime.utcnow()
        }
        
        result = self.collection.insert_one(questionnaire)
        return {'_id': str(result.inserted_id)}

    def get_questionnaire(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve questionnaire by user_id"""
        questionnaire = self.collection.find_one({'user_id': ObjectId(user_id)})
        if questionnaire:
            questionnaire['_id'] = str(questionnaire['_id'])
            questionnaire['user_id'] = str(questionnaire['user_id'])
            return questionnaire
        return None

    def update_questionnaire(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update existing questionnaire"""
        update_data = {
            'age': int(data['age']),
            'retirement_age': int(data['retirement_age']),
            'monthly_investment': float(data['monthly_investment']),
            'risk_tolerance': data['risk_tolerance'],
            'investment_goals': data['investment_goals'],
            'updated_at': datetime.utcnow()
        }
        
        result = self.collection.update_one(
            {'user_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        return {
            'modified_count': result.modified_count,
            'matched_count': result.matched_count
        }
