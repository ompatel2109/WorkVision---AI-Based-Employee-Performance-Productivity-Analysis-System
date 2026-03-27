from flask import Blueprint, jsonify, request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, WorkLog, Performance, Feedback
from bson import ObjectId
from db import get_db
import datetime
import io
import csv

employee_bp = Blueprint('employee', __name__)

def compute_unified_score(user_id):
    """Compute a unified performance score blending work metrics (80%) + feedback sentiment (20%).
    
    Work Score breakdown (out of 100):
      - Task completion ratio:       up to 35 pts
      - Deadline adherence:          up to 25 pts
      - Projects completed:          up to 15 pts  (5 per project, max 3)
      - Bugs fixed:                  up to 10 pts  (2 per bug, max 5)
      - Training hours:              up to 10 pts  (2 per hour, max 5)
      - Task complexity bonus:       up to 5 pts
      - Delay penalty:               -1 per delay
    """
    db = get_db()
    
    # --- Work Component (80% weight) ---
    logs = list(db.work_logs.find({"user_id": ObjectId(user_id)}).sort("date", -1).limit(10))
    if logs:
        total_assigned = sum(l.get('tasks_assigned', 1) for l in logs)
        total_completed = sum(l.get('tasks_completed', 0) for l in logs)
        avg_deadline = sum(l.get('deadline_adherence', 100) for l in logs) / len(logs)
        avg_complexity = sum(l.get('task_complexity', 1) for l in logs) / len(logs)
        total_delays = sum(l.get('delay_count', 0) for l in logs)
        
        # New metrics from the form
        avg_bugs = sum(l.get('bugs_fixed', 0) for l in logs) / len(logs)
        avg_projects = sum(l.get('projects_completed', 0) for l in logs) / len(logs)
        avg_training = sum(l.get('training_hours', 0) for l in logs) / len(logs)
        
        ratio = (total_completed / total_assigned) if total_assigned > 0 else 0
        
        work_score = (
            (ratio * 35) +                           # Task completion: 0-35
            (avg_deadline * 0.25) +                   # Deadline adherence: 0-25
            (min(avg_projects, 3) * 5) +              # Projects: 0-15
            (min(avg_bugs, 5) * 2) +                  # Bugs fixed: 0-10
            (min(avg_training, 5) * 2) +              # Training: 0-10
            (min(avg_complexity, 5) * 1) -            # Complexity bonus: 0-5
            (total_delays * 0.5)                      # Delay penalty
        )
        work_score = max(0, min(100, work_score))
    else:
        work_score = 50  # default baseline
    
    # --- Feedback Component (20% weight) ---
    feedback_list = list(db.feedback.find({"employee_id": ObjectId(user_id), "sentiment_score": {"$ne": None}}))
    if feedback_list:
        avg_sentiment = sum(f.get('sentiment_score', 0) for f in feedback_list) / len(feedback_list)
        feedback_score = (avg_sentiment + 1) * 50  # maps -1..+1 → 0..100
        feedback_score = max(0, min(100, feedback_score))
    else:
        feedback_score = 50  # neutral if no feedback
    
    # --- Unified Score ---
    unified = (work_score * 0.8) + (feedback_score * 0.2)
    unified = round(max(0, min(100, unified)), 1)
    
    return {
        "unified_score": unified,
        "work_score": round(work_score, 1),
        "feedback_score": round(feedback_score, 1),
        "feedback_count": len(feedback_list),
    }

