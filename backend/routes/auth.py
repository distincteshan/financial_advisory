from flask import Blueprint, request, jsonify
from config import users_collection
from utils.hash_password import hash_password, check_password

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
        "password": hashed_pw
    }
    users_collection.insert_one(user)

    return jsonify({"message": "User created successfully"}), 201
