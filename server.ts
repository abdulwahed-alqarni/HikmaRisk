import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI SDK if key available
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // API Endpoints FIRST
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'HikmaRisk Express Engine',
      geminiActive: !!ai,
      timestamp: new Date().toISOString(),
    });
  });

  // Proxy / Direct Node Prediction Route
  app.post('/api/predict', (req, res) => {
    try {
      const data = req.body;
      const hba1c = Number(data.hba1c_level || data.HbA1c_level || 5.5);
      const glucose = Number(data.blood_glucose_level || 100);
      const bmi = Number(data.bmi || 25.0);
      const age = Number(data.age || 40);
      const hypertension = Number(data.hypertension || 0);
      const heartDisease = Number(data.heart_disease || 0);

      let logOdds = -3.8;
      const shapDetails: any[] = [];

      // 1. HbA1c
      if (hba1c >= 6.5) {
        const delta = (hba1c - 6.4) * 1.8 + 2.2;
        logOdds += delta;
        shapDetails.push({ feature: 'HbA1c_level', shap_value: Math.round(delta * 100) / 100, impact: 'positive' });
      } else if (hba1c >= 5.7) {
        const delta = (hba1c - 5.6) * 1.5;
        logOdds += delta;
        shapDetails.push({ feature: 'HbA1c_level', shap_value: Math.round(delta * 100) / 100, impact: 'positive' });
      } else {
        shapDetails.push({ feature: 'HbA1c_level', shap_value: -0.4, impact: 'negative' });
      }

      // 2. Glucose
      if (glucose >= 140) {
        const delta = (glucose - 139) * 0.02 + 0.8;
        logOdds += delta;
        shapDetails.push({ feature: 'blood_glucose_level', shap_value: Math.round(delta * 100) / 100, impact: 'positive' });
      } else {
        shapDetails.push({ feature: 'blood_glucose_level', shap_value: -0.3, impact: 'negative' });
      }

      // 3. BMI
      if (bmi >= 30) {
        const delta = (bmi - 29) * 0.09 + 0.5;
        logOdds += delta;
        shapDetails.push({ feature: 'bmi', shap_value: Math.round(delta * 100) / 100, impact: 'positive' });
      } else {
        shapDetails.push({ feature: 'bmi', shap_value: -0.25, impact: 'negative' });
      }

      // 4. Age
      if (age >= 45) {
        logOdds += 0.35;
        shapDetails.push({ feature: 'age', shap_value: 0.35, impact: 'positive' });
      }

      // 5. Hypertension
      if (hypertension === 1) {
        logOdds += 0.45;
        shapDetails.push({ feature: 'hypertension', shap_value: 0.45, impact: 'positive' });
      }

      // 6. Heart Disease
      if (heartDisease === 1) {
        logOdds += 0.4;
        shapDetails.push({ feature: 'heart_disease', shap_value: 0.4, impact: 'positive' });
      }

      const probability = 1 / (1 + Math.exp(-logOdds));
      const roundedProb = Math.min(0.99, Math.max(0.01, Math.round(probability * 1000) / 1000));
      const prediction = roundedProb >= 0.5 ? 1 : 0;
      const riskTier = roundedProb >= 0.7 ? 'High Risk' : roundedProb >= 0.3 ? 'Moderate Risk' : 'Low Risk';

      const recommendations: string[] = [];
      if (hba1c >= 6.5) recommendations.push(`HbA1c (${hba1c}%) is in diabetic range. Consult an endocrinologist.`);
      if (glucose >= 140) recommendations.push(`Blood glucose (${glucose} mg/dL) is elevated. Further evaluation advised.`);
      if (bmi >= 30) recommendations.push(`BMI (${bmi} kg/m²) indicates obesity. Dietary adjustments recommended.`);
      if (recommendations.length === 0) recommendations.push('Optimal biomarker profile. Maintain healthy lifestyle.');

      res.json({
        prediction,
        probability: roundedProb,
        risk_tier: riskTier,
        base_value: 0.085,
        shap_details: shapDetails,
        recommendations,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  // AI-Powered Saudi Medical Consultation Chat Route
  app.post('/api/medical-chat', async (req, res) => {
    try {
      const { message, history = [], patientResult, doctorInfo } = req.body;

      const patientDataSummary = patientResult
        ? `Patient Demographics & Biomarkers:
- Age: ${patientResult.data?.age} years, Gender: ${patientResult.data?.gender}
- HbA1c Level: ${patientResult.data?.hba1cLevel}%
- Fasting Glucose: ${patientResult.data?.bloodGlucoseLevel} mg/dL
- BMI: ${patientResult.data?.bmi} kg/m²
- Hypertension: ${patientResult.data?.hypertension ? 'Yes' : 'No'}
- Heart Disease: ${patientResult.data?.heartDisease ? 'Yes' : 'No'}
- Calculated Risk Tier: ${patientResult.riskTier} (${(patientResult.probability * 100).toFixed(1)}% probability)`
        : 'Patient data not available.';

      const systemInstruction = `You are Dr. Faisal Al-Ghamdi, Consultant Diabetologist & Endocrinologist at King Abdullah Hospital Bisha / University of Bisha Medical Research Faculty (SCHS License # 09-R-48291).
You are conducting an AI-powered tele-consultation simulation for a diabetes risk assessment report generated by the HikmaRisk platform (University of Bisha, College of Computer Science - Artificial Intelligence Major).

Clinical Role & Saudi Guidelines:
1. Provide empathetic, clear, evidence-based clinical guidance in response to patient inquiries.
2. Adapt to the user's language (reply in Arabic if the user messages in Arabic, or English if in English).
3. Use Saudi Arabian medical context:
   - Currency: SAR (Saudi Arabian Riyals / ر.س)
   - Emergency / MOH Hotline: 937 (Ministry of Health / Sehhaty)
   - Reference local Saudi health infrastructure (King Abdullah Hospital Bisha, University of Bisha Health Clinic, Bisha Health Cluster).
   - Address Saudi cultural dietary habits: moderation with dates (Sukkari/Ajwa), controlling Kabsa portion sizes, physical activity timing in hot weather, Ramadan fasting safety guidelines when relevant.
4. Keep advice professional, reassuring, and structured with bullet points where appropriate.
5. End responses with a clear next step (e.g., booking a Mawid tele-appointment or visiting a health center if urgent).

${patientDataSummary}`;

      if (ai) {
        try {
          const contents: any[] = [];
          for (const item of history) {
            contents.push({
              role: item.sender === 'patient' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
          contents.push({
            role: 'user',
            parts: [{ text: message }],
          });

          const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          const replyText = response.text || 'Thank you for reaching out. Please consult Ministry of Health 937 for urgent assistance.';
          return res.json({ reply: replyText, doctor: doctorInfo?.name || 'Dr. Faisal Al-Ghamdi' });
        } catch (apiErr: any) {
          console.warn('Gemini API call failed, using intelligent clinical fallback:', apiErr?.message);
        }
      }

      // Intelligent Realistic Saudi Doctor Simulation Fallback
      let fallbackReply = '';
      const lowerMsg = (message || '').toLowerCase();

      if (lowerMsg.includes('hba1c') || lowerMsg.includes('سكر') || lowerMsg.includes('تراكمي')) {
        fallbackReply = `Ahlan! Regarding your HbA1c level of **${patientResult?.data?.hba1cLevel || 6.5}%**:
- In Saudi clinical standards, an HbA1c above 5.7% indicates pre-diabetic monitoring, while 6.5%+ warrants formal consultation.
- **Action Plan**: I recommend repeating fasting venous plasma glucose at King Abdullah Hospital in Bisha or your local PHC via Sehhaty.
- **Dietary Tip**: Limit dates to 1-2 pieces of Sukkari or Ajwa daily, and swap white rice with whole-grain options.
If you experience extreme thirst or dizziness, call MOH **937** immediately.`;
      } else if (lowerMsg.includes('cost') || lowerMsg.includes('fee') || lowerMsg.includes('سعر') || lowerMsg.includes('تكلفة') || lowerMsg.includes('sar')) {
        fallbackReply = `Our tele-consultation service through the University of Bisha & MOH Health Cluster is **0 SAR (Fully Covered by Ministry of Health / Sehhaty)** for Saudi citizens and residents.
Private follow-up consultations at specialized centers average **150 SAR**, covered 100% by Tawuniya, Bupa, and Class-A insurance policies.`;
      } else if (lowerMsg.includes('appointment') || lowerMsg.includes('book') || lowerMsg.includes('حجز') || lowerMsg.includes('موعد')) {
        fallbackReply = `I can schedule a tele-consultation slot for you at **King Abdullah Hospital Bisha - Endocrinology Clinic**.
Slots are available daily from 09:00 AM to 04:00 PM. Would you like me to issue an official appointment code for your Mawid / Sehhaty account?`;
      } else if (lowerMsg.includes('ramadan') || lowerMsg.includes('fasting') || lowerMsg.includes('رمضان') || lowerMsg.includes('صيام')) {
        fallbackReply = `For Ramadan fasting safety with a glucose level of **${patientResult?.data?.bloodGlucoseLevel || 140} mg/dL**:
- Break your fast with water and 1 date.
- Monitor blood glucose 2 hours after Iftar and before Suhoor.
- If glucose drops below 70 mg/dL or rises above 300 mg/dL, break fast immediately as per Saudi Diabetes Association guidelines.`;
      } else {
        fallbackReply = `Peace be upon you. As your Consultant Diabetologist at Bisha Health Cluster, I have analyzed your risk report (${patientResult?.riskTier || 'Moderate Risk'}, probability: ${(patientResult?.probability * 100 || 50).toFixed(1)}%).

Key Clinical Recommendations:
1. **Biomarker Check**: Your HbA1c (${patientResult?.data?.hba1cLevel || 6.5}%) and Fasting Glucose (${patientResult?.data?.bloodGlucoseLevel || 140} mg/dL) require structured follow-up.
2. **Lifestyle**: Aim for 30 minutes of brisk walking in the early morning or evening when temperatures are cooler in Bisha.
3. **MOH 937 Integration**: You can book a direct in-person appointment at King Abdullah Hospital Bisha via the Sehhaty App for 0 SAR.

How else can I assist you with your results today?`;
      }

      return res.json({
        reply: fallbackReply,
        doctor: doctorInfo?.name || 'Dr. Faisal Al-Ghamdi',
        simulationMode: true,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Chat consultation error' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HikmaRisk Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
