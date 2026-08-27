import React from 'react';
import { User, PredictionResult } from '../types';
import { Activity, ShieldCheck, Heart, ArrowRight, Calendar, Sparkles, Scale, TestTube, LineChart as ChartIcon, PlusCircle, History as HistoryIcon, User as UserIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PatientDashboardHomeProps {
  user: User;
  predictions: PredictionResult[];
  onNavigate: (tab: 'wizard' | 'history' | 'bmi' | 'habits' | 'resources' | 'profile') => void;
  onSelectResult: (result: PredictionResult) => void;
}

export const PatientDashboardHome: React.FC<PatientDashboardHomeProps> = ({
  user,
  predictions,
  onNavigate,
  onSelectResult,
}) => {
  const latestPrediction = predictions.length > 0 ? predictions[0] : null;

  const getBmiCategory = (val?: number) => {
    if (!val) return 'Not Screened';
    if (val < 18.5) return 'Underweight';
    if (val <= 24.9) return 'Normal Weight';
    if (val <= 29.9) return 'Overweight';
    return 'Obese';
  };

  const getHba1cStatus = (val?: number) => {
    if (!val) return 'Not Screened';
    if (val < 5.7) return 'Normal (<5.7%)';
    if (val <= 6.4) return 'Prediabetic (5.7-6.4%)';
    return 'Diabetic Range (≥6.5%)';
  };

  const getMotivationalQuote = (tier?: string) => {
    if (tier === 'High Risk') {
      return 'Proactive daily interventions, low-GI nutrition, and medical follow-up dramatically reduce diabetes progression.';
    } else if (tier === 'Moderate Risk') {
      return 'You are in an optimal position to turn the tide through daily 30-minute walks and portion control.';
    }
    return 'Outstanding biometric profile! Keep up your healthy nutrition and daily active habits.';
  };

  // Prepare trend data
  const trendData = predictions
    .slice()
    .reverse()
    .map((p) => ({
      date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      probability: Math.round(p.probability * 100),
      tier: p.riskTier,
    }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#3B4D8C] rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-white/10 text-cyan-300 text-xs font-bold rounded-full uppercase tracking-wider">
              Patient Portal
            </span>
            <span className="text-xs text-slate-300 font-mono">ID: {user.id}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Welcome back, <span className="bg-gradient-to-r from-cyan-300 to-[#2ECC71] bg-clip-text text-transparent">{user.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
            "{getMotivationalQuote(latestPrediction?.riskTier)}"
          </p>
        </div>

        <button
          onClick={() => onNavigate('wizard')}
          className="py-3.5 px-6 rounded-2xl bg-[#2ECC71] hover:bg-[#27ae60] text-slate-950 font-bold text-xs shadow-lg shadow-[#2ECC71]/20 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Start New Screening</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Latest Risk Tier */}
        <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Latest Risk Tier</span>
          <p className={`text-base font-black ${
            latestPrediction?.riskTier === 'High Risk'
              ? 'text-red-500'
              : latestPrediction?.riskTier === 'Moderate Risk'
              ? 'text-amber-500'
              : 'text-emerald-500'
          }`}>
            {latestPrediction?.riskTier || 'No Screening'}
          </p>
          <span className="text-[10px] text-slate-400 block pt-1">Classification</span>
        </div>

        {/* Latest Risk Score */}
        <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Risk Score</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {latestPrediction ? `${Math.round(latestPrediction.probability * 100)}%` : '--'}
          </p>
          <span className="text-[10px] text-slate-400 block pt-1">XGBoost Probability</span>
        </div>

        {/* Last Screening Date */}
        <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Last Screening</span>
          <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
            {latestPrediction ? new Date(latestPrediction.createdAt).toLocaleDateString() : 'Never'}
          </p>
          <span className="text-[10px] text-slate-400 block pt-1">Biometric Record</span>
        </div>

        {/* BMI Status */}
        <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">BMI Status</span>
          <p className="text-xs font-black text-[#3B4D8C] dark:text-[#5A7BD5] mt-1">
            {latestPrediction ? `${latestPrediction.data.bmi} kg/m²` : '--'}
          </p>
          <span className="text-[10px] text-slate-500 font-medium block pt-1">
            {getBmiCategory(latestPrediction?.data.bmi)}
          </span>
        </div>

        {/* HbA1c Status */}
        <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">HbA1c Status</span>
          <p className="text-xs font-black text-[#3B4D8C] dark:text-[#5A7BD5] mt-1">
            {latestPrediction ? `${latestPrediction.data.hba1cLevel}%` : '--'}
          </p>
          <span className="text-[10px] text-slate-500 font-medium block pt-1">
            {getHba1cStatus(latestPrediction?.data.hba1cLevel)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart Bento Card */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <ChartIcon className="h-5 w-5 text-[#3B4D8C]" />
                <span>Personal Risk Trajectory Over Time</span>
              </h3>
              <p className="text-xs text-slate-400">Historical screening probability progression</p>
            </div>
          </div>

          {trendData.length > 0 ? (
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="probability" stroke="#3B4D8C" strokeWidth={3} dot={{ r: 6, fill: '#3B4D8C' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              No previous screening history found. Complete your first screening to populate trend data.
            </div>
          )}
        </div>

        {/* Quick Actions Bento Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Patient Shortcuts</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('wizard')}
                className="w-full p-3.5 rounded-2xl bg-[#3B4D8C] text-white text-xs font-bold hover:bg-[#2c3a69] transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <PlusCircle className="h-5 w-5 text-cyan-300" />
                  <span>Start New Assessment</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNavigate('history')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <HistoryIcon className="h-5 w-5 text-[#3B4D8C]" />
                  <span>View Full Screening History</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNavigate('bmi')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Scale className="h-5 w-5 text-[#2ECC71]" />
                  <span>Interactive BMI Calculator</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNavigate('habits')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span>Daily Habit &amp; Activity Tracker</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
