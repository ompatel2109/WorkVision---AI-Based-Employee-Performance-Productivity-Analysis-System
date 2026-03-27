from pymongo import MongoClient
import bcrypt
from bson import ObjectId
from db import get_db
import datetime

class User:
    @staticmethod
    def create_user(name, email, password, role="employee", department=None):
        db = get_db()
        users = db.users
        
        if users.find_one({"email": email}):
            return None  # User already exists

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_data = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role,
            "department": department,
            "is_active": True,
            "is_verified": False, # Default to False
            "verification_token": None,
            "reset_token": None,
            "reset_token_expiry": None
        }
        
        result = users.insert_one(user_data)
        return str(result.inserted_id)

    @staticmethod
    def find_by_email(email):
        db = get_db()
        return db.users.find_one({"email": email})
    
    @staticmethod
    def find_by_id(user_id):
        db = get_db()
        return db.users.find_one({"_id": ObjectId(user_id)})

    @staticmethod
    def verify_password(stored_password, provided_password):
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)

    @staticmethod
    def update_user(user_id, data):
        db = get_db()
        users = db.users
        
        update_fields = {}
        if 'name' in data:
            update_fields['name'] = data['name']
        if 'department' in data:
            update_fields['department'] = data['department']
        if 'email' in data:
            update_fields['email'] = data['email']
        if 'role' in data:
            update_fields['role'] = data['role']
        
        if 'password' in data and data['password']:
             hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
             update_fields['password'] = hashed_password

        if 'is_active' in data:
            update_fields['is_active'] = data['is_active']
            
        if 'avatar' in data:
            update_fields['avatar'] = data['avatar']

        if not update_fields:
            return False

        result = users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )
        return result.matched_count > 0

    @staticmethod
    def verify_user(user_id):
        db = get_db()
        return db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_verified": True, "verification_token": None}}
        )

    @staticmethod
    def set_verification_token(user_id, token):
        db = get_db()
        return db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"verification_token": token}}
        )

    @staticmethod
    def find_by_verification_token(token):
        db = get_db()
        return db.users.find_one({"verification_token": token})

    @staticmethod
    def set_reset_token(email, token):
        db = get_db()
        # Set expiry to 1 hour from now
        import datetime
        expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        
        return db.users.update_one(
            {"email": email},
            {"$set": {"reset_token": token, "reset_token_expiry": expiry}}
        )

    @staticmethod
    def find_by_reset_token(token):
        db = get_db()
        user = db.users.find_one({"reset_token": token})
        
        if user:
            # Check expiry
            import datetime
            if user.get('reset_token_expiry') and user['reset_token_expiry'] > datetime.datetime.utcnow():
                return user
        return None

    @staticmethod
    def reset_password(user_id, new_password):
        db = get_db()
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        return db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "password": hashed_password, 
                "reset_token": None, 
                "reset_token_expiry": None
            }}
        )

class Performance:
    @staticmethod
    def add_entry(user_id, metrics):
        db = get_db()
        # metrics: { date, projects_completed, hours_worked, bugs_fixed, score, ... }
        entry = {
            "user_id": ObjectId(user_id),
            **metrics
        }
        return db.performance.insert_one(entry)

    @staticmethod
    def get_history(user_id):
        db = get_db()
        return list(db.performance.find({"user_id": ObjectId(user_id)}).sort("date", 1))

    @staticmethod
    def get_latest(user_id):
        db = get_db()
        return db.performance.find_one({"user_id": ObjectId(user_id)}, sort=[("date", -1)])

class Feedback:
    @staticmethod
    def add_feedback(manager_id, employee_id, message, type="positive", sentiment=None, sentiment_score=None):
        db = get_db()
        import datetime
        entry = {
            "manager_id": ObjectId(manager_id),
            "employee_id": ObjectId(employee_id),
            "message": message,
            "type": type,
            "sentiment": sentiment,           # "Positive" / "Neutral" / "Negative"
            "sentiment_score": sentiment_score, # VADER compound score (-1 to 1)
            "date": datetime.datetime.utcnow()
        }
        return db.feedback.insert_one(entry)

    @staticmethod
    def get_for_employee(employee_id):
        db = get_db()
        return list(db.feedback.find({"employee_id": ObjectId(employee_id)}).sort("date", -1))

class Notification:
    @staticmethod
    def create(user_id, title, message, notif_type="feedback"):
        db = get_db()
        entry = {
            "user_id": ObjectId(user_id),
            "title": title,
            "message": message,
            "type": notif_type,   # "feedback", "task", "system"
            "is_read": False,
            "created_at": datetime.datetime.utcnow()
        }
        return db.notifications.insert_one(entry)

    @staticmethod
    def get_for_user(user_id, limit=20):
        db = get_db()
        return list(db.notifications.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(limit))

    @staticmethod
    def get_unread_count(user_id):
        db = get_db()
        return db.notifications.count_documents({"user_id": ObjectId(user_id), "is_read": False})

    @staticmethod
    def mark_read(notification_id):
        db = get_db()
        return db.notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"is_read": True}}
        )

    @staticmethod
    def mark_all_read(user_id):
        db = get_db()
        return db.notifications.update_many(
            {"user_id": ObjectId(user_id), "is_read": False},
            {"$set": {"is_read": True}}
        )

