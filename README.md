<div align="center">
  <img src="https://img.icons8.com/color/96/000000/bullish.png" alt="WorkVision Logo" width="80" />
  <h1>WorkVision</h1>
  <p><strong>AI-Based Employee Performance & Productivity Analysis System</strong></p>
  
  [![React](https://img.shields.io/badge/React-18-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
  [![Flask](https://img.shields.io/badge/Flask-Backend-black.svg?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
  [![Python](https://img.shields.io/badge/Python-3.10+-blue.svg?style=flat-square&logo=python)](https://www.python.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  
  <i>A comprehensive, intelligent platform designed to track, analyze, and predict employee performance using machine learning, eliminating the bias of traditional performance reviews.</i>
</div>

---

## 🌟 Overview
**WorkVision** is an enterprise-ready SaaS application that seamlessly connects daily task logging with predictive artificial intelligence. It maps, measures, and predicts human productivity in real-time. Built with a deeply responsive UI and a robust Python backend, it enforces strict tri-level role separation ensuring security across organizations.

## ✨ Key Features
- **🤖 Predictive AI Engine**: Utilizes Scikit-Learn to evaluate daily logs (hours, task complexity, sentiment) to output a normalized productivity score and track burnout/trajectory.
- **🛡️ Tri-Level Architecture**: 
  - **Employee**: Logs daily tasks, views personal trajectory, receives AI feedback.
  - **Manager**: Monitors department health, generates side-by-side Radar charts to compare employees, and tracks top-performers via dynamic leaderboards.
  - **Administrator**: Controls global system constraints, unhindered cross-department views, and overrides.
- **📄 Server-Side PDF Reports**: Generates mathematically structured, WorkVision-branded PDF reports entirely on the backend via FPDF for immediate client download.
- **💌 Dynamic Email Validation**: Fully functional SMTP connections for verifying accounts and facilitating password resets via cryptographic tokens.
- **🎨 Premium UI/UX**: Constructed using React, TailwindCSS, `shadcn/ui`, and Framer Motion for deep glassmorphism aesthetics, outrun-style hero animations, and highly interactive user elements.
- **🌐 Network Accessible (LAN)**: The Vite/Axios frontend auto-resolves your host IP, allowing any device connected to your local Wi-Fi to seamlessly access and interact with the application simultaneously.

---

## 🛠️ Technology Stack
### Frontend
- **Framework**: React.js (Vite) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: Framer Motion
- **Charting**: Recharts
- **Networking**: Axios

### Backend & AI
- **Framework**: Python 3 (Flask)
- **Database**: MongoDB (via PyMongo)
- **Machine Learning**: Scikit-Learn, Pandas, NumPy
- **Auth**: Flask-JWT-Extended + Bcrypt
- **Reporting**: FPDF

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm (v16+)
- Python (v3.8+)
- MongoDB (Running locally or MongoDB Atlas)

### 1. Backend Setup
Open a terminal inside the project root and run:
```bash
# Install required Python dependencies
pip install -r backend/requirements.txt

# Start the Flask API server
python backend/app.py
```
*The backend will automatically bind to `0.0.0.0:5000` allowing local network requests.*

### 2. Frontend Setup
Open a **new** terminal (keeping the backend terminal running) and execute:
```bash
# Install Node dependencies
npm install

# Start the Vite development server (exposed to LAN)
npm run dev -- --host
```
*Access the application at `http://localhost:8080` (or the IP address provided in the terminal for other devices).*

---

## 🔑 Demo Credentials
After initializing the database via `python backend/reseed_system.py`, you can test the system using the following preset accounts:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Admin Overlord** | `admin@workvision.com` | `admin123` |
| **Engineering Manager** | `manager@engineering.com` | `password123` |
| **Employee (Test)** | `employee1@workvision.com` | `user123` |

*Other available department managers include:*
- Sales: `manager@sales.com` / `password123`
- Marketing: `manager@marketing.com` / `password123`
- HR: `manager@hr.com` / `password123`
- Finance: `manager@finance.com` / `password123`

---

## 👨‍💻 Developed By
- **Om Patel** - Lead Full-Stack Engineer & AI Integrator
- **Vishvam Patel** - Frontend Architect & UI/UX Visionary

<br />

<div align="center">
  <i>Engineered for the future of work.</i>
</div>
