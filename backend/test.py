# Test script
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['financial_advisory']  # Corrected database name

# Test connection
try:
    # List all collections
    collections = db.list_collection_names()
    print("Available collections:", collections)
    
    # Count users
    users_count = db.users.count_documents({})
    print(f"Number of users: {users_count}")
    
    # List one user (for testing)
    one_user = db.users.find_one({})
    if one_user:
        print("Sample user found:", {k: v for k, v in one_user.items() if k != 'password'})
    else:
        print("No users found in database")

except Exception as e:
    print(f"Error connecting to database: {e}")
