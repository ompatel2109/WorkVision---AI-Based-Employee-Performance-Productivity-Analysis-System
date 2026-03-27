from db import get_db
from models import User

print("--- Clearing Unverified Users ---")
db = get_db()
result = db.users.delete_many({"is_verified": False})

print(f"Deleted {result.deleted_count} unverified users.")
print("You can now sign up again with the same email.")
