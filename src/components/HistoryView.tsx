import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { exportReportAsPDF } from '../utils/pdfExport';
import { deletePrediction } from '../services/db';
import { Calendar, ChevronDown, ChevronUp, Download, FileText, Filter, History as HistoryIcon, Search, Trash2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface HistoryViewProps {
  predictions: PredictionResult[];
  onRefresh: () => void;
  onSelectResult: (result: PredictionResult) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ predictions, onRefresh, onSelectResult }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = predictions.filter((p) => {
    const matchesSearch =
      (p.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === 'all' || p.riskTier.toLowerCase().includes(selectedTier);
    return matchesSearch && matchesTier;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this screening record?')) {
      deletePrediction(id);
      onRefresh();
    }
  };

  // Recharts timeline data
  const chartData = [...predictions]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((p) => ({
      date: new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      probability: Math.round(p.probability * 100),
      hba1c: p.data.hba1cLevel,
      glucose: p.data.bloodGlucoseLevel,
    }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-white dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2.5 rounded-2xl bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5]">
              <HistoryIcon className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Screening History &amp; Longitudinal Trends</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track past diabetes risk evaluations, biomarker evolutions, and clinical reports.
          </p>
        </div>

        <div className="text-xs font-bold px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          Total Assessments: {predictions.length}
        </div>
      </div>

      {/* Longitudinal Risk Trend Chart */}
      {chartData.length > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-white dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-[#3B4D8C]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
              Longitudinal Diabetes Risk Probability Trend (%)
            </h3>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="probability" name="Risk Probability" stroke="#3B4D8C" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-white dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search screenings by patient, email, or ID..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-[#3B4D8C] outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white font-medium outline-none"
          >
            <option value="all">All Risk Tiers</option>
            <option value="high">High Risk Only</option>
            <option value="moderate">Moderate Risk Only</option>
            <option value="low">Low Risk Only</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-white dark:border-slate-800 text-slate-400 text-xs font-medium">
            No past screening records match your query.
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const probPct = Math.round(item.probability * 100);
            const riskBg =
              item.riskTier === 'High Risk'
                ? 'bg-red-50 text-[#E74C3C] border border-red-200'
                : item.riskTier === 'Moderate Risk'
                ? 'bg-amber-50 text-[#F39C12] border border-amber-200'
                : 'bg-emerald-50 text-[#2ECC71] border border-emerald-200';

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-white dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-[#3B4D8C]/40"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${riskBg}`}>{item.riskTier} ({probPct}%)</span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
                          {item.mode}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                        Screening Record - {item.userName || item.userEmail || item.id}
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        <span>HbA1c: <strong>{item.data.hba1cLevel}%</strong></span>
                        <span>Glucose: <strong>{item.data.bloodGlucoseLevel} mg/dL</strong></span>
                        <span>BMI: <strong>{item.data.bmi}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectResult(item);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5] hover:bg-[#3B4D8C]/20 transition-colors"
                    >
                      View Report
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportReportAsPDF(item);
                      }}
                      className="p-2 text-slate-400 hover:text-[#3B4D8C] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Export PDF Report"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete screening"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3">
                    <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                      Key Feature Attributions (SHAP)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.shapDetails.slice(0, 4).map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="font-medium">{s.featureLabel}</span>
                          <span className={`font-mono font-bold ${s.impact === 'positive' ? 'text-[#E74C3C]' : 'text-[#2ECC71]'}`}>
                            {s.shap_value > 0 ? `+${s.shap_value}` : s.shap_value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">Recommendations Summary</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        {item.recommendations.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
