from flask import Blueprint, jsonify, request
import jwt
import os
import datetime
from services.supabase_client import supabase
from services.email_service import send_task_assigned_email, send_task_completed_email

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

    result = supabase.table("tasks").select(
        "*, creator:created_by(id, name, email, avatar_url), assignee:assigned_to(id, name, email, avatar_url)"
    ).execute()

    return jsonify(result.data)


@tasks_bp.route("/", methods=["POST"])
def create_task():
    user = get_current_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    title = data.get("title")
    description = data.get("description", "")
    assigned_to = data.get("assigned_to")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    task = supabase.table("tasks").insert({
        "title": title,
        "description": description,
        "created_by": user["user_id"],
        "assigned_to": assigned_to if assigned_to else None,
        "status": "pending"
    }).execute()

    created_task = task.data[0]

    # Send email notification if task is assigned
    if assigned_to:
        assignee = supabase.table("users").select(
            "*").eq("id", assigned_to).execute()
        creator = supabase.table("users").select(
            "*").eq("id", user["user_id"]).execute()
        if assignee.data and creator.data:
            send_task_assigned_email(
                assignee.data[0]["email"],
                assignee.data[0]["name"],
                title,
                description,
                creator.data[0]["name"]
            )

    return jsonify(created_task), 201


@tasks_bp.route("/<task_id>", methods=["PATCH"])
def update_task(task_id):
    user = get_current_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    status = data.get("status")

    allowed_statuses = ["pending", "in_progress", "completed"]
    if status not in allowed_statuses:
        return jsonify({"error": "Invalid status"}), 400

    updated = supabase.table("tasks").update({
        "status": status,
        "updated_at": datetime.datetime.utcnow().isoformat()
    }).eq("id", task_id).execute()

    updated_task = updated.data[0]

    # Send email if task completed
    if status == "completed":
        task_details = supabase.table("tasks").select(
            "*, creator:created_by(id, name, email), assignee:assigned_to(id, name, email)"
        ).eq("id", task_id).execute()

        if task_details.data:
            task = task_details.data[0]
            emails_to_notify = []

            if task.get("creator"):
                emails_to_notify.append(
                    (task["creator"]["email"], task["creator"]["name"]))
            if task.get("assignee"):
                emails_to_notify.append(
                    (task["assignee"]["email"], task["assignee"]["name"]))

            for email, name in emails_to_notify:
                send_task_completed_email(email, name, task["title"])

    return jsonify(updated_task)


@tasks_bp.route("/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    user = get_current_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    supabase.table("tasks").delete().eq("id", task_id).execute()
    return jsonify({"message": "Task deleted"})
