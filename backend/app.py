from flask import Flask, jsonify, request, make_response

from flask_jwt_extended import JWTManager, jwt_required
from db import get_db
from auth import auth_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Dynamic CORS: Accept any origin and reflect it back.
# This permanently fixes IP/port changes without needing a hardcoded list.
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        response = make_response()
        origin = request.headers.get('Origin')
        if origin:
            response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Max-Age'] = '86400'
        return response, 204

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-secret-key-change-this-in-env')
jwt = JWTManager(app)

@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    print(f"DEBUG: Invalid Token: {error_string}")
    return jsonify({"error": "Invalid Token", "reason": error_string}), 422

@jwt.unauthorized_loader
def missing_token_callback(error_string):
    print(f"DEBUG: Missing Token: {error_string}")
    return jsonify({"error": "Missing Token", "reason": error_string}), 401

# Mail Configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])

from flask_mail import Mail
mail = Mail(app)

# Make mail accessible to blueprints
app.mail = mail

# Register Blueprints
# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

from routes.manager_routes import manager_bp
from routes.admin_routes import admin_bp

app.register_blueprint(manager_bp, url_prefix='/api/manager')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

from routes.employee_routes import employee_bp
app.register_blueprint(employee_bp, url_prefix='/api/employee')

from routes.task_routes import task_bp
app.register_blueprint(task_bp, url_prefix='/api/tasks')

# File Upload Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load AI Model
import joblib
import pandas as pd
import numpy as np

model = None
try:
    model = joblib.load('backend/model.pkl')
    print("AI Model loaded successfully.")
except:
    print("Model not found. Please train the model first.")

@app.route('/api/predict', methods=['POST'])
@jwt_required()
def predict_performance():
    if not model:
        return jsonify({"error": "Model not loaded"}), 503
        
    data = request.get_json()
    # Expecting features: projects_completed, hours_worked, bugs_fixed, training_hours, peer_review_score, client_feedback_score, department, role
    
    try:
        df = pd.DataFrame([data])
        prediction = model.predict(df)[0]
        return jsonify({"predicted_score": float(prediction)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/')
def home():
    return jsonify({"message": "Employee Performance Analysis System API is running"})

@app.route('/health')
def health_check():
    try:
        db = get_db()
        # Ping database to check connection
        db.command('ping')
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
