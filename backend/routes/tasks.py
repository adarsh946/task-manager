from flask import Blueprint, jsonify, request
import jwt  # type: ignore
import os

tasks_bp = Blueprint("tasks", __name__)
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


@tasks_bp.route("/", methods=["GET"])
def get_tasks():
    user = get_current_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"message": "tasks route working"})
