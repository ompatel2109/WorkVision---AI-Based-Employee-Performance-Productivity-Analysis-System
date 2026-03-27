from models import User
from db import get_db

def seed_users():
    print("--- Seeding Users ---")
    db = get_db()
    
    # Clear existing users to avoid duplicates/stale data
    print("Clearing users collection...")
    db.users.delete_many({})
    
    # Create Admin
    print("Creating Admin...")
    admin_id = User.create_user('Admin User', 'admin@company.com', 'password123', 'admin', 'Management')
    User.verify_user(admin_id)
    
    # Create Employee
    print("Creating Employee...")
    emp_id = User.create_user('Employee User', 'employee@company.com', 'password123', 'employee', 'Engineering')
    User.verify_user(emp_id)

    # Create Manager
    print("Creating Manager...")
    mgr_id = User.create_user('Manager User', 'manager@company.com', 'password123', 'manager', 'Engineering')
    User.verify_user(mgr_id)
    
    # Verify
    print("\n--- Verification ---")
    admin = User.find_by_email('admin@company.com')
    if admin:
        print(f"Admin created: {admin['email']}")
        print(f"Password Check (password123): {User.verify_password(admin['password'], 'password123')}")
    else:
        print("Admin user NOT found!")

    emp = User.find_by_email('employee@company.com')
    if emp:
        print(f"Employee created: {emp['email']}")
    else:
        print("Employee user NOT found!")

if __name__ == "__main__":
    seed_users()
