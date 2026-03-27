from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv
import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/employee_performance_db")

def fix_manager():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    users_collection = db.users
    
    target_email = "manager@company.com"
    
    print(f"Removing {target_email}...")
    users_collection.delete_many({"email": target_email})
    
    print(f"Recreating {target_email}...")
    password = "password123"
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    new_user = {
        "name": "Michael Scott",
        "email": target_email,
        "password": hashed_password,
        "role": "manager",
        "department": "Engineering",
        "is_active": True,
        "is_verified": True,
        "created_at": datetime.datetime.utcnow()
    }
    
    users_collection.insert_one(new_user)
    print("Done. User recreated.")

if __name__ == "__main__":
    fix_manager()
