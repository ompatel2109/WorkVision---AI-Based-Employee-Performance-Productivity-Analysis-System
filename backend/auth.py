from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User
from db import get_db

auth_bp = Blueprint('auth', __name__)

import dns.resolver
import secrets
import os
from flask_mail import Message
from flask import current_app
from bson import ObjectId

def is_valid_email_domain(email):
    domain = email.split('@')[-1]
    try:
        # Check for MX records
        dns.resolver.resolve(domain, 'MX')
        return True
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers):
        return False
    except Exception:
        return False

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    role = data.get('role', 'employee').lower()
    email = data.get('email')
    password = data.get('password')
    department = data.get('department')

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    # Strict Email Validation
    if not is_valid_email_domain(email):
         return jsonify({"error": "Invalid email domain. Please use a valid email address."}), 400

    # Validate Department
    if department:
        from models import Department
        db = get_db()
        if not db.departments.find_one({"name": department}):
            return jsonify({"error": "Invalid department selected. Please choose from the list."}), 400

    user_id = User.create_user(name, email, password, role, department)
    
    if not user_id:
        # Check if it was a duplicate
        if User.find_by_email(email):
             return jsonify({"error": "User already exists"}), 409
        return jsonify({"error": "Failed to create user"}), 500

    # Generate Verification Token
    token = secrets.token_urlsafe(32)
    User.set_verification_token(user_id, token)

    # SEND REAL EMAIL
    try:
        # Dynamic Frontend URL: Use the Origin of the request (e.g., http://192.168.x.x:8080)
        # Fallback to configured env var or localhost
        request_origin = request.headers.get('Origin')
        frontend_url = request_origin if request_origin else os.getenv('FRONTEND_URL', 'http://localhost:8080')
        
        link = f"{frontend_url}/verify-email?token={token}"
        msg = Message(
            subject="Verify your WorkVision Account",
            recipients=[email],
            body=f"Hello {name},\n\nPlease verify your account by clicking the link below:\n\n{link}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nWorkVision Team"
        )
        current_app.mail.send(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")
        # Rollback: Delete the user so they can try again
        get_db().users.delete_one({"_id": ObjectId(user_id)})
        return jsonify({"error": f"Failed to send verification email. Please check your email address or try again later. (Error: {str(e)})"}), 500

    return jsonify({"message": "Registration successful. Please check your email to verify your account."}), 201

    return jsonify({"message": "Registration successful. Please check your email to verify your account."}), 201

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({"error": "Missing token"}), 400
        
    user = User.find_by_verification_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 400
        
    User.verify_user(user['_id'])
    return jsonify({"message": "Email verified successfully"}), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.find_by_email(email)
        
        if user:
            # Check verification status
            if not user.get('is_verified', False):
                 return jsonify({"error": "Email not verified. Please check your inbox."}), 403

            print(f"DEBUG: Found user {email}")
            is_valid = User.verify_password(user['password'], password)
            print(f"DEBUG: Password verification: {is_valid}")
            if is_valid:
                # Create JWT token
                # Create JWT token (Store only ID as identity for robustness)
                print(f"DEBUG: Creating token for {email} with role {user['role']}")
                access_token = create_access_token(identity=str(user['_id']))
                return jsonify({"access_token": access_token, "role": user['role'].lower(), "name": user['name'], "id": str(user['_id'])}), 200
            else:
                print("DEBUG: Password mismatch")
        else:
            print(f"DEBUG: User {email} NOT found")
            # List all users to see what IS there
            try:
                from db import get_db
                db = get_db()
                users_in_db = list(db.users.find({}, {"email": 1, "_id": 0}))
                print(f"DEBUG: Users currently in DB: {users_in_db}")
            except Exception as e:
                print(f"DEBUG: DB Error logging users: {e}")

        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Login Error: {e}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    # Fetch latest data from DB using ID
    try:
        from db import get_db
        db = get_db()
        user = db.users.find_one({"_id": ObjectId(current_user_id)})
        
        if not user:
             return jsonify({"error": "User not found"}), 404
             
        user_data = {
            "id": str(user['_id']),
            "name": user['name'],
            "email": user['email'],
            "role": user['role'].lower(),
            "department": user.get('department'),
            "avatar": user.get('avatar')
        }
        return jsonify(user_data), 200
    except Exception as e:
        print(f"Error in /me: {e}")
        return jsonify({"error": "Internal Error"}), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@jwt_required()

def update_profile():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    success = User.update_user(current_user_id, data)
    
    if success:
        return jsonify({"message": "Profile updated successfully"}), 200
    else:
        return jsonify({"message": "No changes made or user not found"}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
        
    user = User.find_by_email(email)
    if not user:
        # Don't reveal if user exists or not for security, but for now we can be explicitly helpful
        return jsonify({"error": "User with this email does not exist"}), 404
        
    token = secrets.token_urlsafe(32)
    User.set_reset_token(email, token)
    
    try:
        # Dynamic Frontend URL: Use the Origin of the request
        request_origin = request.headers.get('Origin')
        frontend_url = request_origin if request_origin else os.getenv('FRONTEND_URL', 'http://localhost:8080')
        
        link = f"{frontend_url}/reset-password?token={token}"
        msg = Message(
            subject="WorkVision Password Reset",
            recipients=[email],
            body=f"Hello,\n\nYou requested a password reset. Click the link below to verify your identity and reset your password:\n\n{link}\n\nThis link expires in 1 hour.\n\nIf you did not request this, please ignore this email."
        )
        current_app.mail.send(msg)
        return jsonify({"message": "Password reset link sent to your email."}), 200
    except Exception as e:
        print(f"Failed to send email: {e}")
        return jsonify({"error": "Failed to send email. Please try again later."}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')
    
    if not token or not new_password:
        return jsonify({"error": "Missing token or password"}), 400
        
    user = User.find_by_reset_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired reset token"}), 400
        
    User.reset_password(user['_id'], new_password)
    return jsonify({"message": "Password has been reset successfully. You can now login."}), 200

