# NexusAI - Employee Performance & Productivity Analysis System

## Project Overview
NexusAI is a comprehensive system designed to track, analyze, and predict employee performance using AI/ML.

## Prerequisites
- Node.js & npm
- Python 3.x
- MongoDB (Running locally or Compass)

## How to Run

### 1. Backend (Flask API)
Open a terminal and run:
```bash
# Navigate to project root
cd "c:\Users\omdpa\Desktop\CHARUSAT\sem 6\SGP IV\SGP PROJECT\EMPLOYEE PERFORMANCE SYSTEM"

# Install dependencies (if not done)
pip install -r backend/requirements.txt

# Start the server
python backend/app.py
```
*The backend runs on `http://localhost:5000`*

### 2. Frontend (React App)
Open a **new** terminal (keep the backend running) and run:
```bash
# Navigate to project root
cd "c:\Users\omdpa\Desktop\CHARUSAT\sem 6\SGP IV\SGP PROJECT\EMPLOYEE PERFORMANCE SYSTEM"

# Install dependencies (if not done)
npm install

# Start the development server
npm run dev
npm run dev -- --host
```
*The frontend runs on `http://localhost:8080` (or similar, check terminal output)*

## Features
- **Role-Based Access**: Employee, Manager, Admin.
- **Visual Analytics**: Interactive charts for performance data.
- **AI Predictions**: Productivity scores based on synthetic data.
- **Profile & Settings**: User management and theme customization.

## Credentials (Demo)

After running the system reset, use these credentials:

| Role     | Email                        | Password      |
|----------|------------------------------|---------------|
| **Admin**    | `admin@workvision.com`      | `admin123`    |
| **Manager**  | `manager.eng@workvision.com`| `manager123`  |
| **Employee** | `employee1@workvision.com`  | `user123`     |

To reset the database again, run:
```bash
python backend/reseed_system.py
```

Sales =manager@sales.com/password123
Marketing =manager@marketing.com/password123
HR =manager@hr.com/password123
Finance =manager@finance.com/password123
Engineering =manager@engineering.com/password123

