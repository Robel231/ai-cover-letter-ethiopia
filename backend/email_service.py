import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")

def send_welcome_email(to_email: str):
    if not all([SMTP_USERNAME, SMTP_PASSWORD]):
        print("SMTP username/password not configured.")
        return

    msg = MIMEMultipart('alternative')
    msg['Subject'] = "Welcome to AI Job Tools! "
    msg['From'] = f"AI Job Tools <{SMTP_USERNAME}>"
    msg['To'] = to_email
    html_body = f"<h1>Welcome, {to_email}!</h1><p>You've received 20 free credits to get started.</p>"
    msg.attach(MIMEText(html_body, 'html'))

    try:
        print("Connecting to smtp.gmail.com...")
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, to_email, msg.as_string())
        print("Email sent successfully.")
    except Exception as e:
        print(f"Error sending email: {e}")