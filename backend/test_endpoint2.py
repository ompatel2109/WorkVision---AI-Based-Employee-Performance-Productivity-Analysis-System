import sys
sys.path.append('backend')
from app import app
from routes.manager_routes import get_employee_detail
from flask_jwt_extended import create_access_token
import traceback
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['employee_performance_db']
manager = db.users.find_one({"role": "manager"})
if not manager:
    print("NO MANAGER FOUND!")
    sys.exit(1)

manager_id = str(manager['_id'])

with app.app_context():
    token = create_access_token(identity=manager_id)

with app.test_request_context('/api/manager/employee/6992d262705fbb1cdf378a5e', headers={'Authorization': f'Bearer {token}'}):
    try:
        get_employee_detail('6992d262705fbb1cdf378a5e')
        print("SUCCESS")
    except Exception as e:
        with open('backend/trace3.txt', 'w') as f:
            traceback.print_exc(file=f)
