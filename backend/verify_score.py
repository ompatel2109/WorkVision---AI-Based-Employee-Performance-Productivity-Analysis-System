
import urllib.request
import urllib.parse
import json
import sys
import time

BASE_URL = "http://localhost:5000/api"

def log(msg):
    with open("backend/verify_log.txt", "a") as f:
        f.write(msg + "\n")
    print(msg)

def make_request(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}
    
    if data is not None:
        if headers.get('Content-Type') == 'application/json':
            data = json.dumps(data).encode('utf-8')
        elif headers.get('Content-Type', '').startswith('multipart/form-data'):
             # Special handling needed, or use boundary. 
             # For simplicity, let's just use raw boundary construction if needed.
             pass
        else:
            data = urllib.parse.urlencode(data).encode('utf-8')
            
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in headers.items():
        req.add_header(k, v)
        
    try:
        with urllib.request.urlopen(req) as response:
            if response.status >= 400:
                raise Exception(f"HTTP Error {response.status}")
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_text = e.read().decode('utf-8')
        raise Exception(f"HTTP Error {e.code}: {err_text}")
    except Exception as e:
        raise Exception(f"Request Error: {e}")

def multipart_upload(url, headers, fields, files):
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = []
    
    for key, value in fields.items():
        body.append(f'--{boundary}')
        body.append(f'Content-Disposition: form-data; name="{key}"')
        body.append('')
        body.append(str(value))
        
    for key, (filename, content) in files.items():
        body.append(f'--{boundary}')
        body.append(f'Content-Disposition: form-data; name="{key}"; filename="{filename}"')
        body.append('Content-Type: text/plain')
        body.append('')
        body.append(content)
        
    body.append(f'--{boundary}--')
    body.append('')
    
    data = '\r\n'.join(body).encode('utf-8')
    headers['Content-Type'] = f'multipart/form-data; boundary={boundary}'
    
    return make_request(url, method='POST', data=data, headers=headers)

if __name__ == "__main__":
    # Clear log
    with open("backend/verify_log.txt", "w") as f:
        f.write("Starting...\n")

    try:
        log("--- Starting Score Integration Verification (urllib) ---")

        # 0. Login Employee to get ID (and verify creds)
        emp_email = "employee1@productivai.com"
        emp_password = "user123"
        emp_auth = make_request(
            f"{BASE_URL}/auth/login", 
            method='POST',
            data={"email": emp_email, "password": emp_password},
            headers={'Content-Type': 'application/json'}
        )
        emp_token = emp_auth['access_token']
        emp_id = emp_auth['id']
        log(f"Employee logged in. ID: {emp_id}")

        # 1. Login Manager
        mgr_auth = make_request(
            f"{BASE_URL}/auth/login", 
            method='POST', 
            data={"email": "manager@engineering.com", "password": "password123"},
            headers={'Content-Type': 'application/json'}
        )
        mgr_token = mgr_auth['access_token']
        log("Manager logged in.")

        # 3. Assign Task
        task_data = {
            "title": "Score Test Task",
            "description": "Testing score update logic.",
            "assigned_to": emp_id,
            "due_date": "2024-12-31"
        }
        create_resp = make_request(
            f"{BASE_URL}/tasks/", 
            method='POST',
            data=task_data, 
            headers={"Authorization": f"Bearer {mgr_token}", 'Content-Type': 'application/json'}
        )
        task_id = create_resp['task_id']
        log(f"Task Assigned: {task_id}")

        # 5. Submit Proof with Hours Spent (using emp_token from step 0)
        submit_resp = multipart_upload(
            f"{BASE_URL}/tasks/{task_id}/submit",
            headers={"Authorization": f"Bearer {emp_token}"},
            fields={'hours_spent': 5.5},
            files={'file': ('proof.txt', 'proof content')}
        )
        log("Task Submitted with 5.5 hours.")

        # 6. Verify Task (Manager)
        verify_resp = make_request(
            f"{BASE_URL}/tasks/{task_id}/verify",
            method='POST',
            headers={"Authorization": f"Bearer {mgr_token}", 'Content-Type': 'application/json'},
            data={"status": "Completed"}
        )
        log("Task Verified (Completed).")

        # 7. Check Dashboard (Employee)
        time.sleep(1)
        dash_data = make_request(
            f"{BASE_URL}/employee/dashboard",
            headers={"Authorization": f"Bearer {emp_token}"}
        )
        
        log("\n--- Dashboard Data ---")
        log(f"Current Score: {dash_data['current_score']}")
        log(f"Category: {dash_data['performance_category']}")
        log(f"Summary: {dash_data['summary']}")

        # Validation
        summary = dash_data['summary']
        if summary['tasks_completed'] >= 1 and summary['hours_worked'] >= 5.5:
            log("\nSUCCESS: Dashboard reflects the new task data!")
        else:
            log("\nFAILURE: Dashboard data does not match expected values.")
            sys.exit(1)

    except Exception as e:
        log(f"An error occurred: {e}")
        sys.exit(1)
