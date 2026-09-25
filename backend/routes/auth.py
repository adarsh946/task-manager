from flask import Blueprint, redirect, request, jsonify
import requests
import os
import jwt  # type: ignore
import datetime
from services.supabase_client import supabase

auth_bp = Blueprint("auth", __name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL")
BACKEND_URL = os.getenv("BACKEND_URL")
JWT_SECRET = os.getenv("JWT_SECRET")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@auth_bp.route("/login")
def login():
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": f"{BACKEND_URL}/auth/callback",
        "response_type": "code",
        "scope": "openid email profile https://www.googleapis.com/auth/gmail.send",
        "access_type": "offline",
        "prompt": "consent"
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return redirect(f"{GOOGLE_AUTH_URL}?{query}")


@auth_bp.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "No code provided"}), 400

    # Exchange code for tokens
    token_response = requests.post(GOOGLE_TOKEN_URL, data={
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": f"{BACKEND_URL}/auth/callback",
        "grant_type": "authorization_code"
    })

    token_data = token_response.json()
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")

    if not access_token:
        return jsonify({"error": "Failed to get access token"}), 400

    # Get user info from Google
    user_response = requests.get(GOOGLE_USERINFO_URL, headers={
        "Authorization": f"Bearer {access_token}"
    })
    user_info = user_response.json()

    google_id = user_info.get("id")
    email = user_info.get("email")
    name = user_info.get("name")
    avatar_url = user_info.get("picture")

    # Check if user exists in Supabase
    existing = supabase.table("users").select(
        "*").eq("google_id", google_id).execute()

    if existing.data:
        # Update refresh token
        user = existing.data[0]
        supabase.table("users").update({
            "refresh_token": refresh_token
        }).eq("id", user["id"]).execute()
    else:
        # Create new user
        result = supabase.table("users").insert({
            "email": email,
            "name": name,
            "google_id": google_id,
            "avatar_url": avatar_url,
            "refresh_token": refresh_token
        }).execute()
        user = result.data[0]

    # Create JWT
    payload = {
        "user_id": user["id"],
        "email": email,
        "name": name,
        "avatar_url": avatar_url,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    # Redirect to frontend with token
    return redirect(f"{FRONTEND_URL}/auth/callback?token={token}")


@auth_bp.route("/me")
def me():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return jsonify(payload)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
