from pymongo import MongoClient
import datetime
from werkzeug.security import generate_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["employee_performance_db"]

managers = [
    {
        "name": "Sarah Connor",
        "email": "sarah.marketing@company.com",
        "password": "password123",
        "role": "manager",
        "department": "Marketing",
        "position": "Marketing Lead"
    },
    {
        "name": "Toby Flenderson",
        "email": "toby.hr@company.com",
        "password": "password123",
        "role": "manager",
        "department": "HR",
        "position": "HR Manager"
    },
    {
        "name": "Oscar Martinez",
        "email": "oscar.finance@company.com",
        "password": "password123",
        "role": "manager",
        "department": "Finance",
        "position": "Finance Manager"
    },
    {
        "name": "Jim Halpert",
        "email": "jim.sales@company.com",
        "password": "password123",
        "role": "manager",
        "department": "Sales",
        "position": "Sales Manager"
    }
]

print("Seeding Managers...")

for mgr in managers:
    if db.users.find_one({"email": mgr["email"]}):
        print(f"Manager {mgr['email']} already exists.")
    else:
        user_doc = {
            "name": mgr["name"],
            "email": mgr["email"],
            "password": generate_password_hash(mgr["password"]),
            "role": mgr["role"],
            "department": mgr["department"],
            "position": mgr["position"],
            "created_at": datetime.datetime.utcnow(),
            "is_verified": True
        }
        db.users.insert_one(user_doc)
        print(f"Created manager: {mgr['email']}")

print("Done.")
