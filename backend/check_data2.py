import sys
from bson import ObjectId
from pymongo import MongoClient
import pprint

client = MongoClient('mongodb://localhost:27017/')
db = client['employee_performance_db']

emp_id_str = "6992d262705fbb1cdf378a5e"
emp_oid = ObjectId(emp_id_str)

print(f"--- Checking Employee ID: {emp_id_str} ---")
perf = list(db.performance.find({"user_id": emp_oid}))
print(f"Performance count: {len(perf)}")
if perf:
    pprint.pprint(perf[0])
else:
    print("No performance history found for this ID.")

client.close()
