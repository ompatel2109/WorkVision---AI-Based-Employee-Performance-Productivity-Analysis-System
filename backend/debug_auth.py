from models import User
from db import get_db
import bcrypt

def debug_auth():
    print("--- Debugging Auth ---")
    db = get_db()
    users = list(db.users.find())
    print(f"Found {len(users)} users in database.")
    
    for u in users:
        print(f"User: {u['email']}, Role: {u['role']}")
        
    # Test Admin Password
    admin = User.find_by_email('admin@company.com')
    if admin:
        print("\nTesting admin password 'password123'...")
        is_valid = User.verify_password(admin['password'], 'password123')
        print(f"Password Valid: {is_valid}")
        
        # specific debugging
        stored_hash = admin['password']
        print(f"Stored Hash Type: {type(stored_hash)}")
        # print(f"Stored Hash: {stored_hash}") 
    else:
        print("Admin user not found!")

if __name__ == "__main__":
    debug_auth()
