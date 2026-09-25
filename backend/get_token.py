from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
creds = flow.run_local_server(port=8090)

print("\n=== COPY THESE INTO YOUR .env ===")
print(f"GMAIL_REFRESH_TOKEN={creds.refresh_token}")
print(f"GMAIL_ACCESS_TOKEN={creds.token}")
