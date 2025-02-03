from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["financial_advisory"]
users_collection = db["users"]
questionnaire_collection = db['questionnaires']

# JWT configuration
SECRET_KEY = 'your-secret-key'  # Change this in production
TOKEN_EXPIRATION = 24  # hours