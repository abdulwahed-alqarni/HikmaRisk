from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid
import datetime

from models import Base, User, Prediction, AuditLog
from schemas import UserRegister, UserLogin, PredictionInput, PredictionResponse
from auth import hash_password, verify_password, create_access_token
from prediction_service import HikmaRiskPredictor

SQLALCHEMY_DATABASE_URL = "sqlite:///./hikmarisk.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HikmaRisk Diabetes AI API", version="2.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = HikmaRiskPredictor(model_path="diabetes_prediction_pipeline.joblib")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "HikmaRisk FastAPI Engine", "timestamp": datetime.datetime.utcnow().isoformat()}

@app.post("/auth/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    hashed = hash_password(user_data.password)
    user = User(
        id=user_id,
        username=user_data.name,
        email=user_data.email,
        password_hash=hashed,
        role=user_data.role or "patient"
    )
    db.add(user)
    db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.username, "email": user.email, "role": user.role}}

@app.post("/auth/login")
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.username, "email": user.email, "role": user.role}}

@app.post("/predict", response_model=PredictionResponse)
def predict(input_data: PredictionInput, db: Session = Depends(get_db)):
    data_dict = input_data.dict()
    result = predictor.predict_with_shap(data_dict)

    # Store prediction log
    pred_entry = Prediction(
        id=str(uuid.uuid4()),
        user_id="anonymous_or_api",
        gender=input_data.gender,
        age=input_data.age,
        hypertension=input_data.hypertension,
        heart_disease=input_data.heart_disease,
        smoking_history=input_data.smoking_history,
        bmi=input_data.bmi,
        hba1c_level=input_data.hba1c_level,
        blood_glucose_level=input_data.blood_glucose_level,
        prediction=result["prediction"],
        probability=result["probability"],
        risk_tier=result["risk_tier"],
        shap_details=result["shap_details"],
        recommendations=result["recommendations"]
    )
    db.add(pred_entry)
    db.commit()

    return result

@app.get("/admin/stats")
def admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_preds = db.query(Prediction).count()
    high_risk = db.query(Prediction).filter(Prediction.risk_tier == "High Risk").count()
    return {
        "total_users": total_users,
        "total_screenings": total_preds,
        "high_risk_count": high_risk,
        "high_risk_percentage": round((high_risk / total_preds * 100), 1) if total_preds > 0 else 0
    }
