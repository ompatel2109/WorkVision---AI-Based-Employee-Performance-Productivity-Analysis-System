from flask import Blueprint, jsonify, request, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Task, User, Performance
from bson import ObjectId
import os
import werkzeug.utils
import datetime

task_bp = Blueprint('task', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt', 'doc', 'docx', 'zip', 'xlsx', 'csv', 'mp4', 'webm'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_employee_metrics(user_id):
    """
    Recalculate performance metrics based on all employee-completed tasks
    (Submitted = awaiting review + Completed = manager-verified).
    Also incorporates manager feedback_score from verified tasks.
    """
    tasks = Task.get_by_assignee(user_id)

    total_assigned   = len(tasks)
    submitted_tasks  = [t for t in tasks if t.get('status') == 'Submitted']
    verified_tasks   = [t for t in tasks if t.get('status') == 'Completed']
    done_tasks       = submitted_tasks + verified_tasks   # from employee's perspective

    total_completed  = len(done_tasks)
    total_hours      = sum(t.get('hours_spent', 0) for t in done_tasks)

    # Timeline adherence across all done tasks
    on_time_count = delay_count = 0
    for t in done_tasks:
        submitted_at = t.get('submitted_at')
        due_date     = t.get('due_date')
        if submitted_at:
            if due_date:
                if submitted_at <= due_date:
                    on_time_count += 1
                else:
                    delay_count += 1
            else:
                on_time_count += 1

    deadline_adherence = (on_time_count / total_completed * 100) if total_completed > 0 else 100

    # Completion ratio
    completion_ratio = (total_completed / total_assigned) if total_assigned > 0 else 0

    # Base score components (out of 100)
    base_score  = (completion_ratio * 50) + (deadline_adherence * 0.3) - (delay_count * 5)

    # Volume bonus
    if total_completed > 5:  base_score += 5
    if total_completed > 10: base_score += 5

    # Manager feedback bonus/penalty (avg of feedback_scores on verified tasks, scaled ±10)
    feedback_scores = [t.get('feedback_score') for t in verified_tasks if t.get('feedback_score') is not None]
    if feedback_scores:
        avg_feedback = sum(feedback_scores) / len(feedback_scores)   # 1-10
        # Map 1-10 → -10 to +10 adjustment: 5 = neutral, 10 = +10, 1 = -10
        feedback_bonus = (avg_feedback - 5) * 2
        base_score += feedback_bonus

    score = max(0, min(100, base_score))

    # 5-level performance category
    if score >= 85:
        category = "Exceptional"
    elif score >= 70:
        category = "High Performer"
    elif score >= 55:
        category = "Average"
    elif score >= 40:
        category = "Developing"
    else:
        category = "Needs Improvement"

    # Save to Performance Collection
    Performance.add_entry(user_id, {
        "date":  datetime.datetime.utcnow(),
        "score": score,
        "performance_category": category,
        "metrics": {
            "tasks_assigned":    total_assigned,
            "tasks_completed":   total_completed,
            "hours_worked":      total_hours,
            "deadline_adherence": deadline_adherence,
            "delay_count":       delay_count,
            "avg_feedback_score": round(sum(feedback_scores) / len(feedback_scores), 1) if feedback_scores else None,
        },
        "source": "task_system"
    })

@task_bp.route('/ai_recommend', methods=['GET'])
@jwt_required()
def ai_recommend():
    """
    Smart Task Assignment Recommendation.
    Scores each employee in the manager's department using:
      - Workload capacity   (0-40 pts): fewer pending tasks = more available
      - Completion rate     (0-40 pts): completed / total assigned tasks
      - Performance score   (0-20 pts): latest AI score from performance collection
    Returns a ranked list with a human-readable reason.
    """
    from db import get_db
    current_user_id = get_jwt_identity()
    db = get_db()

    # Identify manager and their department
    manager = db.users.find_one({"_id": ObjectId(current_user_id)})
    if not manager:
        return jsonify({"error": "Manager not found"}), 404

    dept = manager.get("department", "")
    if not dept:
        return jsonify({"error": "Manager has no department assigned"}), 400

    # All employees in this department
    employees = list(db.users.find({"role": "employee", "department": dept}, {"password": 0}))
    if not employees:
        return jsonify([]), 200

    recommendations = []

    # Determine max active tasks for normalization
    active_counts = []
    for emp in employees:
        uid = str(emp["_id"])
        emp_tasks = Task.get_by_assignee(uid)
        active = [t for t in emp_tasks if t.get("status") == "Pending"]
        active_counts.append(len(active))
    max_active = max(active_counts) if active_counts else 1

    for idx, emp in enumerate(employees):
        uid = str(emp["_id"])
        emp_tasks = Task.get_by_assignee(uid)

        total_assigned = len(emp_tasks)
        completed_tasks = [t for t in emp_tasks if t.get("status") in ("Completed", "Submitted")]
        active_tasks = [t for t in emp_tasks if t.get("status") == "Pending"]

        total_completed = len(completed_tasks)
        active_count = active_counts[idx]

        # --- Score 1: Workload capacity (0-40) ---
        workload_score = 40 * (1 - (active_count / max(max_active, 1))) if max_active > 0 else 40

        # --- Score 2: Completion rate (0-40) ---
        completion_rate = total_completed / total_assigned if total_assigned > 0 else 0
        completion_score = 40 * completion_rate

        # --- Score 3: Performance score (0-20) ---
        perf = Performance.get_latest(uid)
        raw_perf = perf.get("score", 0) if perf else 0
        performance_score = 20 * (raw_perf / 100.0)

        total_score = round(workload_score + completion_score + performance_score, 1)

        # Build human-readable reason
        parts = []
        if active_count == 0:
            parts.append("No active tasks (fully available)")
        elif active_count <= 2:
            parts.append(f"Light workload ({active_count} active task{'s' if active_count > 1 else ''})")
        else:
            parts.append(f"Busy ({active_count} active tasks)")

        cr_pct = round(completion_rate * 100)
        if cr_pct >= 85:
            parts.append(f"{cr_pct}% completion rate")
        elif cr_pct >= 60:
            parts.append(f"Average completion ({cr_pct}%)")
        elif total_assigned == 0:
            parts.append("No prior task history")
        else:
            parts.append(f"Low completion rate ({cr_pct}%)")

        if raw_perf >= 80:
            parts.append(f"High performer ({raw_perf:.0f}/100)")
        elif raw_perf >= 55:
            parts.append(f"Avg performance ({raw_perf:.0f}/100)")
        elif raw_perf > 0:
            parts.append(f"Score {raw_perf:.0f}/100")

        recommendations.append({
            "id": uid,
            "name": emp.get("name", "Unknown"),
            "email": emp.get("email", ""),
            "ai_score": total_score,
            "active_tasks": active_count,
            "completion_rate": cr_pct,
            "performance_score": round(raw_perf, 1),
            "reason": " · ".join(parts),
        })

    recommendations.sort(key=lambda x: x["ai_score"], reverse=True)
    for i, r in enumerate(recommendations):
        r["rank"] = i + 1

    return jsonify(recommendations), 200


@task_bp.route('/', methods=['POST'])
@jwt_required()
def create_task():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    title = data.get('title')
    description = data.get('description')
    assigned_to = data.get('assigned_to')
    due_date = data.get('due_date') # ISO format string
    
    if not title or not assigned_to:
        return jsonify({"error": "Title and Assignee are required"}), 400
        
    task_id = Task.create_task(title, description, assigned_to, current_user_id, due_date)
    return jsonify({"message": "Task created", "task_id": str(task_id)}), 201

@task_bp.route('/my_tasks', methods=['GET'])
@jwt_required()
def get_my_tasks():
    current_user_id = get_jwt_identity()
    tasks = Task.get_by_assignee(current_user_id)
    
    # Enrich with assigner name
    for t in tasks:
        t['_id'] = str(t['_id'])
        t['assigned_to'] = str(t['assigned_to'])
        t['assigned_by_id'] = str(t['assigned_by'])
        
        assigner = User.find_by_id(t['assigned_by'])
        t['assigned_by_name'] = assigner['name'] if assigner else "Unknown"
        del t['assigned_by'] # remove raw objectid
        
        # Serialize dates
        if t.get('due_date'): t['due_date'] = t['due_date'].isoformat()
        if t.get('created_at'): t['created_at'] = t['created_at'].isoformat()
        if t.get('submitted_at'): t['submitted_at'] = t['submitted_at'].isoformat()
        if t.get('verified_at'): t['verified_at'] = t['verified_at'].isoformat()
        
    return jsonify(tasks), 200

@task_bp.route('/managed_tasks', methods=['GET'])
@jwt_required()
def get_managed_tasks():
    current_user_id = get_jwt_identity()
    tasks = Task.get_by_creator(current_user_id)
    
    # Enrich with assignee name
    for t in tasks:
        t['_id'] = str(t['_id'])
        t['assigned_by'] = str(t['assigned_by'])
        
        assignee = User.find_by_id(t['assigned_to'])
        t['assigned_to_name'] = assignee['name'] if assignee else "Unknown"
        t['assigned_to'] = str(t['assigned_to'])
        
        # Serialize dates
        if t.get('due_date'): t['due_date'] = t['due_date'].isoformat()
        if t.get('created_at'): t['created_at'] = t['created_at'].isoformat()
        if t.get('submitted_at'): t['submitted_at'] = t['submitted_at'].isoformat()
        if t.get('verified_at'): t['verified_at'] = t['verified_at'].isoformat()

    return jsonify(tasks), 200

@task_bp.route('/<task_id>/submit', methods=['POST'])
@jwt_required()
def submit_proof(task_id):
    from models import WorkLog, Performance
    current_user_id = get_jwt_identity()
    hours_spent = 0
    filename = None

    # Handle multipart/form-data (file upload)
    if request.content_type and 'multipart/form-data' in request.content_type:
        hours_spent = float(request.form.get('hours_spent', 0) or 0)
        note = request.form.get('note', '')

        file = request.files.get('file')
        if file and file.filename:
            safe_filename = werkzeug.utils.secure_filename(file.filename)
            if not safe_filename:
                safe_filename = f"proof_{task_id}"
            filename = f"{task_id}_{safe_filename}"
            upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(upload_path)
            print(f"UPLOAD: Saved '{filename}' for task {task_id}")
    else:
        data = request.get_json(silent=True) or {}
        hours_spent = float(data.get('hours_spent', 0) or 0)
        note = data.get('note', '')
        filename = note

    # Mark task as submitted
    Task.submit_proof(task_id, filename, hours_spent)

    # ── Auto Work Log ────────────────────────────────────────────────────────
    # Recompute real stats from all tasks so work log is accurate
    all_tasks = Task.get_by_assignee(current_user_id)
    total_assigned  = len(all_tasks)
    completed_tasks = [t for t in all_tasks if t.get('status') == 'Completed']
    total_completed = len(completed_tasks)

    on_time = delayed = 0
    for t in completed_tasks:
        sub = t.get('submitted_at')
        due = t.get('due_date')
        if sub and due:
            if sub <= due:
                on_time += 1
            else:
                delayed += 1
        elif sub:
            on_time += 1

    adherence = round((on_time / total_completed * 100), 1) if total_completed > 0 else 100.0

    WorkLog.add_log(current_user_id, {
        "tasks_assigned":    total_assigned,
        "tasks_completed":   total_completed,
        "hours_worked":      hours_spent,
        "deadline_adherence": adherence,
        "delay_count":       delayed,
        "notes":             f"Auto-logged on task submission (task id: {task_id})"
    })

    # Recalculate overall performance score
    calculate_employee_metrics(current_user_id)
    # ─────────────────────────────────────────────────────────────────────────

    return jsonify({"message": "Task submitted for review. Work log updated."}), 200



@task_bp.route('/<task_id>/verify', methods=['POST'])
@jwt_required()
def verify_task(task_id):
    data = request.get_json()
    status         = data.get('status')          # 'Completed' or 'Rejected'
    feedback_score = data.get('feedback_score')  # 1-10, optional

    if status not in ['Completed', 'Rejected']:
        return jsonify({"error": "Invalid status"}), 400

    Task.verify_task(task_id, status, feedback_score)

    # Trigger score recalculation for the assignee
    task = Task.get_by_id(task_id)
    if task:
        assignee_id = task['assigned_to']
        calculate_employee_metrics(assignee_id)

    return jsonify({"message": f"Task marked as {status}"}), 200
