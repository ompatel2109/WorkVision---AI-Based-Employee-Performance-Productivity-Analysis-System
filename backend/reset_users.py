from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv
import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/employee_performance_db")

def reset_users():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    users_collection = db.users
    
    # Define users to fix/create
    users_to_fix = [
        {"email": "jim.sales@company.com", "name": "Jim Halpert", "role": "manager", "department": "Sales"},
        {"email": "sarah.marketing@company.com", "name": "Sarah Walker", "role": "manager", "department": "Marketing"},
        {"email": "toby.hr@company.com", "name": "Toby Flenderson", "role": "manager", "department": "HR"},
        {"email": "oscar.finance@company.com", "name": "Oscar Martinez", "role": "manager", "department": "Finance"},
        {"email": "manager@company.com", "name": "Michael Scott", "role": "manager", "department": "Engineering"},
        {"email": "employee@company.com", "name": "Dwight Schrute", "role": "employee", "department": "Sales"},
        {"email": "admin@company.com", "name": "Admin User", "role": "admin", "department": "IT"}
    ]
    
    password = "password123"
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    print(f"Connecting to {db.name}...")
    
    for u in users_to_fix:
        existing = users_collection.find_one({"email": u["email"]})
        
        if existing:
            print(f"Updating {u['email']}...")
            users_collection.update_one(
                {"email": u["email"]},
                {"$set": {
                    "password": hashed_password,
                    "is_verified": True,
                    "role": u["role"], # Ensure role is correct
                    "department": u["department"]
                }}
            )
        else:
            print(f"Creating {u['email']}...")
            new_user = {
                "name": u["name"],
                "email": u["email"],
                "password": hashed_password,
                "role": u["role"],
                "department": u["department"],
                "is_active": True,
                "is_verified": True,
                "created_at": datetime.datetime.utcnow()
            }
            users_collection.insert_one(new_user)
            
    print("All users updated/created successfully with password: password123")

if __name__ == "__main__":
    reset_users()
