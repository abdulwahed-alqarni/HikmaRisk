import React, { useState, useEffect } from 'react';
import { EducationalArticle } from '../types';
import { BookOpen, Search, Bookmark, BookmarkCheck, Clock, Calendar, User, ArrowRight, X, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ARTICLES: EducationalArticle[] = [
  {
    id: 'art-1',
    title: 'Low Glycemic Index Nutrition & Peripheral Insulin Sensitivity',
    category: 'Nutritional Science',
    summary: 'Discover how choosing complex carbohydrates and high-fiber foods smooths postprandial glucose spikes and improves metabolic health.',
    content: `
### Understanding the Glycemic Index (GI)
The Glycemic Index is a numerical scale (0–100) indicating how rapidly a carbohydrate-containing food elevates blood plasma glucose compared to pure glucose.

#### High vs. Low GI Foods
* **High GI (> 70):** White bread, refined sugars, instant potatoes. Cause rapid blood sugar spikes followed by steep insulin surges.
* **Low GI (< 55):** Legumes, lentils, steel-cut oats, non-starchy green vegetables. Digest slowly, releasing glucose gradually into the bloodstream.

#### Clinical Evidence on Glycemic Load
Studies published by the American Diabetes Association (ADA) indicate that adhering to a low glycemic diet over 6 months reduces mean HbA1c levels by **0.4% to 0.7%**, comparable to certain first-line antihyperglycemic pharmacotherapies.
    `,
    author: 'Dr. Fatima Al-Zahrani',
    date: '2026-07-15',
    readTime: '4 min read',
  },
  {
    id: 'art-2',
    title: 'Continuous Glucose Monitoring (CGM) & Sensor Tech Advances',
    category: 'Medical Technology',
    summary: 'An in-depth review of real-time sensor transceivers, trend arrows, and automated insulin delivery (AID) closed-loop systems.',
    content: `
### The Evolution of Blood Glucose Monitoring
Traditional finger-stick capillary blood tests provide discrete point-in-time snapshots. Continuous Glucose Monitors (CGMs) utilize subcutaneous interstitial fluid sensors to log readings every 1 to 5 minutes.

#### Key CGM Metrics to Track
1. **Time in Range (TIR):** Target > 70% of readings between 70–180 mg/dL.
2. **Glucose Variability (%CV):** Target < 36% coefficient of variation to reduce hypoglycemic exposure.
3. **Ambulatory Glucose Profile (AGP):** Standardized visual graph illustrating daily glycemic patterns.
    `,
    author: 'Dr. Robert Vance, MD',
    date: '2026-07-20',
    readTime: '6 min read',
  },
  {
    id: 'art-3',
    title: 'Aerobic & Resistance Exercise Protocols in Type 2 Diabetes Prevention',
    category: 'Preventive Strategies',
    summary: 'How combining 150 minutes of moderate aerobic exercise with bi-weekly resistance training activates GLUT4 glucose transporters.',
    content: `
### Muscle Contraction & Non-Insulin Mediated Glucose Uptake
During physical exercise, skeletal muscle contraction stimulates the translocation of GLUT4 glucose transporter proteins to the cell membrane **without requiring insulin action**.

#### Recommended Weekly Protocol
* **Aerobic Exercise:** 150 minutes per week of brisk walking, swimming, or cycling at 60-70% max heart rate.
* **Resistance Training:** 2-3 sessions per week targeting major muscle groups (squats, chest presses, core stability).
* **Sedentary Interruptions:** Stand and walk for 3 minutes every 30 minutes of sitting.
    `,
    author: 'Prof. Tariq Al-Hassan',
    date: '2026-07-28',
    readTime: '5 min read',
  },
  {
    id: 'art-4',
    title: 'Navigating Travel, Fasting, & Daily Life with Diabetes',
    category: 'Living with Diabetes',
    summary: 'Practical clinical advice for managing glycemic levels during travel, time zone shifts, and intermittent or religious fasting.',
    content: `
### Safe Fasting & Medication Adjustments
Fasting requires careful pre-assessment by a qualified physician to evaluate hypoglycemic risk factors.

#### Essential Tips
* Monitor blood glucose 3-4 times daily while fasting.
* Break fast immediately if blood glucose drops below 70 mg/dL (3.9 mmol/L) or exceeds 300 mg/dL.
* Maintain adequate fluid intake during non-fasting hours to prevent dehydration.
    `,
    author: 'Dr. Layla Al-Kindi',
    date: '2026-08-01',
    readTime: '5 min read',
  },
  {
    id: 'art-5',
    title: 'Machine Learning & Tree-Based Risk Models in Population Health',
    category: 'Research & Updates',
    summary: 'How XGBoost algorithms and SHAP interpretability are reshaping preventive endocrinology and risk stratification.',
    content: `
### Machine Learning in Clinical Screening
Machine learning frameworks evaluate complex multi-factorial interactions between biomarkers (HbA1c, glucose, BMI) and clinical history (hypertension, smoking history).

#### Why SHAP (SHapley Additive exPlanations) Matters
SHAP calculates game-theoretic feature contributions, explaining exactly why an AI model flagged a specific patient as high or moderate risk.
    `,
    author: 'HikmaRisk Research Team',
    date: '2026-08-01',
    readTime: '7 min read',
  },
];

export const EducationalHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<EducationalArticle | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('hikmarisk_fav_articles');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hikmarisk_fav_articles', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories = ['All', 'Favorites', 'Preventive Strategies', 'Nutritional Science', 'Medical Technology', 'Living with Diabetes', 'Research & Updates'];

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesCat =
      selectedCategory === 'All' ||
      (selectedCategory === 'Favorites' ? favorites.includes(art.id) : art.category === selectedCategory);
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5] text-xs font-bold rounded-full uppercase tracking-wider">
              Educational Resource Hub
            </span>
            <span className="text-xs text-slate-400">Clinical Guidelines &amp; Articles</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Predictive Wellness Knowledge Base</h1>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clinical topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#3B4D8C]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#3B4D8C] text-white shadow-md shadow-[#3B4D8C]/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => {
          const isFav = favorites.includes(article.id);
          return (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[#3B4D8C] dark:text-[#5A7BD5] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {article.category}
                  </span>
                  <button
                    onClick={(e) => toggleFavorite(article.id, e)}
                    className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                  >
                    {isFav ? <BookmarkCheck className="h-5 w-5 text-amber-500 fill-amber-500" /> : <Bookmark className="h-5 w-5" />}
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#3B4D8C] dark:group-hover:text-[#5A7BD5] transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <div className="flex items-center space-x-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reader Modal */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl text-slate-900 dark:text-slate-100"
            >
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-[#3B4D8C] dark:text-[#5A7BD5] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {activeArticle.category}
                  </span>
                  <h2 className="text-xl font-black">{activeArticle.title}</h2>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 pt-1">
                    <span>By {activeArticle.author}</span>
                    <span>•</span>
                    <span>{activeArticle.date}</span>
                    <span>•</span>
                    <span>{activeArticle.readTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-4 text-slate-700 dark:text-slate-300">
                {activeArticle.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-line">{paragraph}</p>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="py-2.5 px-6 rounded-2xl bg-[#3B4D8C] text-white text-xs font-bold hover:bg-[#2c3a69] transition-all"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
