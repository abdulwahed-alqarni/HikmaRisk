import React, { useState, useEffect } from 'react';
import { HabitItem } from '../types';
import { Flame, Award, CheckCircle2, Circle, Trophy, Star, Sparkles, RefreshCw, Activity, Heart, Droplets, Utensils, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';

const INITIAL_HABITS: HabitItem[] = [
  { id: 'h1', title: 'Walk 30 minutes (Aerobic Exercise)', category: 'activity', completed: false },
  { id: 'h2', title: 'Check & Log Blood Glucose Level', category: 'glucose', completed: false },
  { id: 'h3', title: 'Hydrate: Drink 8 Glasses of Water', category: 'hydration', completed: false },
  { id: 'h4', title: 'Eat 5 Servings of Fresh Fruits & Vegetables', category: 'nutrition', completed: false },
  { id: 'h5', title: 'Limit Added Sugar & Refined Carbs', category: 'nutrition', completed: false },
  { id: 'h6', title: 'Monitor & Record Blood Pressure', category: 'blood_pressure', completed: false },
];

const MOTIVATIONAL_QUOTES = [
  "Small daily habits form the foundation of lifelong metabolic health.",
  "Every 30-minute walk improves muscle glucose transport independent of insulin.",
  "Consistency in preventive health today prevents diabetic complications tomorrow.",
  "Proper hydration optimizes renal filtration and blood viscosity.",
  "Empower your future self with mindful dietary choices every single day."
];

export const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem('hikmarisk_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem('hikmarisk_streak');
    return saved ? Number(saved) : 0;
  });

  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    localStorage.setItem('hikmarisk_habits', JSON.stringify(habits));
  }, [habits]);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Weekly data for Recharts
  const weeklyData = [
    { day: 'Mon', completed: 0 },
    { day: 'Tue', completed: 0 },
    { day: 'Wed', completed: 0 },
    { day: 'Thu', completed: 0 },
    { day: 'Fri', completed: 0 },
    { day: 'Sat', completed: 0 },
    { day: 'Sun (Today)', completed: completedCount },
  ];

  const getCategoryIcon = (cat: HabitItem['category']) => {
    switch (cat) {
      case 'activity': return <Activity className="h-4 w-4 text-emerald-500" />;
      case 'glucose': return <Heart className="h-4 w-4 text-red-500" />;
      case 'hydration': return <Droplets className="h-4 w-4 text-cyan-500" />;
      case 'nutrition': return <Utensils className="h-4 w-4 text-amber-500" />;
      default: return <Zap className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#3B4D8C] rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-white/10 text-cyan-300 text-[11px] font-bold rounded-full uppercase tracking-wider">
              Gamified Preventive Care
            </span>
            <span className="text-xs text-slate-300 font-mono">Level 1 Practitioner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Daily Preventive Habit Tracker</h1>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{MOTIVATIONAL_QUOTES[quoteIdx]}"
          </p>
        </div>

        {/* Streak Counter & Reward Badge */}
        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/15">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
              <Flame className="h-8 w-8" />
            </div>
            <div>
              <span className="text-3xl font-black text-white">{streakDays}</span>
              <span className="block text-[10px] text-amber-300 font-bold uppercase tracking-widest">
                Day Streak
              </span>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-white/15" />

          <div className="flex items-center space-x-2">
            <Trophy className="h-7 w-7 text-yellow-300" />
            <div className="text-left">
              <span className="text-xs font-bold text-white block">Glucose Sentinel</span>
              <span className="text-[10px] text-slate-300">Start Tracking</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Checklist Bento Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Preventive Checklist</h3>
              <p className="text-xs text-slate-400">Complete tasks daily to sustain your streak and lower metabolic risk</p>
            </div>
            <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5]">
              {completedCount} / {totalCount} Done
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500">Daily Completion</span>
              <span className="text-[#3B4D8C] dark:text-[#5A7BD5]">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 to-[#3B4D8C] rounded-full"
              />
            </div>
          </div>

          {/* List of Tasks */}
          <div className="space-y-3">
            {habits.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleHabit(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  item.completed
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                    {getCategoryIcon(item.category)}
                  </div>
                  <span className={`text-xs font-semibold ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                    {item.title}
                  </span>
                </div>

                <div>
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Summary & Achievements Bento Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center justify-between">
              <span>Weekly Completion Trend</span>
              <Award className="h-4 w-4 text-amber-500" />
            </h3>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 6]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 6 ? '#3B4D8C' : '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 rounded-2xl bg-[#3B4D8C]/10 border border-[#3B4D8C]/20 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-[#3B4D8C] dark:text-[#5A7BD5] font-bold">
                <Star className="h-4 w-4 fill-current" />
                <span>Habit Reward Milestones</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                Maintaining a 7-day completion streak unlocks the <strong>Glucose Champion Certificate</strong> and lowers long-term statistical risk indicators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
