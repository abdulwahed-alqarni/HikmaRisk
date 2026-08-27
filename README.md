<div align="center">

# 🩺 HikmaRisk

**An Explainable Machine Learning-Powered Full-Stack Web Platform for Diabetes Risk Stratification and Population Health Analytics**

*A graduation project from the College of Computing and Information Technology, Department of Artificial Intelligence, University of Bisha.*

</div>

---

## 📖 Overview

HikmaRisk is a full-stack diabetes risk stratification platform that pairs a tuned **XGBoost** classifier with **SHAP (SHapley Additive exPlanations)** to turn a black-box prediction into a transparent, per-patient explanation of *why* a risk score was assigned. The platform wraps that model in a secure, role-based web application — a seven-step patient assessment wizard, longitudinal risk tracking, a personalized recommendation engine, and a clinical/admin analytics dashboard — deployed as a singleton inference service for real-time, sub-500ms scoring.

## ✨ Features

- **AI-Powered Risk Prediction** — XGBoost inference engine trained and evaluated against three other candidate algorithms, served as a singleton pipeline for low-latency scoring.
- **SHAP Explainability** — Per-prediction feature attribution (SHAP bar charts) so patients and clinicians can see exactly which factors drove a given risk score, not just the score itself.
- **Personalized Recommendations** — A recommendation engine that combines SHAP-ranked contributing factors with a structured medical knowledge base.
- **Seven-Step Assessment Wizard** — Guided, validated multi-step intake form (React Hook Form + Zod) that reduces drop-off versus a single long form.
- **Longitudinal Tracking & History** — Persisted prediction history so users can monitor how their risk trajectory changes over time.
- **Admin & Population Health Dashboard** — Aggregate analytics, user management, and audit logging for clinical/administrative oversight.
- **Clinical-Grade Security** — JWT authentication, bcrypt password hashing, and Role-Based Access Control (RBAC) distinguishing patient and admin roles.

## 🧱 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router DOM, React Hook Form + Zod, Recharts |
| **Backend** | Python 3.10, FastAPI, Uvicorn (ASGI), Pydantic, SQLAlchemy ORM |
| **ML / XAI** | XGBoost, SHAP (TreeExplainer), scikit-learn, pandas, NumPy, joblib |
| **Data** | SQLite (dev) — designed for a straightforward migration to PostgreSQL at production scale |
| **DevOps** | Docker & Docker Compose, Nginx (reverse proxy / SSL termination in production) |

## 📊 Model Performance

The XGBoost pipeline was evaluated against Logistic Regression, Random Forest, and Naïve Bayes baselines and selected as the production model:

| Metric | Score |
|---|---|
| Accuracy | **96.75%** |
| Precision | 0.8651 |
| Recall | 0.7318 |
| F1-Score | 0.7929 |
| ROC-AUC | **0.9778** |

**Inference performance:** mean latency **287 ms** (median 245 ms, 95th percentile 412 ms) against a 500 ms real-time target.

**Usability:** System Usability Scale (SUS) evaluation with end users returned a mean score of **82.4 ("Excellent")**.

## 🏛️ Architecture Overview

HikmaRisk follows a **three-tier architecture**:

1. **Presentation Tier** — A React/TypeScript single-page application communicating with the backend exclusively via REST calls over HTTPS.
2. **Application Tier** — A Python FastAPI service exposing the prediction, authentication, recommendation, and audit endpoints, and hosting the XGBoost model as a singleton in-memory inference service to avoid reload latency on every request.
3. **Data Tier** — SQLite accessed through the SQLAlchemy ORM, storing users, predictions, and audit logs.

## 📂 Repository Structure

```
hikmarisk/
├── backend/
│   ├── main.py                      # FastAPI application entry point & routes
│   ├── models.py                    # SQLAlchemy ORM models (User, Prediction, AuditLog)
│   ├── schemas.py                   # Pydantic request/response schemas
│   ├── auth.py                      # JWT issuing/verification, bcrypt hashing
│   ├── model_loader.py              # Loads the serialized XGBoost pipeline
│   ├── prediction_service.py        # Singleton inference + SHAP explanation service
│   ├── diabetes_prediction_pipeline.joblib   # Trained XGBoost pipeline artifact
│   └── requirements.txt
│
├── src/                             # Frontend application source
│   ├── components/                  # AssessmentWizard, AdminDashboard, PredictionResults, ...
│   ├── services/                    # db.ts, predictor.ts (API client)
│   ├── utils/                       # crypto.ts, pdfExport.ts
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
│
├── dataset/
│   ├── diabetes_prediction_dataset.csv
│   └── COLAB_TRAINING.ipynb          # Model training / evaluation notebook
│
├── deployment/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- (Optional) Docker & Docker Compose

### Local Setup — Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API is now live at `http://localhost:8000`, with interactive Swagger docs at `http://localhost:8000/docs`.

### Local Setup — Frontend

```bash
npm install
npm run dev
```

In the app's Settings tab, point the API Endpoint URL to `http://localhost:8000` (or `/api`) and switch to **Online Mode** to use the live FastAPI backend.

### Docker (Production-Style)

```bash
docker compose up --build
```

This builds and runs the frontend (served via Nginx) and the FastAPI backend as separate containers behind a reverse proxy handling SSL termination.

## 🔐 Environment Variables

Create a `.env` file (see `.env.example`) with at minimum:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Signing key for JWT access tokens (HMAC-SHA256). **Currently hardcoded in `backend/auth.py` — move this to an environment variable before publishing or deploying.** |
| `DATABASE_URL` | SQLAlchemy connection string (defaults to local SQLite; set to a PostgreSQL URL for production). |

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

## 🙏 Acknowledgements

Developed as a graduation project for the **College of Computing and Information Technology, Department of Artificial Intelligence, University of Bisha**, under the supervision of **Dr. Mohammed Mufreh Abdullah Al Shaqi**.

## 👥 Contributors

- Abdulwahed Abdullah Al-Qarni
- Saif Amer Al-Amri
- Munaijel Mohsen Al-Qahtani
- Abdulrahman Anwar Mohammed Al-Qarni
- Awn Abdullah Al-Suwaibi
- Salman Abdullah Al-Shahrani
