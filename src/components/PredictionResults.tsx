import React, { useRef } from 'react';
import { PredictionResult } from '../types';
import { exportReportAsPDF } from '../utils/pdfExport';
import { AlertCircle, AlertTriangle, CheckCircle2, Download, RefreshCw, Sparkles, ShieldAlert, Info, MessageSquare, Stethoscope } from 'lucide-react';
import { MedicalConsultation } from './MedicalConsultation';

interface PredictionResultsProps {
  result: PredictionResult;
  onReset: () => void;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({ result, onReset }) => {
  const consultationRef = useRef<HTMLDivElement>(null);
  const probPercent = Math.round(result.probability * 100);

  const scrollToConsultation = () => {
    consultationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getTierBadge = () => {
    switch (result.riskTier) {
      case 'High Risk':
        return {
          bg: 'bg-[#E74C3C]',
          strokeColor: '#E74C3C',
          pillBg: 'bg-red-50 dark:bg-red-950/40 text-[#E74C3C] border border-red-200 dark:border-red-900',
          icon: AlertCircle,
          label: 'High Risk Assessment',
        };
      case 'Moderate Risk':
        return {
          bg: 'bg-[#F39C12]',
          strokeColor: '#F39C12',
          pillBg: 'bg-amber-50 dark:bg-amber-950/40 text-[#F39C12] border border-amber-200 dark:border-amber-900',
          icon: AlertTriangle,
          label: 'Moderate Risk Assessment',
        };
      default:
        return {
          bg: 'bg-[#2ECC71]',
          strokeColor: '#2ECC71',
          pillBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#2ECC71] border border-emerald-200 dark:border-emerald-900',
          icon: CheckCircle2,
          label: 'Low Risk Assessment',
        };
    }
  };

  const badge = getTierBadge();
  const IconComp = badge.icon;

  const circumference = 552.92;
  const strokeDashoffset = circumference - (circumference * result.probability);

  const getHba1cBadge = (val: number) => {
    if (val < 5.7) return 'Normal';
    if (val <= 6.4) return 'Elevated';
    return 'Crit. High';
  };

  const getGlucoseBadge = (val: number) => {
    if (val < 100) return 'Optimal';
    if (val <= 125) return 'Elevated';
    return 'Crit. High';
  };

  const getBmiBadge = (val: number) => {
    if (val < 18.5) return 'Underweight';
    if (val <= 24.9) return 'Normal';
    if (val <= 29.9) return 'Overweight';
    return 'Obese';
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5] text-xs font-bold rounded-full uppercase tracking-wider">
              {result.mode.toUpperCase()} PREDICTION MODE
            </span>
            <span className="text-xs text-slate-400">Evaluated at {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Screening Intelligence &amp; CDSS Report</h1>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto flex-wrap sm:flex-nowrap gap-2">
          <button
            onClick={scrollToConsultation}
            className="flex-1 sm:flex-none py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Stethoscope className="h-4 w-4" />
            <span>AI Doctor Consult</span>
          </button>

          <button
            onClick={onReset}
            className="flex-1 sm:flex-none py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>New Assessment</span>
          </button>

          <button
            onClick={() => exportReportAsPDF(result)}
            className="flex-1 sm:flex-none py-2.5 px-5 rounded-2xl bg-[#3B4D8C] hover:bg-[#2c3a69] text-white text-xs font-bold shadow-lg shadow-[#3B4D8C]/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* CDSS Clinical Decision Support System Alerts Box */}
      {result.cdssAlerts && result.cdssAlerts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <span>Clinical Decision Support System (CDSS) Alerts</span>
            </h3>
            <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500">
              {result.cdssAlerts.length} Active Interpretations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.cdssAlerts.map((alert, idx) => {
              const alertStyle =
                alert.level === 'danger'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200'
                  : alert.level === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200';

              return (
                <div key={idx} className={`p-4 rounded-2xl border ${alertStyle} space-y-1`}>
                  <div className="flex items-center space-x-2 font-black text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">{alert.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Risk Assessment Hero Bento Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-white dark:border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badge.pillBg}`}>
                {badge.label}
              </span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <IconComp className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="relative inline-block">
                {/* SVG Radial Gauge */}
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="#e2e8f0" strokeWidth="12" fill="transparent" className="dark:stroke-slate-800" />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke={badge.strokeColor}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900 dark:text-white">
                    {probPercent}<span className="text-2xl font-bold">%</span>
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Probability</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center px-2">
              Based on XGBoost model evaluation and clinical risk markers, there is a <strong>{probPercent}%</strong> statistical probability of metabolic risk factors.
            </p>
            <button
              onClick={() => exportReportAsPDF(result)}
              className="w-full py-3.5 bg-[#3B4D8C] text-white rounded-2xl font-bold hover:bg-[#2c3a69] transition-all shadow-lg shadow-[#3B4D8C]/20 flex items-center justify-center space-x-2 text-xs cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Clinical Report (PDF)</span>
            </button>
          </div>
        </div>

        {/* Key Biometrics Bento Card */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-[#3B4D8C] rounded-[2.5rem] p-6 text-white shadow-xl shadow-[#3B4D8C]/10 border border-indigo-900/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Key Biomarker Profile</span>
              <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-mono text-white">8 Clinical Markers</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="flex flex-col justify-center items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-indigo-200 text-[10px] uppercase font-bold tracking-widest mb-1">HbA1c</span>
                <p className="text-2xl font-black">{result.data.hba1cLevel}%</p>
                <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full mt-2 font-bold">{getHba1cBadge(result.data.hba1cLevel)}</span>
              </div>

              <div className="flex flex-col justify-center items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-indigo-200 text-[10px] uppercase font-bold tracking-widest mb-1">Glucose</span>
                <p className="text-2xl font-black">{result.data.bloodGlucoseLevel}</p>
                <span className="text-[10px] text-red-200 font-bold mt-2 tracking-tighter bg-red-500/20 px-2 py-0.5 rounded-full">
                  {getGlucoseBadge(result.data.bloodGlucoseLevel)}
                </span>
              </div>

              <div className="flex flex-col justify-center items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-indigo-200 text-[10px] uppercase font-bold tracking-widest mb-1">BMI</span>
                <p className="text-2xl font-black">{result.data.bmi}</p>
                <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full mt-2 font-bold">{getBmiBadge(result.data.bmi)}</span>
              </div>

              <div className="flex flex-col justify-center items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-indigo-200 text-[10px] uppercase font-bold tracking-widest mb-1">Demographics</span>
                <p className="text-lg font-black">{result.data.age} yrs</p>
                <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full mt-2 font-bold">{result.data.gender}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-indigo-100 gap-2">
              <div>Hypertension: <strong>{result.data.hypertension ? 'Yes' : 'No'}</strong></div>
              <div>Heart Disease: <strong>{result.data.heartDisease ? 'Yes' : 'No'}</strong></div>
              <div>Smoking: <strong className="capitalize">{result.data.smokingHistory}</strong></div>
            </div>
          </div>

          {/* AI Explainability SHAP Bento Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Feature Contribution (SHAP Explainability)</span>
              <span className="text-[10px] text-[#3B4D8C] dark:text-[#5A7BD5] font-semibold">TreeExplainer v1.2</span>
            </h3>

            {result.chartBase64 ? (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-center">
                <img src={`data:image/png;base64,${result.chartBase64}`} alt="SHAP Feature Importance Chart" className="max-w-full rounded-xl shadow-sm" />
              </div>
            ) : (
              <div className="space-y-3">
                {result.shapDetails.slice(0, 5).map((item, idx) => {
                  const isPositive = item.shap_value > 0;
                  const absVal = Math.min(100, Math.abs(item.shap_value) * 50);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                        <span className="text-slate-700 dark:text-slate-300">{item.featureLabel || item.feature}</span>
                        <span className={isPositive ? 'text-[#E74C3C]' : 'text-emerald-500'}>
                          {isPositive ? `+${item.shap_value}` : item.shap_value}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isPositive ? 'bg-[#E74C3C]' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.max(10, absVal)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Bento Card */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F39C12] rounded-full"></span> Clinical Recommendations &amp; Action Plan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.recommendations.map((rec, idx) => {
              const colors = [
                'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50 text-amber-900 dark:text-amber-200',
                'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200',
                'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200',
              ];
              const tagLabels = ['Primary Action', 'Dietary Focus', 'Lifestyle & Follow-up'];
              return (
                <div key={idx} className={`p-4 rounded-2xl border text-xs space-y-1 ${colors[idx % colors.length]}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{tagLabels[idx % tagLabels.length]}</p>
                  <p className="font-semibold leading-relaxed">{rec}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Doctor Consultation Section right after screening result */}
      <div ref={consultationRef} className="pt-6">
        <MedicalConsultation predictionResult={result} />
      </div>
    </div>
  );
};
