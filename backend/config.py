from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["financial_advisory"]
users_collection = db["users"]
