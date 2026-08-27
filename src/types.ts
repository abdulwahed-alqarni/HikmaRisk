export type UserRole = 'patient' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  region?: string;
}

export interface CdssVitals {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  spO2?: number;
}

export interface CdssGlycemic {
  fbg?: number; // Fasting Blood Glucose (mg/dL)
  ogtt2h?: number; // 2-hour Oral Glucose Tolerance Test (mg/dL)
}

export interface CdssLabPanels {
  creatinine?: number; // mg/dL
  egfr?: number; // mL/min/1.73m²
  uacr?: number; // mg/g
  sodium?: number; // mEq/L
  potassium?: number; // mEq/L
  hco3?: number; // mEq/L
  bun?: number; // mg/dL
  totalCholesterol?: number; // mg/dL
  ldl?: number; // mg/dL
  hdl?: number; // mg/dL
  triglycerides?: number; // mg/dL
}

export interface CdssEmergency {
  ketones?: 'Negative' | 'Positive';
  mentalStatus?: 'Alert' | 'Confused' | 'Unresponsive';
}

export interface PredictionData {
  gender: 'Female' | 'Male' | 'Other';
  age: number;
  hypertension: 0 | 1;
  heartDisease: 0 | 1;
  smokingHistory: 'never' | 'current' | 'former' | 'ever' | 'not current' | 'No Info';
  bmi: number;
  hba1cLevel: number;
  bloodGlucoseLevel: number;
  // CDSS Extended parameters
  vitals?: CdssVitals;
  glycemic?: CdssGlycemic;
  labs?: CdssLabPanels;
  emergency?: CdssEmergency;
}

export interface CdssAlert {
  type: 'danger' | 'warning' | 'info';
  category: 'Emergency' | 'Glycemic' | 'Vitals' | 'Renal' | 'Lipid' | 'Electrolytes';
  title: string;
  message: string;
  recommendation: string;
}

export interface ShapDetail {
  feature: string;
  featureLabel: string;
  shap_value: number;
  impact: 'positive' | 'negative';
  description?: string;
  originalValue?: string | number;
}

export type RiskTier = 'Low Risk' | 'Moderate Risk' | 'High Risk';

export interface PredictionResult {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  data: PredictionData;
  prediction: 0 | 1;
  probability: number;
  riskTier: RiskTier;
  baseValue: number;
  shapDetails: ShapDetail[];
  chartBase64?: string;
  recommendations: string[];
  cdssAlerts?: CdssAlert[];
  mode: 'offline' | 'online';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AppSettings {
  apiUrl: string;
  mode: 'offline' | 'online';
  darkMode: boolean;
  lastSync?: string;
}

export interface HabitItem {
  id: string;
  title: string;
  category: 'activity' | 'glucose' | 'hydration' | 'nutrition' | 'blood_pressure';
  completed: boolean;
}

export interface EducationalArticle {
  id: string;
  title: string;
  category: 'Preventive Strategies' | 'Nutritional Science' | 'Medical Technology' | 'Living with Diabetes' | 'Research & Updates';
  summary: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  isFavorite?: boolean;
}

export interface RegionHealthData {
  id: string;
  regionName: string;
  totalScreenings: number;
  highRiskCount: number;
  avgBmi: number;
  avgGlucose: number;
  coordinates: { x: number; y: number }; // Percentage offset for map visual
}