@employee_bp.route('/work-log', methods=['POST'])
@jwt_required()
def add_work_log():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validation
    required = ['tasks_assigned', 'tasks_completed', 'hours_worked']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400
        
    # Add to Work Logs
    WorkLog.add_log(current_user_id, data)
    
    # Trigger Performance Update — Unified Score (Work 80% + Feedback 20%)
    score_data = None
    try:
        score_data = compute_unified_score(current_user_id)
        
        # Save to Performance collection for AI/Stats
        Performance.add_entry(current_user_id, {
            "date": datetime.datetime.utcnow(),
            "score": score_data["unified_score"],
            "work_score": score_data["work_score"],
            "feedback_score": score_data["feedback_score"],
            "feedback_count": score_data["feedback_count"],
            "metrics": data
        })
        
    except Exception as e:
        print(f"Error calculating score: {e}")
        
    response = {"message": "Work log added and performance updated"}
    if score_data:
        response["unified_score"] = score_data["unified_score"]
        response["work_score"] = score_data["work_score"]
        response["feedback_score"] = score_data["feedback_score"]
        response["feedback_count"] = score_data["feedback_count"]
    return jsonify(response), 201

@employee_bp.route('/work-log', methods=['GET'])
@jwt_required()
def get_work_logs():
    current_user_id = get_jwt_identity()
    logs = WorkLog.get_logs(current_user_id)
    for log in logs:
        log['_id'] = str(log['_id'])
        log['user_id'] = str(log['user_id'])
        log['date'] = log['date'].isoformat()
        if 'created_at' in log: log['created_at'] = log['created_at'].isoformat()
    return jsonify(logs), 200

