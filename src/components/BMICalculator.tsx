import React, { useState } from 'react';
import { Scale, HeartPulse, Info, ArrowUpRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const BMICalculator: React.FC = () => {
  const [heightCm, setHeightCm] = useState(172);
  const [weightKg, setWeightKg] = useState(74);

  // Math calculation
  const heightMeters = heightCm / 100;
  const bmiRaw = heightMeters > 0 ? weightKg / (heightMeters * heightMeters) : 0;
  const bmi = Math.round(bmiRaw * 10) / 10;

  const getBmiCategory = (val: number) => {
    if (val < 18.5) {
      return {
        label: 'Underweight',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
        barColor: '#3B82F6',
        advice: 'Underweight status may indicate nutritional deficiency or underlying health conditions. Consult a clinician or nutritionist for structured calorie intake.',
      };
    } else if (val <= 24.9) {
      return {
        label: 'Normal Weight',
        color: 'text-[#2ECC71]',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
        barColor: '#2ECC71',
        advice: 'Optimal Body Mass Index. Continue maintaining a balanced low-glycemic Mediterranean or whole-food diet with 150 minutes of weekly aerobic exercise.',
      };
    } else if (val <= 29.9) {
      return {
        label: 'Overweight',
        color: 'text-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
        barColor: '#F59E0B',
        advice: 'Overweight classification moderately increases peripheral insulin resistance. Target 5% weight loss through daily activity and portion control.',
      };
    } else {
      return {
        label: 'Obese (Class I/II)',
        color: 'text-[#E74C3C]',
        bgColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
        barColor: '#E74C3C',
        advice: 'Obesity significantly elevates glycated hemoglobin and diabetic risk. Structured clinical lifestyle intervention and medical management are strongly recommended.',
      };
    }
  };

  const category = getBmiCategory(bmi);

  // Position indicator percentage (mapped across range 14 to 40)
  const minBmi = 14;
  const maxBmi = 40;
  const clampedBmi = Math.min(maxBmi, Math.max(minBmi, bmi));
  const indicatorPercent = ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 100;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5] text-xs font-bold rounded-full uppercase tracking-wider">
              Health Tool Module
            </span>
            <span className="text-xs text-slate-400">Body Composition Analysis</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Clinical BMI Calculator</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Sliders Card */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5] rounded-2xl">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Height &amp; Weight Metrics</h3>
              <p className="text-xs text-slate-400">Adjust sliders to calculate live Body Mass Index</p>
            </div>
          </div>

          {/* Height Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Height (cm)</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="120"
                  max="220"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-20 px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
                <span className="text-slate-400 font-medium">cm</span>
              </div>
            </div>
            <input
              type="range"
              min="120"
              max="220"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full accent-[#3B4D8C] h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Weight Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Weight (kg)</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="30"
                  max="180"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-20 px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
                <span className="text-slate-400 font-medium">kg</span>
              </div>
            </div>
            <input
              type="range"
              min="30"
              max="180"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-[#3B4D8C] h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-2">
            <Info className="h-4 w-4 text-[#3B4D8C] shrink-0 mt-0.5" />
            <span>Formula: BMI = weight (kg) / [height (m)]². Normal clinical reference range is 18.5 – 24.9 kg/m².</span>
          </div>
        </div>

        {/* Results & Animated Gauge Scale Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Calculated Output</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${category.bgColor} ${category.color}`}>
                {category.label}
              </span>
            </div>

            <div className="text-center space-y-1">
              <motion.div
                key={bmi}
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-black text-slate-900 dark:text-white tracking-tight"
              >
                {bmi}
              </motion.div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">kg/m²</div>
            </div>

            {/* Visual Animated Gauge Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Underweight (&lt;18.5)</span>
                <span>Normal (18.5-24.9)</span>
                <span>Overweight (25-29.9)</span>
                <span>Obese (&ge;30)</span>
              </div>

              <div className="relative w-full h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex">
                <div className="w-[17%] bg-blue-400 h-full" title="Underweight" />
                <div className="w-[23%] bg-emerald-500 h-full" title="Normal" />
                <div className="w-[21%] bg-amber-500 h-full" title="Overweight" />
                <div className="w-[39%] bg-red-500 h-full" title="Obese" />
              </div>

              {/* Indicator Arrow */}
              <div className="relative w-full h-4">
                <motion.div
                  animate={{ left: `${indicatorPercent}%` }}
                  transition={{ type: 'spring', stiffness: 120 }}
                  className="absolute -top-1 -ml-2 flex flex-col items-center"
                >
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-900 dark:border-b-white" />
                  <span className="text-[10px] font-black font-mono text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded shadow">
                    {bmi}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Health Advice Box */}
            <div className={`p-4 rounded-2xl border ${category.bgColor} space-y-2`}>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-[#3B4D8C] dark:text-[#5A7BD5]" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Clinical Guidance</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {category.advice}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
