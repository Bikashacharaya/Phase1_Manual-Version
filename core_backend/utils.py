from functools import wraps
from flask import request, jsonify, current_app, g
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from bson import ObjectId


def hash_password(password: str) -> str:
    return generate_password_hash(password)


def verify_password(pw_hash: str, password: str) -> bool:
    return check_password_hash(pw_hash, password)


def generate_jwt(payload: dict) -> str:
    exp = datetime.utcnow() + timedelta(seconds=current_app.config["JWT_EXP_DELTA_SECONDS"])
    data = {"exp": exp, **payload}
    token = jwt.encode(data, current_app.config["SECRET_KEY"], algorithm=current_app.config["JWT_ALGORITHM"])

    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def decode_jwt(token: str):
    try:
        data = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=[current_app.config["JWT_ALGORITHM"]])
        return data
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Allow CORS preflight through without requiring auth
        if request.method == "OPTIONS":
            return f(*args, **kwargs)

        auth = request.headers.get("Authorization", None)
        if not auth or not auth.startswith("Bearer"):
            return jsonify({"error": "Authorization header missing or invalid"}), 401

        token = auth.split(" ", 1)[1]
        payload = decode_jwt(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401

        g.user = payload
        return f(*args, **kwargs)
    return wrapper



def roles_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = getattr(g, "user", None)
            if not user:
                return jsonify({"error": "Authentication required"}), 401
            if user.get("role") not in allowed_roles:
                return jsonify({"error": "Forbidden: insufficient role"}), 403
            return f(*args, **kwargs)

        return wrapper

    return decorator

def to_json(doc):
    if isinstance(doc, list):
        return [to_json(d) for d in doc]
    if isinstance(doc, dict):
        return {k: to_json(v) for k, v in doc.items()}
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc
