from pymongo import MongoClient
import os
from dotenv import load_dotenv
import sys

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/employee_performance_db")

def inspect():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    users = db.users
    
    print(f"Searching for manager@company.com...")
    
    # Case insensitive search
    found_users = list(users.find({"email": {"$regex": "^manager@company.com$", "$options": "i"}}))
    
    with open("manager_details.txt", "w") as f:
        f.write(f"Found {len(found_users)} users matching 'manager@company.com'\n")
        for u in found_users:
            f.write(f"ID: {u['_id']}\n")
            f.write(f"Name: {u.get('name')}\n")
            f.write(f"Email: {u.get('email')}\n")
            f.write(f"Role: {u.get('role')}\n")
            f.write(f"Department: {u.get('department')}\n")
            f.write(f"Is Verified: {u.get('is_verified')}\n")
            f.write(f"Password Hash (prefix): {str(u.get('password'))[:10]}...\n")
            f.write("-" * 20 + "\n")

if __name__ == "__main__":
    inspect()
