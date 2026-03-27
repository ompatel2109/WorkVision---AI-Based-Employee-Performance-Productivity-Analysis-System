from db import get_db
import sys

try:
    print("Attempting to connect to MongoDB...")
    db = get_db()
    # The ping command is cheap and does not require auth
    db.command('ping')
    print("SUCCESS: Successfully connected to MongoDB!")
except Exception as e:
    print(f"FAILURE: Could not connect to MongoDB. Error: {e}")
    sys.exit(1)
