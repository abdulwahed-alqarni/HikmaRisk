import React, { useState } from 'react';
import { PredictionData, PredictionResult } from '../types';
import { runPrediction } from '../services/predictor';
import { Activity, ArrowLeft, ArrowRight, CheckCircle2, Heart, Info, Stethoscope, User as UserIcon, Wifi, WifiOff, AlertTriangle, ShieldAlert, TestTube, Thermometer, Flame } from 'lucide-react';

interface AssessmentWizardProps {
  userId: string;
  userName?: string;
  userEmail?: string;
  mode: 'offline' | 'online';
  apiUrl: string;
  onPredictionComplete: (result: PredictionResult) => void;
  onToggleMode?: () => void;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  userId,
  userName,
  userEmail,
  mode,
  apiUrl,
  onPredictionComplete,
  onToggleMode,
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<PredictionData>({
    gender: 'Female',
    age: 42,
    hypertension: 0,
    heartDisease: 0,
    smokingHistory: 'never',
    bmi: 24.5,
    hba1cLevel: 5.8,
    bloodGlucoseLevel: 110,
    vitals: {
      systolicBp: 124,
      diastolicBp: 78,
      heartRate: 72,
      respiratoryRate: 16,
      temperature: 36.8,
      spO2: 98,
    },
    glycemic: {
      fbg: 105,
      ogtt2h: 135,
    },
    labs: {
      creatinine: 0.9,
      egfr: 95,
      uacr: 15,
      sodium: 140,
      potassium: 4.2,
      hco3: 24,
      bun: 14,
      totalCholesterol: 185,
      ldl: 110,
      hdl: 52,
      triglycerides: 130,
    },
    emergency: {
      ketones: 'Negative',
      mentalStatus: 'Alert',
    },
  });

  const totalSteps = 7;

