import { PredictionData, PredictionResult, RiskTier, ShapDetail, CdssAlert } from '../types';
import { generateId } from '../utils/crypto';

export function computeCdssAlerts(data: PredictionData): CdssAlert[] {
  const alerts: CdssAlert[] = [];

  // 1. Emergency Screening (DKA & HHS)
  const ketones = data.emergency?.ketones;
  const mental = data.emergency?.mentalStatus;
  const bg = data.bloodGlucoseLevel;

  if (ketones === 'Positive' && (mental === 'Confused' || mental === 'Unresponsive' || bg > 250)) {
    alerts.push({
      type: 'danger',
      category: 'Emergency',
      title: 'CRITICAL EMERGENCY: Suspected Diabetic Ketoacidosis (DKA)',
      message: `Positive urine/blood ketones detected with elevated glucose (${bg} mg/dL) and ${mental || 'altered'} mental state.`,
      recommendation: 'Seek immediate Emergency Department evaluation for IV rehydration and continuous insulin therapy.',
    });
  } else if (bg >= 600 || (bg >= 400 && mental && mental !== 'Alert')) {
    alerts.push({
      type: 'danger',
      category: 'Emergency',
      title: 'CRITICAL EMERGENCY: Suspected Hyperglycemic Hyperosmolar State (HHS)',
      message: `Severe hyperglycemia (${bg} mg/dL) with ${mental || 'altered'} mental status detected.`,
      recommendation: 'Transfer immediately to emergency critical care for hyperosmolar correction and fluid resuscitation.',
    });
  }

  // 2. Vital Signs Interpretation
  if (data.vitals) {
    const sys = data.vitals.systolicBp;
    const dia = data.vitals.diastolicBp;
    const spo2 = data.vitals.spO2;
    const hr = data.vitals.heartRate;
    const temp = data.vitals.temperature;

    if ((sys && sys >= 180) || (dia && dia >= 120)) {
      alerts.push({
        type: 'danger',
        category: 'Vitals',
        title: 'Hypertensive Crisis Alert',
        message: `Blood pressure reading (${sys || '--'}/${dia || '--'} mmHg) exceeds critical threshold.`,
        recommendation: 'Immediate clinical assessment required to rule out acute target organ damage.',
      });
    } else if ((sys && sys >= 140) || (dia && dia >= 90)) {
      alerts.push({
        type: 'warning',
        category: 'Vitals',
        title: 'Stage 2 Hypertension Detected',
        message: `Blood pressure (${sys || '--'}/${dia || '--'} mmHg) is elevated above ADA clinical targets.`,
        recommendation: 'Review antihypertensive regimen and target BP < 130/80 mmHg.',
      });
    }

    if (spo2 && spo2 < 90) {
      alerts.push({
        type: 'danger',
        category: 'Vitals',
        title: 'Hypoxia Warning (SpO2 < 90%)',
        message: `Oxygen saturation measured at ${spo2}%.`,
        recommendation: 'Administer supplemental O2 and evaluate cardiopulmonary status.',
      });
    }

    if (hr && hr > 100) {
      alerts.push({
        type: 'warning',
        category: 'Vitals',
        title: 'Sinus Tachycardia (HR > 100 bpm)',
        message: `Resting heart rate measured at ${hr} bpm.`,
        recommendation: 'Assess for dehydration, fever, autonomic neuropathy, or cardiac arrhythmia.',
      });
    }

    if (temp && temp >= 39.0) {
      alerts.push({
        type: 'warning',
        category: 'Vitals',
        title: 'High Pyrexia / Fever (°C)',
        message: `Body temperature at ${temp}°C.`,
        recommendation: 'Evaluate for acute infection which can trigger diabetic decompensation.',
      });
    }
  }

  // 3. Glycemic Profiling Interpretation
  if (data.glycemic) {
    const fbg = data.glycemic.fbg;
    const ogtt = data.glycemic.ogtt2h;

    if (fbg && fbg >= 126) {
      alerts.push({
        type: 'warning',
        category: 'Glycemic',
        title: 'Fasting Blood Glucose (Diabetic Range)',
        message: `FBG of ${fbg} mg/dL (Threshold for diagnostic diabetes >= 126 mg/dL).`,
        recommendation: 'Confirm with second fasting plasma glucose or oral glucose tolerance test.',
      });
    } else if (fbg && fbg >= 100) {
      alerts.push({
        type: 'info',
        category: 'Glycemic',
        title: 'Impaired Fasting Glucose (Prediabetes)',
        message: `FBG of ${fbg} mg/dL is within the prediabetic range (100–125 mg/dL).`,
        recommendation: 'Lifestyle modification program advised to prevent progression to Type 2 Diabetes.',
      });
    }

    if (ogtt && ogtt >= 200) {
      alerts.push({
        type: 'warning',
        category: 'Glycemic',
        title: '2-Hour OGTT Diabetic Diagnostic Level',
        message: `Post-challenge 2-hr plasma glucose of ${ogtt} mg/dL (Threshold >= 200 mg/dL).`,
        recommendation: 'Initiate formal glycemic management clinical protocol.',
      });
    }
  }

  // 4. Lab Panel Interpretation
  if (data.labs) {
    const egfr = data.labs.egfr;
    const uacr = data.labs.uacr;
    const ldl = data.labs.ldl;
    const tg = data.labs.triglycerides;

    if (egfr && egfr < 60) {
      alerts.push({
        type: 'warning',
        category: 'Renal',
        title: 'Chronic Kidney Disease (eGFR < 60 mL/min)',
        message: `Estimated GFR at ${egfr} mL/min/1.73m² indicates impaired renal filtration.`,
        recommendation: 'Screen for diabetic nephropathy and adjust renal-dosed medications.',
      });
    }

    if (uacr && uacr > 30) {
      alerts.push({
        type: 'info',
        category: 'Renal',
        title: 'Microalbuminuria Detected (UACR > 30 mg/g)',
        message: `Urine Albumin-to-Creatinine Ratio is ${uacr} mg/g.`,
        recommendation: 'Consider ACEi or ARB therapy for renal protection in diabetes.',
      });
    }

    if (ldl && ldl >= 160) {
      alerts.push({
        type: 'warning',
        category: 'Lipid',
        title: 'Elevated Atherogenic LDL Cholesterol',
        message: `LDL level of ${ldl} mg/dL increases cardiovascular complication risk.`,
        recommendation: 'Evaluate statin therapy according to ADA cardiovascular risk guidelines.',
      });
    }

    if (tg && tg >= 200) {
      alerts.push({
        type: 'info',
        category: 'Lipid',
        title: 'Hypertriglyceridemia (TG >= 200 mg/dL)',
        message: `Triglyceride level measured at ${tg} mg/dL.`,
        recommendation: 'Limit dietary refined sugars and alcohol; evaluate fibrate or omega-3 therapy if TG > 500.',
      });
    }
  }

  return alerts;
}