class Department:
    @staticmethod
    def create_department(name, manager_id=None):
        db = get_db()
        if db.departments.find_one({"name": name}):
            return None
        
        entry = {
            "name": name,
            "manager_id": ObjectId(manager_id) if manager_id else None,
            "created_at": datetime.datetime.utcnow()
        }
        return db.departments.insert_one(entry).inserted_id

    @staticmethod
    def get_all():
        db = get_db()
        return list(db.departments.find())

    @staticmethod
    def update_manager(dept_id, manager_id):
        db = get_db()
        return db.departments.update_one(
            {"_id": ObjectId(dept_id)},
            {"$set": {"manager_id": ObjectId(manager_id)}}
        )

class SystemLog:
    @staticmethod
    def log_action(user_id, action, details=None):
        db = get_db()
        entry = {
            "user_id": ObjectId(user_id) if user_id else None,
            "action": action,
            "details": details,
            "timestamp": datetime.datetime.utcnow()
        }
        db.system_logs.insert_one(entry)

    @staticmethod
    def get_recent(limit=50):
        db = get_db()
        return list(db.system_logs.find().sort("timestamp", -1).limit(limit))

class WorkLog:
    @staticmethod
    def add_log(user_id, data):
        db = get_db()
        entry = {
            "user_id": ObjectId(user_id),
            "date": datetime.datetime.utcnow(),
            "tasks_assigned": data.get('tasks_assigned', 0),
            "tasks_completed": data.get('tasks_completed', 0),
            "hours_worked": data.get('hours_worked', 0),
            "deadline_adherence": data.get('deadline_adherence', 100),
            "task_complexity": data.get('task_complexity', 1),
            "delay_count": data.get('delay_count', 0),
            "notes": data.get('notes', ''),
            "created_at": datetime.datetime.utcnow()
        }
        return db.work_logs.insert_one(entry)

    @staticmethod
    def get_logs(user_id, limit=20):
        db = get_db()
        return list(db.work_logs.find({"user_id": ObjectId(user_id)}).sort("date", -1).limit(limit))

    @staticmethod
    def update_log(log_id, user_id, data):
        db = get_db()
        # Ensure user owns the log
        query = {"_id": ObjectId(log_id), "user_id": ObjectId(user_id)}
        
        update_fields = {}
        for key in ['tasks_assigned', 'tasks_completed', 'hours_worked', 'deadline_adherence', 'task_complexity', 'delay_count']:
            if key in data:
                update_fields[key] = data[key]
                
        if not update_fields:
            return False
            
        result = db.work_logs.update_one(query, {"$set": update_fields})
        return result.matched_count > 0

    @staticmethod
    def delete_log(log_id, user_id):
        db = get_db()
        result = db.work_logs.delete_one({"_id": ObjectId(log_id), "user_id": ObjectId(user_id)})
        return result.deleted_count > 0

class Task:
    @staticmethod
    def create_task(title, description, assigned_to, assigned_by, due_date):
        db = get_db()
        entry = {
            "title": title,
            "description": description,
            "assigned_to": ObjectId(assigned_to),
            "assigned_by": ObjectId(assigned_by),
            "status": "Pending", # Pending, Submitted, Completed, Rejected
            "proof_file": None,
            "due_date": datetime.datetime.fromisoformat(due_date) if due_date else None,
            "created_at": datetime.datetime.utcnow()
        }
        return db.tasks.insert_one(entry).inserted_id

    @staticmethod
    def get_by_assignee(user_id):
        db = get_db()
        return list(db.tasks.find({"assigned_to": ObjectId(user_id)}).sort("due_date", 1))

    @staticmethod
    def get_by_creator(user_id):
        db = get_db()
        return list(db.tasks.find({"assigned_by": ObjectId(user_id)}).sort("created_at", -1))
        
    @staticmethod
    def get_by_id(task_id):
        db = get_db()
        return db.tasks.find_one({"_id": ObjectId(task_id)})

    @staticmethod
    def submit_proof(task_id, file_path, hours_spent=0):
        db = get_db()
        return db.tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {
                "status": "Submitted", 
                "proof_file": file_path, 
                "submitted_at": datetime.datetime.utcnow(),
                "hours_spent": float(hours_spent)
            }}
        )

    @staticmethod
    def verify_task(task_id, status, feedback_score=None):  # status = Completed or Rejected
        db = get_db()
        update_data = {"status": status, "verified_at": datetime.datetime.utcnow()}
        if feedback_score is not None:
            update_data["feedback_score"] = float(feedback_score)
        return db.tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
