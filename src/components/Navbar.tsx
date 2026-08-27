import React from 'react';
import { User } from '../types';
import { Activity, Shield, User as UserIcon, LogOut, Settings as SettingsIcon, History, Stethoscope, Wifi, WifiOff, Sun, Moon, Home, Scale, Sparkles, BookOpen, Users, Globe, ShieldAlert } from 'lucide-react';

export type TabType =
  | 'home'
  | 'wizard'
  | 'ai-consult'
  | 'history'
  | 'bmi'
  | 'habits'
  | 'resources'
  | 'profile'
  | 'admin-dash'
  | 'admin-users'
  | 'admin-pop'
  | 'admin-logs'
  | 'settings';

interface NavbarProps {
  currentUser: User | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  mode?: 'offline' | 'online';
  onToggleMode?: () => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenAuthModal,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F4F7FB]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab(currentUser?.role === 'admin' ? 'admin-dash' : 'home')}
        >
          <div className="w-10 h-10 bg-[#3B4D8C] rounded-2xl flex items-center justify-center text-white shadow-md shadow-[#3B4D8C]/20 transition-transform group-hover:scale-105">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              HikmaRisk <span className="text-[#5A7BD5] font-normal">Predictor</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Clinical Diabetes Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Bar */}
        {currentUser && (
          <nav className="hidden lg:flex items-center space-x-1 bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 shadow-sm overflow-x-auto scrollbar-none max-w-2xl">
            {currentUser.role === 'admin' ? (
              <>
                <button
                  onClick={() => setActiveTab('admin-dash')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'admin-dash'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin-users')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'admin-users'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Users</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin-pop')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'admin-pop'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Population Map</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin-logs')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'admin-logs'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Audit Logs</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'settings'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                  <span>Settings</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'home'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => setActiveTab('wizard')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'wizard'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>New Screening</span>
                </button>

                <button
                  onClick={() => setActiveTab('ai-consult')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'ai-consult'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold'
                  }`}
                >
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-500" />
                  <span>AI Consult</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'history'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  <span>History</span>
                </button>

                <button
                  onClick={() => setActiveTab('bmi')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'bmi'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Scale className="h-3.5 w-3.5 text-emerald-500" />
                  <span>BMI Tool</span>
                </button>

                <button
                  onClick={() => setActiveTab('habits')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'habits'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Habit Tracker</span>
                </button>

                <button
                  onClick={() => setActiveTab('resources')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'resources'
                      ? 'bg-[#3B4D8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Resources</span>
                </button>
              </>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-[#3B4D8C]" />}
          </button>

          {/* User Account / Profile button */}
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 rounded-full bg-[#3B4D8C] text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-slate-800 hover:opacity-90 transition-opacity cursor-pointer"
              >
                {currentUser.name.charAt(0)}
              </button>
              <div className="hidden sm:flex flex-col text-left cursor-pointer" onClick={() => setActiveTab('profile')}>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{currentUser.name}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                  {currentUser.role}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="ml-1 p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-[#3B4D8C] hover:bg-[#2c3a69] text-white shadow-md shadow-[#3B4D8C]/20 transition-colors cursor-pointer"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In / Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