/**
 * Calculates rule-based diabetes risk assessment offline using weighted clinical indicators.
 */
export function offlinePredict(data: PredictionData, userId: string, userName?: string, userEmail?: string): PredictionResult {
  let logOdds = -3.8; // Base population log-odds (~2.2% baseline probability)
  const shapDetails: ShapDetail[] = [];
  const recommendations: string[] = [];

  // 1. HbA1c Level (Most influential biomarker)
  // Standard clinical ranges: < 5.7% (Normal), 5.7-6.4% (Prediabetes), >= 6.5% (Diabetes)
  if (data.hba1cLevel >= 6.5) {
    const delta = (data.hba1cLevel - 6.4) * 1.8 + 2.2;
    logOdds += delta;
    shapDetails.push({
      feature: 'hba1c_level',
      featureLabel: `HbA1c Level (${data.hba1cLevel}%)`,
      shap_value: Math.round(delta * 100) / 100,
      impact: 'positive',
      originalValue: `${data.hba1cLevel}%`,
      description: 'Glycated hemoglobin >= 6.5% strongly correlates with diabetes risk.',
    });
    recommendations.push(`Your HbA1c of ${data.hba1cLevel}% is in the diabetic range. Consult your doctor for glycemia management.`);
  } else if (data.hba1cLevel >= 5.7) {
    const delta = (data.hba1cLevel - 5.6) * 1.5;
    logOdds += delta;
    shapDetails.push({
      feature: 'hba1c_level',
      featureLabel: `HbA1c Level (${data.hba1cLevel}%)`,
      shap_value: Math.round(delta * 100) / 100,
      impact: 'positive',
      originalValue: `${data.hba1cLevel}%`,
      description: 'HbA1c in the pre-diabetic range (5.7% - 6.4%).',
    });
    recommendations.push(`HbA1c (${data.hba1cLevel}%) shows elevated risk. A low-glycemic index diet and exercise are advised.`);
  } else {
    const delta = -0.4;
    logOdds += delta;
    shapDetails.push({
      feature: 'hba1c_level',
      featureLabel: `HbA1c Level (${data.hba1cLevel}%)`,
      shap_value: delta,
      impact: 'negative',
      originalValue: `${data.hba1cLevel}%`,
      description: 'Optimal glycated hemoglobin level (< 5.7%).',
    });
  }

  // 2. Blood Glucose Level
  // Standard ranges: < 100 mg/dL (Normal), 100-125 (Impaired), >= 126 (High)
  if (data.bloodGlucoseLevel >= 200) {
    const delta = (data.bloodGlucoseLevel - 190) * 0.012 + 2.0;
    logOdds += delta;
    shapDetails.push({
      feature: 'blood_glucose_level',
      featureLabel: `Blood Glucose (${data.bloodGlucoseLevel} mg/dL)`,
      shap_value: Math.round(delta * 100) / 100,
      impact: 'positive',
      originalValue: `${data.bloodGlucoseLevel} mg/dL`,
      description: 'Markedly elevated blood glucose level.',
    });
    recommendations.push(`Blood glucose (${data.bloodGlucoseLevel} mg/dL) is significantly high. Urgent medical evaluation is recommended.`);
  } else if (data.bloodGlucoseLevel >= 140) {
    const delta = (data.bloodGlucoseLevel - 139) * 0.02 + 0.8;
    logOdds += delta;
    shapDetails.push({
      feature: 'blood_glucose_level',
      featureLabel: `Blood Glucose (${data.bloodGlucoseLevel} mg/dL)`,
      shap_value: Math.round(delta * 100) / 100,
      impact: 'positive',
      originalValue: `${data.bloodGlucoseLevel} mg/dL`,
      description: 'Elevated post-meal or random glucose level.',
    });
    recommendations.push(`Monitor blood glucose (${data.bloodGlucoseLevel} mg/dL) fasting and post-prandially.`);
  } else if (data.bloodGlucoseLevel >= 100) {
    const delta = (data.bloodGlucoseLevel - 99) * 0.01;
    logOdds += delta;
    shapDetails.push({
      feature: 'blood_glucose_level',
      featureLabel: `Blood Glucose (${data.bloodGlucoseLevel} mg/dL)`,
      shap_value: Math.round(delta * 100) / 100,
      impact: 'positive',
      originalValue: `${data.bloodGlucoseLevel} mg/dL`,
      description: 'Borderline fasting glucose range.',
    });
  } else {
    const delta = -0.3;
    logOdds += delta;
    shapDetails.push({
      feature: 'blood_glucose_level',
      featureLabel: `Blood Glucose (${data.bloodGlucoseLevel} mg/dL)`,
      shap_value: delta,
      impact: 'negative',
      originalValue: `${data.bloodGlucoseLevel} mg/dL`,
      description: 'Healthy fasting blood glucose range.',
    });
  }

  // 3. BMI (Body Mass Index)
  if (data.bmi >= 35) {
    const delta = (data.bmi - 34) * 0.08 + 1.2;
    logOdds += delta;
    shapDetails.push({
      feature: 'bmi',
      featureLabel: `BMI (${data.bmi} kg/m²)`,
      shap_value: Math.round(delta * 100) / 100,
      impact: 'positive',
      originalValue: `${data.bmi}`,
      description: 'Class II/III Obesity increases metabolic insulin resistance.',
    });
    recommendations.push('Reducing body weight by 5-10% substantially reduces metabolic risk and improves insulin sensitivity.');
  } else if (data.bmi >= 30) {
    const delta = (data.bmi - 29) * 0.09 + 0.5;
    logOdds += delta;
    shapDetails.push({
      feature: 'bmi',
      featureLabel: `BMI (${data.bmi} kg/m²)`,
      shap_value: Math.round(delta * 100) / 100,
      impact: 'positive',
      originalValue: `${data.bmi}`,
      description: 'Class I Obesity (BMI >= 30).',
    });
    recommendations.push('Incorporate structured aerobic exercise and dietary calorie deficit.');
  } else if (data.bmi >= 25) {
    const delta = (data.bmi - 24) * 0.05;
    logOdds += delta;
    shapDetails.push({
      feature: 'bmi',
      featureLabel: `BMI (${data.bmi} kg/m²)`,
      shap_value: Math.round(delta * 100) / 100,
      impact: 'positive',
      originalValue: `${data.bmi}`,
      description: 'Overweight category (BMI 25-29.9).',
    });
  } else {
    const delta = -0.25;
    logOdds += delta;
    shapDetails.push({
      feature: 'bmi',
      featureLabel: `BMI (${data.bmi} kg/m²)`,
      shap_value: delta,
      impact: 'negative',
      originalValue: `${data.bmi}`,
      description: 'Healthy Body Mass Index.',
    });
  }

  // 4. Age
  if (data.age >= 65) {
    const delta = 0.6;
    logOdds += delta;
    shapDetails.push({
      feature: 'age',
      featureLabel: `Age (${data.age} yrs)`,
      shap_value: delta,
      impact: 'positive',
      originalValue: `${data.age}`,
      description: 'Age over 65 increases metabolic and vascular risk factors.',
    });
  } else if (data.age >= 45) {
    const delta = 0.35;
    logOdds += delta;
    shapDetails.push({
      feature: 'age',
      featureLabel: `Age (${data.age} yrs)`,
      shap_value: delta,
      impact: 'positive',
      originalValue: `${data.age}`,
      description: 'Age 45+ is a recognized clinical risk factor for Type 2 Diabetes.',
    });
  } else {
    const delta = -0.2;
    logOdds += delta;
    shapDetails.push({
      feature: 'age',
      featureLabel: `Age (${data.age} yrs)`,
      shap_value: delta,
      impact: 'negative',
      originalValue: `${data.age}`,
      description: 'Younger age profile lowers statistical risk.',
    });
  }

  // 5. Hypertension
  if (data.hypertension === 1) {
    const delta = 0.45;
    logOdds += delta;
    shapDetails.push({
      feature: 'hypertension',
      featureLabel: 'Hypertension (Yes)',
      shap_value: delta,
      impact: 'positive',
      originalValue: 'Yes',
      description: 'Hypertension frequently co-occurs with metabolic syndrome.',
    });
    recommendations.push('Maintain blood pressure management (< 130/80 mmHg) to protect renal and cardiovascular function.');
  } else {
    const delta = -0.1;
    logOdds += delta;
    shapDetails.push({
      feature: 'hypertension',
      featureLabel: 'Hypertension (No)',
      shap_value: delta,
      impact: 'negative',
      originalValue: 'No',
      description: 'Normal blood pressure baseline.',
    });
  }

  // 6. Heart Disease
  if (data.heartDisease === 1) {
    const delta = 0.4;
    logOdds += delta;
    shapDetails.push({
      feature: 'heart_disease',
      featureLabel: 'Heart Disease (Yes)',
      shap_value: delta,
      impact: 'positive',
      originalValue: 'Yes',
      description: 'Pre-existing heart disease is linked to insulin resistance.',
    });
    recommendations.push('Coordinate diabetes screening with your cardiologist.');
  }

  // 7. Smoking History
  if (data.smokingHistory === 'current') {
    const delta = 0.35;
    logOdds += delta;
    shapDetails.push({
      feature: 'smoking_history',
      featureLabel: 'Smoking (Current)',
      shap_value: delta,
      impact: 'positive',
      originalValue: 'Current',
      description: 'Active smoking promotes systemic inflammation and insulin resistance.',
    });
    recommendations.push('Smoking cessation significantly reduces diabetic microvascular and macrovascular complications.');
  } else if (data.smokingHistory === 'former' || data.smokingHistory === 'ever') {
    const delta = 0.15;
    logOdds += delta;
    shapDetails.push({
      feature: 'smoking_history',
      featureLabel: `Smoking (${data.smokingHistory})`,
      shap_value: delta,
      impact: 'positive',
      originalValue: data.smokingHistory,
      description: 'History of smoking.',
    });
  }

  // Calculate Sigmoid Probability
  const probability = 1 / (1 + Math.exp(-logOdds));
  const roundedProb = Math.min(0.99, Math.max(0.01, Math.round(probability * 1000) / 1000));
  const prediction = roundedProb >= 0.5 ? 1 : 0;

  let riskTier: RiskTier;
  if (roundedProb < 0.30) {
    riskTier = 'Low Risk';
  } else if (roundedProb <= 0.70) {
    riskTier = 'Moderate Risk';
  } else {
    riskTier = 'High Risk';
  }

  if (recommendations.length === 0) {
    recommendations.push('Your biomarker profile indicates healthy metabolic status. Continue balanced nutrition and active lifestyle.');
  }

  // Sort SHAP details by magnitude
  shapDetails.sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));

  return {
    id: generateId(),
    userId,
    userName,
    userEmail,
    data,
    prediction,
    probability: roundedProb,
    riskTier,
    baseValue: 0.085,
    shapDetails,
    recommendations,
    cdssAlerts: computeCdssAlerts(data),
    mode: 'offline',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Executes assessment via Online API or falls back gracefully to offline scoring.
 */
export async function runPrediction(
  data: PredictionData,
  mode: 'offline' | 'online',
  apiUrl: string,
  userId: string,
  userName?: string,
  userEmail?: string
): Promise<PredictionResult> {
  if (mode === 'offline') {
    return offlinePredict(data, userId, userName, userEmail);
  }

  try {
    const endpoint = apiUrl.endsWith('/') ? `${apiUrl}predict` : `${apiUrl}/predict`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gender: data.gender,
        age: Number(data.age),
        hypertension: Number(data.hypertension),
        heart_disease: Number(data.heartDisease),
        smoking_history: data.smokingHistory,
        bmi: Number(data.bmi),
        hba1c_level: Number(data.hba1cLevel),
        blood_glucose_level: Number(data.bloodGlucoseLevel),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const res = await response.json();

    // Map backend JSON response to PredictionResult
    const shapDetails: ShapDetail[] = (res.shap_details || []).map((item: any) => ({
      feature: item.feature,
      featureLabel: getReadableFeatureLabel(item.feature, data),
      shap_value: typeof item.shap_value === 'number' ? Math.round(item.shap_value * 1000) / 1000 : 0,
      impact: item.impact || (item.shap_value > 0 ? 'positive' : 'negative'),
      description: getFeatureImpactDescription(item.feature, data),
    }));

    let riskTier: RiskTier = res.risk_tier || 'Low Risk';
    if (!['Low Risk', 'Moderate Risk', 'High Risk'].includes(riskTier)) {
      riskTier = res.probability >= 0.7 ? 'High Risk' : res.probability >= 0.3 ? 'Moderate Risk' : 'Low Risk';
    }

    return {
      id: generateId(),
      userId,
      userName,
      userEmail,
      data,
      prediction: res.prediction ?? (res.probability >= 0.5 ? 1 : 0),
      probability: res.probability,
      riskTier,
      baseValue: res.base_value || 0.085,
      shapDetails: shapDetails.length > 0 ? shapDetails : offlinePredict(data, userId).shapDetails,
      chartBase64: res.chart_base64,
      recommendations: res.recommendations || ['Consult a physician for detailed analysis.'],
      cdssAlerts: computeCdssAlerts(data),
      mode: 'online',
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Online API failed or unreachable. Falling back to offline mode:', err);
    const offlineResult = offlinePredict(data, userId, userName, userEmail);
    offlineResult.recommendations.unshift('⚠️ Server connection unreachable. Generated using Offline Clinical Engine.');
    return offlineResult;
  }
}

function getReadableFeatureLabel(featureKey: string, data: PredictionData): string {
  const map: Record<string, string> = {
    hba1c_level: `HbA1c Level (${data.hba1cLevel}%)`,
    HbA1c_level: `HbA1c Level (${data.hba1cLevel}%)`,
    blood_glucose_level: `Blood Glucose (${data.bloodGlucoseLevel} mg/dL)`,
    bmi: `BMI (${data.bmi} kg/m²)`,
    age: `Age (${data.age} yrs)`,
    hypertension: `Hypertension (${data.hypertension ? 'Yes' : 'No'})`,
    heart_disease: `Heart Disease (${data.heartDisease ? 'Yes' : 'No'})`,
    smoking_history: `Smoking History (${data.smokingHistory})`,
  };
  return map[featureKey] || featureKey;
}

function getFeatureImpactDescription(featureKey: string, data: PredictionData): string {
  if (featureKey.includes('hba1c')) return `Glycated hemoglobin measured at ${data.hba1cLevel}%.`;
  if (featureKey.includes('glucose')) return `Fasting or random blood glucose at ${data.bloodGlucoseLevel} mg/dL.`;
  if (featureKey.includes('bmi')) return `Body mass index of ${data.bmi} kg/m².`;
  if (featureKey.includes('age')) return `Patient age of ${data.age} years.`;
  return `Clinical parameter contribution: ${featureKey}`;
}
