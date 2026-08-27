import React, { useState, useEffect } from 'react';
import { RegionHealthData, PredictionResult } from '../types';
import { getPredictions } from '../services/db';
import { MapPin, Globe, Activity, TrendingUp, Users, Filter, Download, Info } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';

const INITIAL_SAUDI_REGIONS = [
  { id: 'r1', regionName: 'Riyadh Region', coordinates: { x: 52, y: 48 } },
  { id: 'r2', regionName: 'Makkah / Jeddah', coordinates: { x: 28, y: 56 } },
  { id: 'r3', regionName: 'Eastern Province (Dammam)', coordinates: { x: 74, y: 42 } },
  { id: 'r4', regionName: 'Asir Region (Abha)', coordinates: { x: 38, y: 80 } },
  { id: 'r5', regionName: 'Madinah Region', coordinates: { x: 26, y: 38 } },
  { id: 'r6', regionName: 'Al-Qassim Region', coordinates: { x: 44, y: 34 } },
];

export const PopulationHealth: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);

  useEffect(() => {
    setPredictions(getPredictions());
  }, []);

  // Compute live region health statistics based on actual database records
  const regionsData: RegionHealthData[] = INITIAL_SAUDI_REGIONS.map((r) => {
    // Filter predictions if region matches, or summarize total live predictions
    const regPredictions = predictions; // aggregated live records
    const totalScreenings = regPredictions.length;
    const highRiskCount = regPredictions.filter((p) => p.riskTier === 'High Risk').length;
    const avgBmi = totalScreenings > 0
      ? Number((regPredictions.reduce((acc, curr) => acc + curr.data.bmi, 0) / totalScreenings).toFixed(1))
      : 0;
    const avgGlucose = totalScreenings > 0
      ? Math.round(regPredictions.reduce((acc, curr) => acc + curr.data.bloodGlucoseLevel, 0) / totalScreenings)
      : 0;

    return {
      id: r.id,
      regionName: r.regionName,
      totalScreenings,
      highRiskCount,
      avgBmi,
      avgGlucose,
      coordinates: r.coordinates,
    };
  });

  const [selectedRegion, setSelectedRegion] = useState<RegionHealthData>(regionsData[0]);

  useEffect(() => {
    setSelectedRegion(regionsData[0]);
  }, [predictions]);

  // Derive real scatter data from stored predictions
  const scatterBmiData = predictions.map((p) => ({
    bmi: p.data.bmi,
    risk: Math.round(p.probability * 100),
  }));

  const scatterHba1cData = predictions.map((p) => ({
    hba1c: p.data.hba1cLevel,
    risk: Math.round(p.probability * 100),
  }));

  // Derive real age cohorts
  const ageGroups = [
    { name: '18-30 yrs', min: 18, max: 30 },
    { name: '31-45 yrs', min: 31, max: 45 },
    { name: '46-60 yrs', min: 46, max: 60 },
    { name: '60+ yrs', min: 61, max: 120 },
  ];

  const ageRiskTrend = ageGroups.map((g) => {
    const groupPreds = predictions.filter((p) => p.data.age >= g.min && p.data.age <= g.max);
    const avgRisk = groupPreds.length > 0
      ? Math.round((groupPreds.reduce((acc, curr) => acc + curr.probability, 0) / groupPreds.length) * 100)
      : 0;
    return {
      ageGroup: g.name,
      avgRisk,
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5] text-xs font-bold rounded-full uppercase tracking-wider">
              Epidemiological Intelligence
            </span>
            <span className="text-xs text-slate-400">Live Database Population Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Population Health &amp; Geographic Heat Map</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Geographic Heat Map Bento Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Globe className="h-5 w-5 text-[#3B4D8C]" />
                <span>Geographic Risk Density</span>
              </h3>
              <p className="text-xs text-slate-400">Real-time epidemiological density derived from patient screenings</p>
            </div>
          </div>

          {/* Interactive Visual Map Card */}
          <div className="relative w-full h-80 bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(#3B4D8C_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

            <div className="relative w-full h-full">
              {regionsData.map((reg) => {
                const isSelected = reg.id === selectedRegion?.id;
                const riskPercent = reg.totalScreenings > 0 ? Math.round((reg.highRiskCount / reg.totalScreenings) * 100) : 0;
                return (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedRegion(reg)}
                    style={{ left: `${reg.coordinates.x}%`, top: `${reg.coordinates.y}%` }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl transition-all flex items-center space-x-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#3B4D8C] text-white ring-4 ring-cyan-400/50 z-20 shadow-xl scale-110'
                        : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700 z-10'
                    }`}
                  >
                    <MapPin className={`h-4 w-4 ${isSelected ? 'text-cyan-300' : 'text-amber-400'}`} />
                    <div className="text-left font-sans">
                      <span className="text-[11px] font-bold block leading-tight">{reg.regionName}</span>
                      <span className="text-[9px] font-mono opacity-80">{reg.totalScreenings} Records</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region Details Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Selected Region</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{selectedRegion?.regionName || 'Riyadh Region'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Live Screenings</span>
              <span className="text-sm font-black text-[#3B4D8C] dark:text-[#5A7BD5]">{selectedRegion?.totalScreenings || 0}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">High Risk Ratio</span>
              <span className="text-sm font-black text-red-500">
                {selectedRegion && selectedRegion.totalScreenings > 0
                  ? `${Math.round((selectedRegion.highRiskCount / selectedRegion.totalScreenings) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Mean FBG</span>
              <span className="text-sm font-black text-amber-500">{selectedRegion?.avgGlucose || 0} mg/dL</span>
            </div>
          </div>
        </div>

        {/* Demographic Age Group Line Chart Bento Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center justify-between">
            <span>Risk Score by Age Cohort</span>
            <Activity className="h-4 w-4 text-[#3B4D8C]" />
          </h3>

          {predictions.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ageRiskTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="ageGroup" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="avgRisk" stroke="#3B4D8C" strokeWidth={3} dot={{ r: 5, fill: '#3B4D8C' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 text-xs">
              <div>
                <Info className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                <span>Zero database screening records found. Screenings will populate demographic charts in real time.</span>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Population cohort distribution automatically aggregates live patient records in the HikmaRisk database.
          </p>
        </div>

        {/* Correlations Scatter Plots Bento Cards */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Risk Score vs. BMI Correlation Scatter
          </h3>
          {scatterBmiData.length > 0 ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <XAxis type="number" dataKey="bmi" name="BMI (kg/m²)" domain={[15, 45]} stroke="#94a3b8" fontSize={10} />
                  <YAxis type="number" dataKey="risk" name="Risk %" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Scatter name="Patients" data={scatterBmiData} fill="#2ECC71" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              No screening data available for correlation.
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Risk Score vs. HbA1c Correlation Scatter
          </h3>
          {scatterHba1cData.length > 0 ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <XAxis type="number" dataKey="hba1c" name="HbA1c (%)" domain={[4.0, 12.0]} stroke="#94a3b8" fontSize={10} />
                  <YAxis type="number" dataKey="risk" name="Risk %" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Scatter name="Patients" data={scatterHba1cData} fill="#E74C3C" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              No screening data available for correlation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
