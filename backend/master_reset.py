from pymongo import MongoClient
from db import get_db
from seed_users import seed_users
import os
from dotenv import load_dotenv

load_dotenv()

def master_reset():
    print("!!! MASTER SYSTEM RESET INITIATED !!!")
    
    # 1. Connect and Wipe DB
    db = get_db()
    print(f"Connected to DB: {db.name}")
    
    collections = db.list_collection_names()
    print(f"Found collections: {collections}")
    
    for col in collections:
        print(f"Dropping collection: {col}")
        db[col].drop()
        
    print("Database completely wiped.")
    
    # 2. Re-Seed Users
    print("\nRe-seeding initial users...")
    seed_users()
    
    print("\n------------------------------------------------")
    print("SYSTEM RESET COMPLETE")
    print("1. Admin: admin@company.com / password123")
    print("2. Manager: manager@company.com / password123")
    print("3. Employee: employee@company.com / password123")
    print("------------------------------------------------")

if __name__ == "__main__":
    master_reset()
