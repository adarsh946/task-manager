# from routes.users import users_bp
# from routes.tasks import tasks_bp
# from routes.auth import auth_bp
from flask import Flask
import os
from flask_cors import CORS
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[os.getenv("FRONTEND_URL")])

# app.register_blueprint(auth_bp, url_prefix="/auth")
# app.register_blueprint(users_bp, url_prefix="/users")
# app.register_blueprint(tasks_bp, url_prefix="/tasks")


@app.route("/")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(debug=True, port=5000)
