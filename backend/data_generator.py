import pandas as pd
import numpy as np
import random

def generate_performance_data(num_samples=1000, save_path=None):
    np.random.seed(42)
    random.seed(42)
    
    data = []
    
    # Departments and roles
    departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
    roles = ['Junior', 'Mid-Level', 'Senior', 'Lead']
    
    for _ in range(num_samples):
        dept = random.choice(departments)
        role = random.choice(roles)
        
        # Base multiplier for role
        role_multiplier = {'Junior': 0.8, 'Mid-Level': 1.0, 'Senior': 1.2, 'Lead': 1.3}[role]
        
        # Features
        projects_completed = int(np.random.normal(10, 3) * role_multiplier)
        projects_completed = max(0, projects_completed)
        
        hours_worked = int(np.random.normal(160, 10)) # Monthly hours
        
        bugs_fixed = 0
        if dept == 'Engineering':
            bugs_fixed = int(np.random.normal(15, 5) * role_multiplier)
            bugs_fixed = max(0, bugs_fixed)
            
        training_hours = int(np.random.randint(0, 20))
        
        peer_review_score = round(np.random.uniform(3.0, 5.0), 1)
        client_feedback_score = round(np.random.uniform(3.0, 5.0), 1)
        
        # Target: Performance Score (0-100)
        # Formula: Weighted sum of features + noise
        score = (
            (projects_completed * 3) +
            (bugs_fixed * 2) + 
            (peer_review_score * 5) + 
            (client_feedback_score * 5) +
            (hours_worked * 0.1)
        )
        
        # Normalize/Clip score
        score = min(100, max(0, score))
        score = round(score, 2)
        
        data.append({
            'department': dept,
            'role': role,
            'projects_completed': projects_completed,
            'hours_worked': hours_worked,
            'bugs_fixed': bugs_fixed,
            'training_hours': training_hours,
            'peer_review_score': peer_review_score,
            'client_feedback_score': client_feedback_score,
            'performance_score': score
        })
        
    df = pd.DataFrame(data)
    
    if save_path:
        df.to_csv(save_path, index=False)
        print(f"Data saved to {save_path}")
        
    return df

if __name__ == "__main__":
    generate_performance_data(save_path='backend/employee_performance_data.csv')
