import sys
from bson import ObjectId
from pymongo import MongoClient
import pprint

client = MongoClient('mongodb://localhost:27017/')
db = client['employee_performance_db']

# Find OM PATEL
emp = db.users.find_one({"email": "23cs071@charusat.edu.in", "role": "employee"})
if not emp:
    print("Employee OM PATEL not found")
    sys.exit(1)

print(f"Employee ID: {emp['_id']}")
emp_id = str(emp['_id'])
emp_oid = emp['_id']

print("\n--- Tasks with assigned_to as string ---")
tasks_str = list(db.tasks.find({"assigned_to": emp_id}))
print(f"Count: {len(tasks_str)}")

print("\n--- Tasks with assigned_to as ObjectId ---")
tasks_oid = list(db.tasks.find({"assigned_to": emp_oid}))
print(f"Count: {len(tasks_oid)}")
if tasks_oid:
    status_counts = {}
    for t in tasks_oid:
        st = t.get('status')
        status_counts[st] = status_counts.get(st, 0) + 1
    print(f"Status distribution: {status_counts}")

print("\n--- Performance with user_id as string ---")
perf_str = list(db.performance.find({"user_id": emp_id}))
print(f"Count: {len(perf_str)}")

print("\n--- Performance with user_id as ObjectId ---")
perf_oid = list(db.performance.find({"user_id": emp_oid}))
print(f"Count: {len(perf_oid)}")

if perf_str:
    print("\nSample performance (string):")
    pprint.pprint(perf_str[0])
elif perf_oid:
    print("\nSample performance (ObjectId):")
    pprint.pprint(perf_oid[0])

client.close()
