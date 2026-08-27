from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default='patient') # 'patient' or 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Prediction(Base):
    __tablename__ = 'predictions'

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    gender = Column(String)
    age = Column(Float)
    hypertension = Column(Integer)
    heart_disease = Column(Integer)
    smoking_history = Column(String)
    bmi = Column(Float)
    hba1c_level = Column(Float)
    blood_glucose_level = Column(Float)
    prediction = Column(Integer)
    probability = Column(Float)
    risk_tier = Column(String)
    shap_details = Column(JSON)
    recommendations = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    user_email = Column(String)
    action = Column(String, nullable=False)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
