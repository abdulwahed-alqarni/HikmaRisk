import { PredictionResult } from '../types';

export function exportReportAsPDF(result: PredictionResult): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export the PDF clinical report.');
    return;
  }

  const dateStr = new Date(result.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const riskColor =
    result.riskTier === 'High Risk' ? '#E74C3C' : result.riskTier === 'Moderate Risk' ? '#F39C12' : '#2ECC71';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HikmaRisk Clinical Assessment Report - ${result.id}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #fff; }
    .header { border-bottom: 2px solid #3B4D8C; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .title { color: #3B4D8C; font-size: 24px; font-weight: bold; margin: 0; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
    .banner { background: ${riskColor}15; border-left: 6px solid ${riskColor}; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .banner-title { font-size: 20px; font-weight: bold; color: ${riskColor}; margin: 0 0 6px 0; }
    .banner-prob { font-size: 15px; color: #334155; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .card-title { font-size: 14px; font-weight: bold; color: #475569; text-transform: uppercase; margin-bottom: 12px; }
    .item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .item-label { color: #64748b; }
    .item-val { font-weight: 600; color: #0f172a; }
    .shap-section { margin-bottom: 30px; }
    .shap-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .badge-pos { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 12px; font-weight: 600; }
    .badge-neg { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-weight: 600; }
    .rec-list { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
    .rec-item { margin-bottom: 8px; font-size: 14px; color: #1e3a8a; line-height: 1.5; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">HikmaRisk Diabetes Assessment</h1>
      <div class="subtitle">Screening ID: ${result.id} | Mode: ${result.mode.toUpperCase()}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold; color: #334155;">${result.userName || 'Patient Screening'}</div>
      <div class="subtitle">${dateStr}</div>
    </div>
  </div>

  <div class="banner">
    <div class="banner-title">Risk Tier: ${result.riskTier}</div>
    <div class="banner-prob">Calculated Diabetes Probability: <strong>${(result.probability * 100).toFixed(1)}%</strong></div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Biometric Markers</div>
      <div class="item"><span class="item-label">HbA1c Level:</span><span class="item-val">${result.data.hba1cLevel}%</span></div>
      <div class="item"><span class="item-label">Blood Glucose:</span><span class="item-val">${result.data.bloodGlucoseLevel} mg/dL</span></div>
      <div class="item"><span class="item-label">Body Mass Index (BMI):</span><span class="item-val">${result.data.bmi} kg/m²</span></div>
    </div>
    <div class="card">
      <div class="card-title">Demographics & History</div>
      <div class="item"><span class="item-label">Age & Gender:</span><span class="item-val">${result.data.age} yrs, ${result.data.gender}</span></div>
      <div class="item"><span class="item-label">Hypertension:</span><span class="item-val">${result.data.hypertension ? 'Yes' : 'No'}</span></div>
      <div class="item"><span class="item-label">Heart Disease:</span><span class="item-val">${result.data.heartDisease ? 'Yes' : 'No'}</span></div>
      <div class="item"><span class="item-label">Smoking History:</span><span class="item-val">${result.data.smokingHistory}</span></div>
    </div>
  </div>

  <div class="shap-section">
    <div class="card-title">Key Risk Factors & Feature Attribution</div>
    ${result.shapDetails
      .map(
        (s) => `
      <div class="shap-item">
        <span><strong>${s.featureLabel}</strong> - ${s.description || ''}</span>
        <span class="${s.impact === 'positive' ? 'badge-pos' : 'badge-neg'}">${s.impact === 'positive' ? '+' : ''}${s.shap_value}</span>
      </div>
    `
      )
      .join('')}
  </div>

  <div class="rec-list">
    <div style="font-weight: bold; color: #1e3a8a; margin-bottom: 10px;">Personalized Clinical Recommendations</div>
    ${result.recommendations.map((r) => `<div class="rec-item">• ${r}</div>`).join('')}
  </div>

  <div class="footer">
    <p><strong>Medical Disclaimer:</strong> HikmaRisk is an assistive screening tool for healthcare decision support. This report does not constitute a formal diagnosis. Always consult a licensed medical provider for diagnostic evaluation.</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
