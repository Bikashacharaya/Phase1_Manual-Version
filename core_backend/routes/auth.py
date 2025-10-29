from flask import Blueprint, request, jsonify, current_app
from extensions import mongo
from utils import hash_password, verify_password, generate_jwt
from bson.objectid import ObjectId
from datetime import datetime

auth_bp = Blueprint("auth", __name__, url_prefix="/v1/auth")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student").lower()
    if not username or not email or not password:
        return jsonify({"error": "username, email and password required"}), 400

    # basic role validation
    if role not in ("student", "staff", "admin"):
        return jsonify({"error": "role must be one of student, staff, admin"}), 400

    users = mongo.db.users
    if users.find_one({"email": email}):
        return jsonify({"error": "email already exists"}), 409
    pw_hash = hash_password(password)

    res = users.insert_one({
        "username": username,
        "email": email,
        "password": pw_hash,
        "role": role,
        "created_at": datetime.utcnow()
    })
    user = users.find_one({"_id": res.inserted_id}, {"password": 0})
    return jsonify({"message": "user created",
                    "user": {"id": str(user["_id"]), "username": user["username"], "email": user["email"],
                             "role": user["role"]}}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    users = mongo.db.users
    user = users.find_one({"email": email})
    if not user or not verify_password(user.get("password", ""), password):
        return jsonify({"error": "invalid credentials"}), 401

    payload = {
        "user_id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user["role"]
    }
    token = generate_jwt(payload)
    return jsonify({"access_token": token, "user": payload}), 200
