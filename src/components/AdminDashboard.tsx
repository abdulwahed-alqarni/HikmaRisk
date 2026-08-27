import React, { useState } from 'react';
import { User, PredictionResult, AuditLog } from '../types';
import { getUsers, getPredictions, getAuditLogs, toggleUserStatus } from '../services/db';
import { Activity, AlertCircle, Calendar, Download, FileSpreadsheet, Filter, Search, Shield, Users, UserCheck, UserX, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface AdminDashboardProps {
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefresh }) => {
  const users = getUsers();
  const predictions = getPredictions();
  const auditLogs = getAuditLogs();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'audit'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // KPIs
  const totalUsers = users.length;
  const totalScreenings = predictions.length;
  const highRiskCount = predictions.filter((p) => p.riskTier === 'High Risk').length;
  const highRiskPct = totalScreenings > 0 ? ((highRiskCount / totalScreenings) * 100).toFixed(1) : '0';

  // Calculate daily average screenings over past 30 days
  const dailyAvg = (totalScreenings / 30).toFixed(1);

  // Age group demographics data for Recharts
  const ageGroups = {
    '< 35': { total: 0, highRisk: 0 },
    '35 - 50': { total: 0, highRisk: 0 },
    '51 - 65': { total: 0, highRisk: 0 },
    '> 65': { total: 0, highRisk: 0 },
  };

  predictions.forEach((p) => {
    const age = p.data.age;
    const isHigh = p.riskTier === 'High Risk';
    if (age < 35) {
      ageGroups['< 35'].total++;
      if (isHigh) ageGroups['< 35'].highRisk++;
    } else if (age <= 50) {
      ageGroups['35 - 50'].total++;
      if (isHigh) ageGroups['35 - 50'].highRisk++;
    } else if (age <= 65) {
      ageGroups['51 - 65'].total++;
      if (isHigh) ageGroups['51 - 65'].highRisk++;
    } else {
      ageGroups['> 65'].total++;
      if (isHigh) ageGroups['> 65'].highRisk++;
    }
  });

  const ageData = Object.entries(ageGroups).map(([group, val]) => ({
    group,
    Total: val.total,
    HighRisk: val.highRisk,
  }));

  // Gender distribution data
  const genderMap: Record<string, number> = { Female: 0, Male: 0, Other: 0 };
  predictions.forEach((p) => {
    genderMap[p.data.gender] = (genderMap[p.data.gender] || 0) + 1;
  });
  const genderData = [
    { name: 'Female', value: genderMap['Female'] || 0, color: '#ec4899' },
    { name: 'Male', value: genderMap['Male'] || 0, color: '#3b82f6' },
    { name: 'Other', value: genderMap['Other'] || 0, color: '#8b5cf6' },
  ];

  // Smoking distribution data
  const smokingMap: Record<string, number> = {};
  predictions.forEach((p) => {
    const s = p.data.smokingHistory;
    smokingMap[s] = (smokingMap[s] || 0) + 1;
  });
  const smokingData = Object.entries(smokingMap).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    Count: count,
  }));

  // Toggle user active status
  const handleToggleUser = (userId: string) => {
    toggleUserStatus(userId);
    onRefresh();
  };

  // Export Audit Logs as CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'User Email', 'Action', 'Details', 'Timestamp'];
    const rows = auditLogs.map((log) => [
      log.id,
      `"${log.userEmail}"`,
      `"${log.action}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${log.timestamp}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hikmarisk_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered lists
  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.userEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3B4D8C] text-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-[#3B4D8C]/10 border border-indigo-900/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2.5 rounded-2xl bg-white/10 text-emerald-400">
              <Shield className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold">Clinical Administration &amp; Population Analytics</h1>
          </div>
          <p className="text-xs text-indigo-100 mt-1">
            Real-time aggregate risk monitoring, demographic distribution, user access controls, and security audit logging.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl text-xs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'analytics' ? 'bg-white text-[#3B4D8C] shadow' : 'text-indigo-100 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'users' ? 'bg-white text-[#3B4D8C] shadow' : 'text-indigo-100 hover:text-white'
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'audit' ? 'bg-white text-[#3B4D8C] shadow' : 'text-indigo-100 hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-white dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Registered Users</span>
            <Users className="h-5 w-5 text-[#3B4D8C]" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalUsers}</div>
          <div className="text-[10px] text-slate-400 mt-1">Active Patient &amp; Admin Profiles</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-white dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Screenings</span>
            <Activity className="h-5 w-5 text-[#2ECC71]" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalScreenings}</div>
          <div className="text-[10px] text-slate-400 mt-1">Evaluations recorded in DB</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-white dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">High Risk Share</span>
            <AlertCircle className="h-5 w-5 text-[#E74C3C]" />
          </div>
          <div className="text-3xl font-black text-[#E74C3C]">{highRiskPct}%</div>
          <div className="text-[10px] text-slate-400 mt-1">{highRiskCount} patients flagged high risk</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-white dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Daily Screening Rate</span>
            <Calendar className="h-5 w-5 text-[#F39C12]" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{dailyAvg} / day</div>
          <div className="text-[10px] text-slate-400 mt-1">30-day average frequency</div>
        </div>
      </div>

      {/* Tab 1: Demographic Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age Group Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-indigo-500" />
                  <span>Risk Distribution by Age Cohort</span>
                </h3>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="group" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="Total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Screenings" />
                    <Bar dataKey="HighRisk" fill="#ef4444" radius={[4, 4, 0, 0]} name="High Risk Flagged" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <PieIcon className="h-4 w-4 text-emerald-500" />
                  <span>Demographic Gender Breakdown</span>
                </h3>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Smoking Status Risk Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="h-4 w-4 text-amber-500" />
              <span>Screenings by Smoking Status</span>
            </h3>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={smokingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Management Table */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered System Accounts</h3>

            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Filter users..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 uppercase font-bold text-[10px] text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="p-3 font-mono">{u.email}</td>
                    <td className="p-3 capitalize font-semibold">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleUser(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          u.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400'
                        }`}
                      >
                        {u.isActive ? 'Disable Account' : 'Enable Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs Table */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security &amp; Action Audit Trail</h3>
              <p className="text-xs text-slate-400">Chronological ledger of user interactions, logins, and screenings.</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative w-56">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 uppercase font-bold text-[10px] text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User Email</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredLogs.slice(0, 100).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/40">
                    <td className="p-3 text-slate-400 font-mono shrink-0 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{log.userEmail}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{log.action}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
