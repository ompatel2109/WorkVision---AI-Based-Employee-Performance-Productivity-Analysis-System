import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
PORT = int(os.getenv("MAIL_PORT", 587))
USERNAME = os.getenv("MAIL_USERNAME")
PASSWORD = os.getenv("MAIL_PASSWORD")

print("--- SMTP Debug Script ---")
print(f"Server: {SERVER}:{PORT}")
print(f"Username: {USERNAME}")
print(f"Password: {'*' * len(PASSWORD) if PASSWORD else 'NOT SET'}")

if not USERNAME or not PASSWORD:
    print("Error: MAIL_USERNAME or MAIL_PASSWORD not set in .env")
    exit(1)

try:
    print("\n1. Connecting to server...")
    server = smtplib.SMTP(SERVER, PORT)
    server.set_debuglevel(1) # Show full debug output
    
    print("\n2. Starting TLS...")
    server.starttls()
    
    print("\n3. Logging in...")
    server.login(USERNAME, PASSWORD)
    print("Login SUCCESS!")
    
    print("\n4. Sending test email...")
    msg = MIMEText("This is a test email from your WorkVision backend debug script.")
    msg['Subject'] = "WorkVision SMTP Test"
    msg['From'] = USERNAME
    msg['To'] = USERNAME # Send to self
    
    server.sendmail(USERNAME, [USERNAME], msg.as_string())
    print("Email sent SUCCESS!")
    
    server.quit()
    print("\n--- Verification Complete: Credentials work! ---")

except Exception as e:
    print(f"\n[ERROR] SMTP Failed: {e}")
    print("\nTroubleshooting Tips:")
    print("1. Check if 'App Password' is correct (not your normal Google login password).")
    print("2. Ensure 2-Step Verification is ON in Google Account.")
    print("3. Check for firewalls blocking port 587.")

