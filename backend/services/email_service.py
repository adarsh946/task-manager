import os
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

GMAIL_SENDER = os.getenv("GMAIL_SENDER")
GMAIL_REFRESH_TOKEN = os.getenv("GMAIL_REFRESH_TOKEN")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")


def get_gmail_service():
    creds = Credentials(
        token=None,
        refresh_token=GMAIL_REFRESH_TOKEN,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=["https://www.googleapis.com/auth/gmail.send"]
    )
    service = build("gmail", "v1", credentials=creds)
    return service


def send_email(to_email: str, subject: str, html_body: str):
    try:
        service = get_gmail_service()

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = GMAIL_SENDER
        message["To"] = to_email

        html_part = MIMEText(html_body, "html")
        message.attach(html_part)

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        service.users().messages().send(
            userId="me",
            body={"raw": raw}
        ).execute()

        print(f"[EMAIL] Sent to {to_email}: {subject}")
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")


def send_task_assigned_email(to_email, to_name, task_title, task_description, creator_name):
    subject = f"New Task Assigned: {task_title}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">New Task Assigned to You</h2>
        <p>Hi <strong>{to_name}</strong>,</p>
        <p><strong>{creator_name}</strong> has assigned you a new task:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">{task_title}</h3>
            <p style="margin: 0; color: #6b7280;">{task_description}</p>
        </div>
        <p>Login to your Task Manager to view and manage this task.</p>
        <p style="color: #9ca3af; font-size: 12px;">Task Manager App</p>
    </div>
    """
    send_email(to_email, subject, html_body)


def send_task_completed_email(to_email, to_name, task_title):
    subject = f"Task Completed: {task_title}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Task Completed ✅</h2>
        <p>Hi <strong>{to_name}</strong>,</p>
        <p>The following task has been marked as completed:</p>
        <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #22c55e;">
            <h3 style="margin: 0;">{task_title}</h3>
        </div>
        <p>Great work! 🎉</p>
        <p style="color: #9ca3af; font-size: 12px;">Task Manager App</p>
    </div>
    """
    send_email(to_email, subject, html_body)
