from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "patient"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PredictionInput(BaseModel):
    gender: str
    age: float
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    hba1c_level: float
    blood_glucose_level: float

class ShapItem(BaseModel):
    feature: str
    shap_value: float
    impact: str

class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    risk_tier: str
    base_value: float
    shap_details: List[ShapItem]
    chart_base64: Optional[str] = None
    recommendations: List[str]
