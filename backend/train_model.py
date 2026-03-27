import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score
from data_generator import generate_performance_data

def train_model():
    print("Generating synthetic data...")
    df = generate_performance_data(num_samples=2000)
    
    X = df.drop('performance_score', axis=1)
    y = df['performance_score']
    
    # Define categorical and numerical features
    categorical_features = ['department', 'role']
    numeric_features = ['projects_completed', 'hours_worked', 'bugs_fixed', 'training_hours', 'peer_review_score', 'client_feedback_score']
    
    # Create preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    # Create pipeline
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    print("Training model...")
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Model Evaluation:\nMSE: {mse:.2f}\nR2 Score: {r2:.2f}")
    
    # Save model
    joblib.dump(model, 'backend/model.pkl')
    print("Model saved to backend/model.pkl")

if __name__ == "__main__":
    train_model()
