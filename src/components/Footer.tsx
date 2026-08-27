import React from 'react';
import { AlertTriangle, ShieldCheck, GraduationCap, Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B132B] text-slate-400 py-10 border-t border-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Prominent Academic Graduation Accreditation Banner */}
        <div className="bg-[#1C2541]/90 border border-[#3B4D8C]/40 rounded-[2rem] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-200">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-[#3B4D8C] text-cyan-300 rounded-2xl shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                Saudi Academic Accreditation &amp; AI Engineering Project
              </span>
              <h4 className="font-black text-white text-sm mt-0.5">
                Graduation Project - Artificial Intelligence Major
              </h4>
              <p className="text-slate-300 text-xs">
                College of Computer Science • University of Bisha, Kingdom of Saudi Arabia
              </p>
            </div>
          </div>

          <div className="text-right border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 font-arabic text-xs space-y-0.5">
            <p className="font-bold text-cyan-200">مشروع تخرج - تخصص الذكاء الاصطناعي</p>
            <p className="text-slate-300">كلية علوم الحاسب - جامعة بيشة</p>
            <p className="text-[10px] text-slate-400">المملكة العربية السعودية</p>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-[2rem] p-5 sm:p-6 flex items-start space-x-3.5 text-xs text-slate-300">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Clinical &amp; Medical Disclaimer: </span>
            HikmaRisk is an assistive clinical decision support tool engineered for diabetes risk stratification and population health intelligence. It does not issue diagnostic determinations, replace professional physician judgment, or substitute for laboratory glucose testing. Always consult a qualified healthcare provider or call MOH <strong>937</strong> hotline in Saudi Arabia.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 px-2">
          <div className="flex items-center space-x-2 font-medium">
            <ShieldCheck className="h-4 w-4 text-[#2ECC71]" />
            <span>Encrypted Local Storage &amp; XGBoost / SHAP Explainability Engine</span>
          </div>
          <div className="mt-2 sm:mt-0 font-mono text-[11px]">
            © {new Date().getFullYear()} HikmaRisk • University of Bisha. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