  const handleNext = () => {
    if (step < totalSteps) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await runPrediction(formData, mode, apiUrl, userId, userName, userEmail);
      onPredictionComplete(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { id: 1, name: 'Personal Basics', icon: UserIcon },
    { id: 2, name: 'Medical History', icon: Heart },
    { id: 3, name: 'Vital Metrics', icon: Activity },
    { id: 4, name: 'Advanced Vitals', icon: Thermometer },
    { id: 5, name: 'Glycemic Profiling', icon: TestTube },
    { id: 6, name: 'Comprehensive Labs', icon: Stethoscope },
    { id: 7, name: 'Emergency Screening', icon: ShieldAlert },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-white dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2.5 rounded-2xl bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5]">
              <Stethoscope className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">7-Step Clinical Decision Support Wizard</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter patient biomarkers, vitals, glycemic panel, and emergency indicators for AI scoring and CDSS interpretation.
          </p>
        </div>

        {/* 7-Step Horizontal Progress Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between overflow-x-auto pb-2 scrollbar-none">
          {stepsList.map((s) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div
                key={s.id}
                onClick={() => {
                  if (s.id <= step) setStep(s.id);
                }}
                className={`flex items-center space-x-2 cursor-pointer transition-all whitespace-nowrap px-2 ${
                  isCurrent
                    ? 'text-[#3B4D8C] dark:text-[#5A7BD5] font-bold'
                    : isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                    : 'text-slate-400 dark:text-slate-600 font-medium'
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center text-[11px] transition-colors ${
                    isCurrent
                      ? 'bg-[#3B4D8C] text-white font-bold shadow-md shadow-[#3B4D8C]/20'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.id}
                </div>
                <span className="text-[11px] hidden md:inline">{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-white dark:border-slate-800 shadow-sm transition-all">
        {/* Step 1: Personal Basics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-[#3B4D8C]" />
                <span>Step 1: Personal Basics &amp; Demographics</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Baseline demographic features used in population risk modeling.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Female', 'Male', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                      className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all ${
                        formData.gender === g
                          ? 'border-[#3B4D8C] bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5] shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Age: <span className="text-[#3B4D8C] dark:text-[#5A7BD5] text-sm font-black">{formData.age} years</span>
                  </label>
                </div>
                <input
                  type="range"
                  min={18}
                  max={95}
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: Number(e.target.value) }))}
                  className="w-full accent-[#3B4D8C] cursor-pointer h-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Medical History */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Step 2: Medical History &amp; Vascular Factors</span>
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Hypertension (High BP)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Diagnosed chronic hypertension</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, hypertension: prev.hypertension === 1 ? 0 : 1 }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    formData.hypertension === 1 ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  {formData.hypertension === 1 ? 'Yes' : 'No'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Heart Disease</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">History of coronary artery disease</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, heartDisease: prev.heartDisease === 1 ? 0 : 1 }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    formData.heartDisease === 1 ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  {formData.heartDisease === 1 ? 'Yes' : 'No'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Smoking Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['never', 'former', 'current', 'ever', 'not current', 'No Info'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, smokingHistory: s as any }))}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize ${
                        formData.smokingHistory === s ? 'bg-[#3B4D8C]/10 border-[#3B4D8C] text-[#3B4D8C]' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Vital Metrics */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span>Step 3: Core Vital Metrics</span>
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  BMI: <span className="text-[#3B4D8C] font-black">{formData.bmi} kg/m²</span>
                </label>
                <input
                  type="range"
                  min={14}
                  max={50}
                  step={0.1}
                  value={formData.bmi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bmi: Number(e.target.value) }))}
                  className="w-full accent-[#3B4D8C] h-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  HbA1c Level: <span className="text-[#3B4D8C] font-black">{formData.hba1cLevel}%</span>
                </label>
                <input
                  type="range"
                  min={3.5}
                  max={12}
                  step={0.1}
                  value={formData.hba1cLevel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hba1cLevel: Number(e.target.value) }))}
                  className="w-full accent-[#3B4D8C] h-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Random / Fasting Blood Glucose: <span className="text-[#3B4D8C] font-black">{formData.bloodGlucoseLevel} mg/dL</span>
                </label>
                <input
                  type="range"
                  min={70}
                  max={350}
                  value={formData.bloodGlucoseLevel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bloodGlucoseLevel: Number(e.target.value) }))}
                  className="w-full accent-[#3B4D8C] h-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Advanced Vitals (Optional CDSS) */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-cyan-500" />
                <span>Step 4: Advanced Vitals CDSS Module</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Evaluate blood pressure crises, tachycardia, and hypoxic states.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  placeholder="120"
                  value={formData.vitals?.systolicBp || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vitals: { ...prev.vitals, systolicBp: Number(e.target.value) } }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  placeholder="80"
                  value={formData.vitals?.diastolicBp || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vitals: { ...prev.vitals, diastolicBp: Number(e.target.value) } }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  placeholder="72"
                  value={formData.vitals?.heartRate || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vitals: { ...prev.vitals, heartRate: Number(e.target.value) } }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={formData.vitals?.spO2 || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vitals: { ...prev.vitals, spO2: Number(e.target.value) } }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Glycemic Profiling */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <TestTube className="h-4 w-4 text-indigo-500" />
                <span>Step 5: Glycemic Profiling</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fasting Blood Glucose (FBG mg/dL)</label>
                <input
                  type="number"
                  placeholder="95"
                  value={formData.glycemic?.fbg || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, glycemic: { ...prev.glycemic, fbg: Number(e.target.value) } }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">2-Hour OGTT (mg/dL)</label>
                <input
                  type="number"
                  placeholder="135"
                  value={formData.glycemic?.ogtt2h || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, glycemic: { ...prev.glycemic, ogtt2h: Number(e.target.value) } }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Lab Panels */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Stethoscope className="h-4 w-4 text-purple-500" />
                <span>Step 6: Comprehensive Lab Panels</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Serum Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.9"
                  value={formData.labs?.creatinine || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, labs: { ...prev.labs, creatinine: Number(e.target.value) } }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">eGFR (mL/min)</label>
                <input
                  type="number"
                  placeholder="95"
                  value={formData.labs?.egfr || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, labs: { ...prev.labs, egfr: Number(e.target.value) } }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">LDL Cholesterol (mg/dL)</label>
                <input
                  type="number"
                  placeholder="110"
                  value={formData.labs?.ldl || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, labs: { ...prev.labs, ldl: Number(e.target.value) } }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Emergency Screening */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" />
                <span>Step 7: Acute Emergency CDSS Screening (DKA / HHS)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Detect acute decompensation markers requiring immediate transfer.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Urine / Blood Ketones</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Negative', 'Positive'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, emergency: { ...prev.emergency, ketones: k } }))}
                      className={`py-3 px-4 rounded-2xl border text-xs font-bold ${
                        formData.emergency?.ketones === k
                          ? k === 'Positive'
                            ? 'bg-red-500 text-white'
                            : 'bg-emerald-500 text-white'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600'
                      }`}
                    >
                      {k} Ketones
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Mental Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Alert', 'Confused', 'Unresponsive'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, emergency: { ...prev.emergency, mentalStatus: m } }))}
                      className={`py-3 px-4 rounded-2xl border text-xs font-bold ${
                        formData.emergency?.mentalStatus === m
                          ? m === 'Alert'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-600 text-white'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center space-x-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl text-xs font-bold bg-[#3B4D8C] hover:bg-[#2c3a69] text-white shadow-md shadow-[#3B4D8C]/20 flex items-center space-x-2 transition-colors"
            >
              <span>Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-2xl text-xs font-bold bg-[#3B4D8C] hover:bg-[#2c3a69] text-white shadow-xl shadow-[#3B4D8C]/30 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Stethoscope className="h-4 w-4" />
              <span>{loading ? 'Analyzing Biomarkers...' : 'Generate Full Risk & CDSS Report'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
