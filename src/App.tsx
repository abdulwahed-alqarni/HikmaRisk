import React, { useEffect, useState } from 'react';
import { User, PredictionResult, AppSettings } from './types';
import { initDatabase, getSettings, getPredictions, savePrediction } from './services/db';
import { Navbar, TabType } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingAuth } from './components/LandingAuth';
import { PatientDashboardHome } from './components/PatientDashboardHome';
import { AssessmentWizard } from './components/AssessmentWizard';
import { PredictionResults } from './components/PredictionResults';
import { HistoryView } from './components/HistoryView';
import { BMICalculator } from './components/BMICalculator';
import { HabitTracker } from './components/HabitTracker';
import { EducationalHub } from './components/EducationalHub';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/AdminDashboard';
import { UserManagement } from './components/UserManagement';
import { PopulationHealth } from './components/PopulationHealth';
import { AuditLogs } from './components/AuditLogs';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { MedicalConsultation } from './components/MedicalConsultation';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  const [settings, setSettings] = useState<AppSettings>({
    apiUrl: '/api',
    mode: 'offline',
    darkMode: false,
  });

  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(null);
  const [userPredictions, setUserPredictions] = useState<PredictionResult[]>([]);

  // Initialize DB & Session on mount
  useEffect(() => {
    async function setup() {
      const db = await initDatabase();
      setSettings(db.settings || { apiUrl: '/api', mode: 'offline', darkMode: false });

      // Check session
      const savedSession = sessionStorage.getItem('hikmarisk_session');
      if (savedSession) {
        try {
          const user: User = JSON.parse(savedSession);
          setCurrentUser(user);
          setActiveTab(user.role === 'admin' ? 'admin-dash' : 'home');
        } catch {
          setCurrentUser(null);
        }
      }
      setDbReady(true);
    }

    setup();
  }, []);

  // Update predictions list whenever currentUser or tab changes
  useEffect(() => {
    if (dbReady && currentUser) {
      if (currentUser.role === 'admin') {
        setUserPredictions(getPredictions());
      } else {
        setUserPredictions(getPredictions(currentUser.id));
      }
    }
  }, [dbReady, currentUser, activeTab, currentResult]);

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleToggleDarkMode = () => {
    const nextVal = !settings.darkMode;
    setSettings((prev) => ({ ...prev, darkMode: nextVal }));
  };

  const handleToggleMode = () => {
    const nextMode = settings.mode === 'offline' ? 'online' : 'offline';
    setSettings((prev) => ({ ...prev, mode: nextMode }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hikmarisk_session');
    setCurrentUser(null);
    setCurrentResult(null);
  };

  const handlePredictionComplete = (result: PredictionResult) => {
    savePrediction(result);
    setCurrentResult(result);
  };

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 font-medium">
        Loading HikmaRisk Clinical Engine...
      </div>
    );
  }

  // If no user is authenticated, render the full-screen Landing/Auth page
  if (!currentUser) {
    return (
      <LandingAuth
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab(user.role === 'admin' ? 'admin-dash' : 'home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-[#3B4D8C] selection:text-white">
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'wizard') setCurrentResult(null);
        }}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        darkMode={settings.darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {activeTab === 'home' && (
          <PatientDashboardHome
            user={currentUser}
            predictions={userPredictions}
            onNavigate={(tab) => {
              setActiveTab(tab);
              if (tab === 'wizard') setCurrentResult(null);
            }}
            onSelectResult={(res) => {
              setCurrentResult(res);
              setActiveTab('wizard');
            }}
          />
        )}

        {activeTab === 'wizard' && (
          <>
            {currentResult ? (
              <PredictionResults result={currentResult} onReset={() => setCurrentResult(null)} />
            ) : (
              <AssessmentWizard
                userId={currentUser.id}
                userName={currentUser.name}
                userEmail={currentUser.email}
                mode={settings.mode}
                apiUrl={settings.apiUrl}
                onPredictionComplete={handlePredictionComplete}
              />
            )}
          </>
        )}

        {activeTab === 'history' && (
          <HistoryView
            predictions={userPredictions}
            onRefresh={() => {
              if (currentUser) {
                setUserPredictions(currentUser.role === 'admin' ? getPredictions() : getPredictions(currentUser.id));
              }
            }}
            onSelectResult={(res) => {
              setCurrentResult(res);
              setActiveTab('wizard');
            }}
          />
        )}

        {activeTab === 'ai-consult' && (
          <MedicalConsultation
            predictionResult={currentResult || (userPredictions.length > 0 ? userPredictions[0] : undefined)}
          />
        )}

        {activeTab === 'bmi' && <BMICalculator />}

        {activeTab === 'habits' && <HabitTracker />}

        {activeTab === 'resources' && <EducationalHub />}

        {activeTab === 'profile' && (
          <UserProfile
            user={currentUser}
            onUpdateSuccess={(updatedUser) => {
              setCurrentUser(updatedUser);
            }}
          />
        )}

        {activeTab === 'admin-dash' && (
          <AdminDashboard
            onRefresh={() => {
              setUserPredictions(getPredictions());
            }}
          />
        )}

        {activeTab === 'admin-users' && <UserManagement />}

        {activeTab === 'admin-pop' && <PopulationHealth />}

        {activeTab === 'admin-logs' && <AuditLogs />}

        {activeTab === 'settings' && (
          <SettingsView
            currentUserId={currentUser.id}
            currentUserEmail={currentUser.email}
            darkMode={settings.darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onRefresh={() => {
              setSettings(getSettings());
            }}
          />
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab(user.role === 'admin' ? 'admin-dash' : 'home');
        }}
      />
    </div>
  );
}
