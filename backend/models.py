from config import users_collection

def create_user(user):
    users_collection.insert_one(user)

def find_user_by_username(username):
    return users_collection.find_one({"username": username})
