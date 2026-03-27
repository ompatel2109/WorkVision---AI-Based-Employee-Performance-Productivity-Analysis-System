
import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:5000/api"

def log(msg):
    print(msg)

def make_request(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}
    
    if data is not None:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
            
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in headers.items():
        req.add_header(k, v)
        
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_text = e.read().decode('utf-8')
        raise Exception(f"HTTP Error {e.code}: {err_text}")

if __name__ == "__main__":
    try:
        log("--- Reproducing User Update Issue ---")

        # 1. Login Admin
        admin_auth = make_request(
            f"{BASE_URL}/auth/login", 
            method='POST', 
            data={"email": "admin@company.com", "password": "password123"}
        )
        admin_token = admin_auth['access_token']
        log("Admin logged in.")

        # 2. Create Temp User
        user_data = {
            "name": "Temp User",
            "email": "temp@test.com",
            "password": "password123",
            "role": "employee",
            "department": "Engineering"
        }
        create_resp = make_request(
            f"{BASE_URL}/admin/users", 
            method='POST',
            data=user_data, 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        user_id = create_resp['user_id']
        log(f"Temp User Created: {user_id} (Role: employee)")

        # 3. Attempt to Update Role and Email
        update_data = {
            "role": "manager",
            "email": "temp_updated@test.com",
            "name": "Temp User Updated"
        }
        log(f"Attempting to update to: {update_data}")
        
        make_request(
            f"{BASE_URL}/admin/users/{user_id}",
            method='PUT',
            data=update_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        log("Update request sent.")

        # 4. Verify Updates
        # We need to fetch all users and find this one, or just check via DB if we had direct access.
        # Since we have admin access, let's fetch all users and find the one with the ID.
        users = make_request(
            f"{BASE_URL}/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        target_user = next((u for u in users if u['_id'] == user_id), None)
        
        if not target_user:
            log("Error: User not found after update.")
            sys.exit(1)

        log(f"Fetched User Data: Role={target_user['role']}, Email={target_user['email']}, Name={target_user['name']}")

        # Check if updates were applied
        failures = []
        if target_user['role'] != 'manager': failures.append("Role not updated")
        if target_user['email'] != 'temp_updated@test.com': failures.append("Email not updated")
        if target_user['name'] != 'Temp User Updated': failures.append("Name not updated")

        if failures:
            log(f"FAILURE: The following updates failed: {', '.join(failures)}")
            
            # Cleanup
            make_request(f"{BASE_URL}/admin/users/{user_id}", method='DELETE', headers={"Authorization": f"Bearer {admin_token}"})
            sys.exit(1)
        else:
            log("SUCCESS: All updates applied correctly!")
            
            # Cleanup
            make_request(f"{BASE_URL}/admin/users/{user_id}", method='DELETE', headers={"Authorization": f"Bearer {admin_token}"})
            sys.exit(0)

    except Exception as e:
        log(f"An error occurred: {e}")
        # Try to cleanup if user_id exists
        if 'user_id' in locals():
             try:
                make_request(f"{BASE_URL}/admin/users/{user_id}", method='DELETE', headers={"Authorization": f"Bearer {admin_token}"})
             except: pass
        sys.exit(1)
