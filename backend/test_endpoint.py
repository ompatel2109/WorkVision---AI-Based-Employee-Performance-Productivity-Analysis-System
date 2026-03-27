import urllib.request
import urllib.error
import sys

# Get token from app
sys.path.append('backend')
from app import app
from flask_jwt_extended import create_access_token

with app.app_context():
    token = create_access_token(identity="manager_id")

req = urllib.request.Request(
    'http://localhost:5000/api/manager/employee/6992d262705fbb1cdf378a5e',
    headers={'Authorization': f'Bearer {token}'}
)
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    with open('backend/trace.html', 'wb') as f:
        f.write(e.read())
    print("Dumped to trace.html")
except Exception as e:
    print(f"ERROR: {str(e)}")
