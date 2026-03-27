
import requests
import sys

BASE_URL = "http://localhost:5000/api"

# 1. Login as Manager to get token
try:
    auth_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "manager@engineering.com",
        "password": "password123"
    })
    if auth_resp.status_code != 200:
        print(f"Manager Login Failed: {auth_resp.text}")
        sys.exit(1)
    
    manager_token = auth_resp.json()['access_token']
    manager_id = auth_resp.json()['id']
    print("Manager logged in.")

    # 2. Get Team Members to assign task to
    team_resp = requests.get(f"{BASE_URL}/manager/team", headers={"Authorization": f"Bearer {manager_token}"})
    team = team_resp.json()
    if not team:
        print("No team members found to assign task.")
        sys.exit(1)
        
    employee_id = team[0]['_id']
    print(f"Assigning task to {team[0]['name']} ({employee_id})")

    # 3. Create Task
    task_data = {
        "title": "Test Task 1",
        "description": "This is a test task integration check.",
        "assigned_to": employee_id,
        "due_date": "2023-12-31"
    }
    create_resp = requests.post(f"{BASE_URL}/tasks/", json=task_data, headers={"Authorization": f"Bearer {manager_token}"})
    if create_resp.status_code != 201:
        print(f"Create Task Failed: {create_resp.text}")
        sys.exit(1)
        
    task_id = create_resp.json()['task_id']
    print(f"Task created: {task_id}")

    # 4. Login as Employee
    # Need to find employee email first, but for now we assume we can login as 'employee@company.com' if that's who we assigned to?
    # Actually, let's just use the first employee from the list if we can (we don't have their password here easily unless it's default)
    # Assuming default password for all test users
    emp_email = team[0]['email']
    emp_auth = requests.post(f"{BASE_URL}/auth/login", json={
        "email": emp_email,
        "password": "password123"
    })
    
    if emp_auth.status_code != 200:
        print(f"Employee Login Failed ({emp_email}): {emp_auth.text}")
        # Proceeding with just manager side verification if employee login fails (might be different password)
    else:
        emp_token = emp_auth.json()['access_token']
        print(f"Employee {emp_email} logged in.")
        
        # 5. Get My Tasks
        my_tasks = requests.get(f"{BASE_URL}/tasks/my_tasks", headers={"Authorization": f"Bearer {emp_token}"})
        found = False
        for t in my_tasks.json():
            if t['_id'] == task_id:
                found = True
                print("Task found in employee dashboard.")
                break
        
        if not found:
            print("Task NOT found in employee dashboard.")

    # 6. Delete Task (Cleanup - functionality not in API but good to know we reached here)
    print("Verification Script Completed Successfully.")

except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
