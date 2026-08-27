# HikmaRisk Python FastAPI Backend & XGBoost SHAP Model Service

This directory contains the Python FastAPI backend service that loads the pre-trained XGBoost pipeline model (`diabetes_prediction_pipeline.joblib`) and calculates SHAP feature attributions.

## Setup Instructions

1. **Install Python Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Place Model File**:
   Ensure `diabetes_prediction_pipeline.joblib` is placed inside the `backend/` directory or at the project root.

3. **Start FastAPI Server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Verify Endpoint**:
   Open `http://localhost:8000/docs` in your browser to inspect interactive Swagger documentation.

5. **Connect Frontend**:
   In the HikmaRisk React Frontend Settings tab, set the API Endpoint URL to `http://localhost:8000` or `/api` and toggle to **Online Mode**.
