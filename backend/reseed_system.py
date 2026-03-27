from models import User, Department, Performance, SystemLog
from db import get_db
import random
import datetime
from bson import ObjectId

def seed_system():
    print("--- STARTING SYSTEM RESEED ---")
    db = get_db()
    
    # 1. Clear All Collections
    print("Clearing existing data...")
    db.users.delete_many({})
    db.departments.delete_many({})
    db.performance.delete_many({})
    db.feedback.delete_many({})
    db.system_logs.delete_many({})

    # 2. Create Departments
    print("Creating Departments...")
    dept_names = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance']
    depts = {}
    for name in dept_names:
        dept_id = Department.create_department(name)
        depts[name] = dept_id
        print(f"  - {name} created")

    # 3. Create Users
    print("Creating Users...")
    
    # Admin
    admin_id = User.create_user('Admin User', 'admin@productivai.com', 'admin123', 'admin', 'Management')
    User.verify_user(admin_id)
    print(f"  Admin: admin@productivai.com / admin123")

    # Managers
    managers = []
    for dept in dept_names:
        email = f"manager@{dept.lower()}.com"
        name = f"{dept} Manager"
        uid = User.create_user(name, email, 'password123', 'manager', dept)
        
        if uid:
            User.verify_user(uid)
            Department.update_manager(depts[dept], uid)
            print(f"  Manager ({dept}): {email} / password123")
            managers.append(uid)
        else:
             print(f"  Failed to create Manager ({dept})")

    # Employees (Bulk)
    employees = []
    for i in range(1, 16):
        dept = random.choice(dept_names)
        role = 'employee'
        email = f'employee{i}@productivai.com'
        name = f'Employee {i}'
        uid = User.create_user(name, email, 'user123', role, dept)
        User.verify_user(uid)
        employees.append({"id": uid, "dept": dept, "name": name})
        # print(f"  - Created {name} ({dept})")
    print(f"  Created {len(employees)} Employees (Password: user123)")

    # 4. Generate Performance Data
    print("Generating Performance History (Last 30 Days)...")
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=30)
    
    for emp in employees:
        current = start_date
        while current <= end_date:
            if current.weekday() < 5: # Weekdays only
                # Vary performance based on "luck" and random factors
                score_base = random.randint(60, 95)
                
                metrics = {
                    "date": current,
                    "score": score_base,
                    "projects_completed": 1 if random.random() > 0.8 else 0,
                    "hours_worked": round(random.uniform(6.5, 9.5), 1),
                    "bugs_fixed": random.randint(0, 5) if emp['dept'] == 'Engineering' else 0,
                    "task_completion_rate": random.randint(70, 100),
                    "deadline_adherence": random.randint(60, 100),
                    "efficiency_index": round(score_base / 10, 1)
                }
                Performance.add_entry(emp['id'], metrics)
                
                # ALSO Add WorkLog to ensure Dashboard "Summary" cards are populated
                if random.random() > 0.1: # 90% chance to have a log
                    from models import WorkLog
                    tasks_assigned = random.randint(3, 8)
                    tasks_completed = max(0, tasks_assigned - random.randint(0, 2))
                    work_data = {
                        "date": current,
                        "tasks_assigned": tasks_assigned,
                        "tasks_completed": tasks_completed,
                        "hours_worked": metrics['hours_worked'],
                        "deadline_adherence": metrics['deadline_adherence'],
                        "task_complexity": random.randint(1, 5),
                        "delay_count": random.randint(0, 2)
                    }
                    WorkLog.add_log(emp['id'], work_data)

            current += datetime.timedelta(days=1)
            
    print("  Performance history generated.")

    # 5. System Logs
    print("Generating Logs...")
    SystemLog.log_action(admin_id, "System Initialization", "Database seeded with sample data")
    if managers:
        SystemLog.log_action(managers[0], "Team Review", "Reviewed team performance")
    
    print("\n--- SYSTEM RESEED COMPLETE ---")
    print("Use these credentials to login:")
    print("  ADMIN:   admin@productivai.com  / admin123")
    print("  MANAGERS: manager@<department>.com / password123")
    print("            (e.g., manager@engineering.com)")
    print("  USER:    employee1@productivai.com / user123")
    print("---------------------------------------")

if __name__ == "__main__":
    seed_system()