@employee_bp.route('/work-log/<log_id>', methods=['PUT'])
@jwt_required()
def update_work_log(log_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    success = WorkLog.update_log(log_id, current_user_id, data)
    if success:
        return jsonify({"message": "Log updated"}), 200
    return jsonify({"error": "Log not found or unauthorized"}), 404

@employee_bp.route('/work-log/<log_id>', methods=['DELETE'])
@jwt_required()
def delete_work_log(log_id):
    current_user_id = get_jwt_identity()
    success = WorkLog.delete_log(log_id, current_user_id)
    if success:
        return jsonify({"message": "Log deleted"}), 200
    return jsonify({"error": "Log not found or unauthorized"}), 404

@employee_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    current_user_id = get_jwt_identity()

    # Latest Score
    latest = Performance.get_latest(current_user_id)
    latest_score = latest.get('score', 0) if latest else 0

    # Use saved category from task system (5-level) if available, else compute from score
    if latest and latest.get('performance_category'):
        category = latest['performance_category']
    elif latest_score >= 85:
        category = "Exceptional"
    elif latest_score >= 70:
        category = "High Performer"
    elif latest_score >= 55:
        category = "Average"
    elif latest_score >= 40:
        category = "Developing"
    else:
        category = "Needs Improvement"

    # Trends (Last 7 entries)
    history = Performance.get_history(current_user_id)
    recent_history = history[-7:]

    trend_data = {
        "labels": [h['date'].strftime('%Y-%m-%d') for h in recent_history],
        "data":   [round(h['score'], 1) for h in recent_history]
    }

    # Task Summary from latest metrics
    if latest and 'metrics' in latest:
        metrics       = latest['metrics']
        total_completed = metrics.get('tasks_completed', 0)
        total_hours     = metrics.get('hours_worked', 0)
        avg_feedback    = metrics.get('avg_feedback_score', None)
        adherence       = metrics.get('deadline_adherence', 100)
    else:
        from models import WorkLog
        logs            = WorkLog.get_logs(current_user_id, limit=30)
        total_completed = sum([l.get('tasks_completed', 0) for l in logs])
        total_hours     = sum([l.get('hours_worked', 0) for l in logs])
        avg_feedback    = None
        adherence       = 100

    efficiency = round(total_completed / total_hours, 2) if total_hours > 0 else 0

    # Compute live unified score breakdown
    score_breakdown = compute_unified_score(current_user_id)

    return jsonify({
        "current_score":        round(latest_score, 1),
        "performance_category": category,
        "trend":                trend_data,
        "score_breakdown": {
            "work_score":     score_breakdown["work_score"],
            "feedback_score": score_breakdown["feedback_score"],
            "feedback_count": score_breakdown["feedback_count"],
        },
        "summary": {
            "tasks_completed":   total_completed,
            "hours_worked":      total_hours,
            "efficiency":        efficiency,
            "avg_feedback_score": avg_feedback,
            "deadline_adherence": round(adherence, 1),
        }
    }), 200

@employee_bp.route('/feedback', methods=['GET'])
@jwt_required()
def get_feedback():
    current_user_id = get_jwt_identity()
    feedback = Feedback.get_for_employee(current_user_id)
    db = get_db()
    for f in feedback:
        f['_id'] = str(f['_id'])
        f['employee_id'] = str(f['employee_id'])
        f['date'] = f['date'].isoformat()
        # Include manager name
        manager = db.users.find_one({"_id": f['manager_id']}, {"name": 1})
        f['manager_name'] = manager.get('name', 'Manager') if manager else 'Manager'
        f['manager_id'] = str(f['manager_id'])
        # Include sentiment data (may be None for old feedback)
        f['sentiment'] = f.get('sentiment', None)
        f['sentiment_score'] = f.get('sentiment_score', None)
    return jsonify(feedback), 200

@employee_bp.route('/feedback/sentiment-trend', methods=['GET'])
@jwt_required()
def get_sentiment_trend():
    """Returns aggregated sentiment data for the employee's feedback chart."""
    current_user_id = get_jwt_identity()
    feedback = Feedback.get_for_employee(current_user_id)
    
    positive = sum(1 for f in feedback if f.get('sentiment') == 'Positive')
    neutral = sum(1 for f in feedback if f.get('sentiment') == 'Neutral')
    negative = sum(1 for f in feedback if f.get('sentiment') == 'Negative')
    unknown = sum(1 for f in feedback if not f.get('sentiment'))
    
    # Timeline data (last 10 feedbacks newest first, reversed for chart)
    timeline = []
    for f in feedback[:10]:
        timeline.append({
            "date": f['date'].strftime('%b %d') if hasattr(f['date'], 'strftime') else str(f['date'])[:6],
            "score": f.get('sentiment_score', 0) or 0,
            "sentiment": f.get('sentiment', 'Unknown')
        })
    timeline.reverse()
    
    return jsonify({
        "distribution": {
            "positive": positive,
            "neutral": neutral,
            "negative": negative,
            "unknown": unknown,
        },
        "total": len(feedback),
        "timeline": timeline
    }), 200

# --- Notification Endpoints ---
@employee_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    from models import Notification
    current_user_id = get_jwt_identity()
    notifications = Notification.get_for_user(current_user_id)
    for n in notifications:
        n['_id'] = str(n['_id'])
        n['user_id'] = str(n['user_id'])
        n['created_at'] = n['created_at'].isoformat()
    return jsonify(notifications), 200

@employee_bp.route('/notifications/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    from models import Notification
    current_user_id = get_jwt_identity()
    count = Notification.get_unread_count(current_user_id)
    return jsonify({"count": count}), 200

@employee_bp.route('/notifications/read', methods=['POST'])
@jwt_required()
def mark_notification_read():
    from models import Notification
    data = request.get_json()
    notification_id = data.get('notification_id')
    if not notification_id:
        return jsonify({"error": "Missing notification_id"}), 400
    Notification.mark_read(notification_id)
    return jsonify({"message": "Marked as read"}), 200

@employee_bp.route('/notifications/read-all', methods=['POST'])
@jwt_required()
def mark_all_notifications_read():
    from models import Notification
    current_user_id = get_jwt_identity()
    Notification.mark_all_read(current_user_id)
    return jsonify({"message": "All notifications marked as read"}), 200

@employee_bp.route('/reports/export', methods=['GET'])
@jwt_required()
def export_report():
    current_user_id = get_jwt_identity()
    user = User.find_by_id(current_user_id)
    logs = WorkLog.get_logs(current_user_id, limit=100)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(['Date', 'Tasks Assigned', 'Tasks Completed', 'Hours Worked', 'Deadline Adherence', 'Score'])
    
    for log in logs:
        date = log['date'].isoformat()
        writer.writerow([
            date,
            log.get('tasks_assigned'),
            log.get('tasks_completed'),
            log.get('hours_worked'),
            log.get('deadline_adherence'),
            "N/A"
        ])
        
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename=performance_report_{user['name']}.csv"}
    )

@employee_bp.route('/task-summary', methods=['GET'])
@jwt_required()
def get_task_summary():
    """
    Returns auto-computed task stats from the task system.
    This is used to auto-populate work log form fields.
    """
    from models import Task
    current_user_id = get_jwt_identity()
    tasks = Task.get_by_assignee(current_user_id)

    total_assigned   = len(tasks)
    # Employee-done = Submitted (under review) + Completed (verified by manager)
    submitted_tasks  = [t for t in tasks if t.get('status') == 'Submitted']
    verified_tasks   = [t for t in tasks if t.get('status') == 'Completed']
    done_tasks       = submitted_tasks + verified_tasks   # all tasks employee completed
    pending_tasks    = [t for t in tasks if t.get('status') == 'Pending']
    rejected_tasks   = [t for t in tasks if t.get('status') == 'Rejected']

    total_completed  = len(done_tasks)      # what employee sees as "completed"
    total_verified   = len(verified_tasks)  # manager-verified subset
    total_submitted  = len(submitted_tasks) # awaiting manager review
    total_pending    = len(pending_tasks)
    total_rejected   = len(rejected_tasks)
    total_hours      = sum([t.get('hours_spent', 0) or 0 for t in done_tasks])

    on_time  = 0
    delayed  = 0
    for t in done_tasks:
        submitted_at = t.get('submitted_at')
        due_date     = t.get('due_date')
        if submitted_at and due_date:
            if submitted_at <= due_date:
                on_time += 1
            else:
                delayed += 1
        elif submitted_at:
            on_time += 1

    adherence = round((on_time / total_completed * 100), 1) if total_completed > 0 else 100.0

    # Serialize completed task details for proof (only manager-verified for certificate)
    completed_details = []
    for t in done_tasks:
        completed_details.append({
            "title":        t.get('title', 'Untitled'),
            "submitted_at": t['submitted_at'].isoformat() if t.get('submitted_at') else None,
            "hours_spent":  t.get('hours_spent', 0),
            "due_date":     t['due_date'].isoformat() if t.get('due_date') else None,
            "status":       t.get('status', 'Submitted'),
        })

    # ── Auto-compute AI input scores ─────────────────────────────────────────
    # Peer Review Score (1-10): derived from task performance metrics
    # Formula: weighted blend of adherence, completion ratio, and low-delay bonus
    completion_ratio = total_completed / total_assigned if total_assigned > 0 else 0
    delay_penalty    = min(delayed * 0.5, 3)          # max 3-point penalty for delays
    peer_raw         = (adherence / 100) * 5 + completion_ratio * 3 + (2 - delay_penalty)
    peer_review_score = round(min(10, max(1, peer_raw)), 1)

    # Client Feedback Score (1-10): average of manager-given feedback_scores on verified tasks
    feedback_scores = [t.get('feedback_score') for t in verified_tasks if t.get('feedback_score') is not None]
    if feedback_scores:
        client_feedback_score = round(sum(feedback_scores) / len(feedback_scores), 1)
    else:
        # No manager feedback yet → neutral default based on adherence
        client_feedback_score = round(min(10, max(1, (adherence / 100) * 8 + 1)), 1)
    # ─────────────────────────────────────────────────────────────────────────

    return jsonify({
        "tasks_assigned":       total_assigned,
        "tasks_completed":      total_completed,   # Submitted + Completed
        "tasks_verified":       total_verified,    # manager-verified only
        "tasks_submitted":      total_submitted,   # under review
        "tasks_pending":        total_pending,
        "tasks_rejected":       total_rejected,
        "total_hours":          round(total_hours, 1),
        "deadline_adherence":   adherence,
        "delay_count":          delayed,
        "peer_review_score":    peer_review_score,
        "client_feedback_score": client_feedback_score,
        "completed_tasks":      completed_details
    }), 200


@employee_bp.route('/work-log/proof/<log_id>', methods=['GET'])
@jwt_required()
def download_proof(log_id):
    """
    Generate a downloadable proof-of-work report for a specific work log entry.
    Combines work log data with the employee's verified completed tasks as evidence.
    """
    from models import Task
    import json

    current_user_id = get_jwt_identity()
    user = User.find_by_id(current_user_id)

    # Fetch the specific log entry
    db = get_db()
    try:
        log = db.work_logs.find_one({"_id": ObjectId(log_id), "user_id": ObjectId(current_user_id)})
    except Exception:
        return jsonify({"error": "Invalid log ID"}), 400

    if not log:
        return jsonify({"error": "Log not found or unauthorized"}), 404

    # Fetch completed tasks as evidence
    tasks = Task.get_by_assignee(current_user_id)
    completed_tasks = [t for t in tasks if t.get('status') == 'Completed']

    log_date = log.get('date', datetime.datetime.utcnow())

    # Fetch all tasks from this day
    log_start = datetime.datetime.combine(log.get('date', datetime.datetime.utcnow().date()), datetime.time.min)
    log_end = datetime.datetime.combine(log.get('date', datetime.datetime.utcnow().date()), datetime.time.max)
    completed_tasks = list(db.tasks.find({
        "assigned_to": str(user['_id']),
        "status": "Completed", 
        "updated_at": {"$gte": log_start, "$lte": log_end}
    }))

    from pdf_generator import generate_proof_of_work_pdf
    pdf_bytes = generate_proof_of_work_pdf(user, log, completed_tasks)
    
    safe_name = (user.get('name') or 'employee').replace(' ', '_')
    log_date = log.get('date', datetime.datetime.utcnow())
    if hasattr(log_date, "strftime"):
        date_str = log_date.strftime('%Y%m%d')
    else:
        date_str = str(log_date)[:10]

    filename = f"proof_of_work_{safe_name}_{date_str}.pdf"

    return Response(
        pdf_bytes,
        mimetype="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@employee_bp.route('/work_log/pdf', methods=['GET'])
@jwt_required()
def download_work_log_pdf():
    """Generate a branded PDF of the employee's full work log history."""
    try:
        from pdf_generator import generate_work_log_pdf
        from flask import Response

        current_user_id = get_jwt_identity()
        db = get_db()
        user = db.users.find_one({"_id": ObjectId(current_user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        logs = list(db.work_logs.find(
            {"user_id": ObjectId(current_user_id)},
            sort=[("date", -1)]
        ))

        # Serialize datetime fields
        serialized_logs = []
        for log in logs:
            serialized_logs.append({
                "date":               log.get("date"),
                "tasks_assigned":     log.get("tasks_assigned", 0),
                "tasks_completed":    log.get("tasks_completed", 0),
                "hours_worked":       log.get("hours_worked", 0),
                "deadline_adherence": log.get("deadline_adherence", 0),
                "delay_count":        log.get("delay_count", 0),
                "notes":              log.get("notes", ""),
            })

        pdf_bytes = generate_work_log_pdf(
            employee_name=user.get("name", "Employee"),
            department=user.get("department", "—"),
            logs=serialized_logs,
        )

        import datetime
        filename = f"workvision_worklog_{user.get('name','').replace(' ', '_').lower()}_{datetime.date.today().isoformat()}.pdf"
        return Response(
            pdf_bytes,
            mimetype="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500



