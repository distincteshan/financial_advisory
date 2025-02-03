# database/database_setup.py
from pymongo import MongoClient
from pymongo.errors import CollectionInvalid

def setup_database_schema():
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/')
    db = client['financial_advisory']  # Replace with your database name
    
    # Define the validator schema
    questionnaire_validator = {
        '$jsonSchema': {
            'bsonType': 'object',
            'required': ['user_id', 'age', 'retirement_age', 'monthly_investment', 
                        'risk_tolerance', 'investment_goals', 'created_at'],
            'properties': {
                'user_id': {
                    'bsonType': 'objectId',
                    'description': 'must be an objectId and is required'
                },
                'age': {
                    'bsonType': 'int',
                    'minimum': 18,
                    'maximum': 100,
                    'description': 'must be an integer between 18 and 100 and is required'
                },
                'retirement_age': {
                    'bsonType': 'int',
                    'minimum': 18,
                    'maximum': 100,
                    'description': 'must be an integer between 18 and 100 and is required'
                },
                'monthly_investment': {
                    'bsonType': 'number',
                    'minimum': 0,
                    'description': 'must be a positive number and is required'
                },
                'risk_tolerance': {
                    'enum': ['conservative', 'moderate', 'aggressive'],
                    'description': 'must be one of the specified values and is required'
                },
                'investment_goals': {
                    'bsonType': 'array',
                    'minItems': 1,
                    'items': {
                        'bsonType': 'string'
                    },
                    'description': 'must be an array of strings and is required'
                },
                'created_at': {
                    'bsonType': 'date',
                    'description': 'must be a date and is required'
                }
            }
        }
    }

    try:
        # Create collection with validation if it doesn't exist
        if "questionnaires" not in db.list_collection_names():
            db.create_collection("questionnaires", validator=questionnaire_validator)
            print("Collection created with schema validation")
        else:
            # Modify existing collection to add validation
            db.command('collMod', 'questionnaires', 
                      validator=questionnaire_validator, 
                      validationLevel='moderate')
            print("Schema validation updated successfully")
    except Exception as e:
        print(f"Error setting up schema validation: {e}")

    # Create indexes
    try:
        db.questionnaires.create_index([("user_id", 1)], unique=True)
        db.questionnaires.create_index([("created_at", 1)])
        print("Indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {e}")

if __name__ == "__main__":
    setup_database_schema()
