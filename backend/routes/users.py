from flask import Blueprint, jsonify, request
import jwt  # type: ignore
import os
from services.supabase_client import supabase

users_bp = Blueprint("users", __name__)
JWT_SECRET = os.getenv("JWT_SECRET")


def get_current_user(req):
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except:
        return None


@users_bp.route("/")
def list_users():
    user = get_current_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    result = supabase.table("users").select(
        "id, name, email, avatar_url").execute()
    return jsonify(result.data)
