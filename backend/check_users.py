from db import get_db
import sys

try:
    db = get_db()
    users = list(db.users.find({}, {'name': 1, 'email': 1, 'role': 1, '_id': 0}))
    print("Users found:", len(users))
    for u in users:
        print(u)
except Exception as e:
    print(f"Error: {e}")
