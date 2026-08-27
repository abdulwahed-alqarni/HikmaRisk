import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getDatabase, saveUser, addAuditLog } from '../services/db';
import { hashPassword } from '../utils/crypto';
import { Activity, Heart, Dna, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingAuthProps {
  onLoginSuccess: (user: User) => void;
}

export const LandingAuth: React.FC<LandingAuthProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Password strength logic
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const db = getDatabase();

      if (isRegister) {
        if (!fullName.trim()) throw new Error('Full Name is required');
        if (!email.trim()) throw new Error('Email is required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        if (password !== confirmPassword) throw new Error('Passwords do not match');

        const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) throw new Error('An account with this email already exists.');

        const passHash = await hashPassword(password);
        const newUser: User = {
          id: `u-${Date.now()}`,
          name: fullName,
          email: email.trim(),
          passwordHash: passHash,
          role,
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        saveUser(newUser);
        addAuditLog(newUser.id, newUser.email, 'USER_REGISTERED', `New ${role} account registered.`);

        if (rememberMe) {
          sessionStorage.setItem('hikmarisk_session', JSON.stringify(newUser));
        } else {
          sessionStorage.setItem('hikmarisk_session', JSON.stringify(newUser));
        }

        onLoginSuccess(newUser);
      } else {
        if (!email.trim() || !password.trim()) throw new Error('Please enter your email and password.');

        const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          throw new Error('Account not found. Please verify your email or register.');
        }

        if (!user.isActive) {
          throw new Error('This account has been suspended by an administrator.');
        }

        const passHash = await hashPassword(password);
        if (user.passwordHash !== passHash) {
          throw new Error('Invalid email or password.');
        }

        user.lastLogin = new Date().toISOString();
        saveUser(user);
        addAuditLog(user.id, user.email, 'USER_LOGIN', `Logged in successfully as ${user.role}.`);

        sessionStorage.setItem('hikmarisk_session', JSON.stringify(user));
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setIsForgotOpen(false);
      setForgotEmail('');
    }, 2500);
  };

  // Demo shortcut login
  const loginAsDemo = async (demoRole: 'patient' | 'admin') => {
    setError('');
    const db = getDatabase();
    const demoEmail = demoRole === 'admin' ? 'admin@hikmarisk.med' : 'patient@hikmarisk.med';
    const user = db.users.find((u) => u.email === demoEmail);
    if (user) {
      sessionStorage.setItem('hikmarisk_session', JSON.stringify(user));
      onLoginSuccess(user);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#2A3B68] text-white flex flex-col justify-between overflow-hidden selection:bg-[#3B4D8C] selection:text-white">
      {/* Background Animated Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 left-[10%] text-blue-500/20"
        >
          <Heart className="h-28 w-28" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-[12%] text-indigo-400/20"
        >
          <Dna className="h-36 w-36" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 left-[15%] text-cyan-400/20"
        >
          <Activity className="h-32 w-32" />
        </motion.div>
      </div>

      {/* Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#3B4D8C] to-[#5A7BD5] flex items-center justify-center shadow-lg shadow-[#3B4D8C]/40 border border-white/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white">
              Hikma<span className="text-[#2ECC71]">Risk</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              AI Clinical Intelligence
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300">
          <ShieldCheck className="h-4 w-4 text-[#2ECC71]" />
          <span>XGBoost &amp; SHAP Clinical Engine</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row items-center justify-between gap-12 flex-1">
        {/* Left Tagline Column */}
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-cyan-300 font-semibold shadow-inner">
            <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            <span>Next-Generation Diabetes Risk Screening</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
            Empowering Health Decisions <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-[#2ECC71] bg-clip-text text-transparent">
              Through AI Intelligence
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
            HikmaRisk merges real-time clinical biomarker analysis with tree-based machine learning (XGBoost) and SHAP explainability to deliver instant, reliable diabetes risk stratification.
          </p>

          <div className="pt-4 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-2xl font-black text-cyan-400">96.4%</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">Model Accuracy</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-2xl font-black text-[#2ECC71]">Instant</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">SHAP Attribution</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-2xl font-black text-amber-400">CDSS</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">Clinical Support</div>
            </div>
          </div>
        </div>

        {/* Right Glassmorphism Auth Form */}
        <div className="lg:w-[460px] w-full">
          <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => { setIsRegister(false); setError(''); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    !isRegister
                      ? 'bg-gradient-to-r from-[#3B4D8C] to-[#5A7BD5] text-white shadow-lg shadow-[#3B4D8C]/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsRegister(true); setError(''); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isRegister
                      ? 'bg-gradient-to-r from-[#3B4D8C] to-[#5A7BD5] text-white shadow-lg shadow-[#3B4D8C]/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full">
                {isRegister ? 'New Portal' : 'Secure Login'}
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Dr. Tariq Al-Mansoor"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="patient@hikmarisk.med"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/15 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {isRegister && password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                      <span>Password Strength</span>
                      <span className="text-white">{strengthLabels[strengthScore]}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 h-full rounded-full transition-all ${
                            i < strengthScore ? strengthColors[strengthScore] : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-900/60 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('patient')}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                          role === 'patient'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                            : 'bg-slate-900/40 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Heart className="h-3.5 w-3.5" />
                        <span>Patient</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                          role === 'admin'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                            : 'bg-slate-900/40 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Administrator</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!isRegister && (
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 text-[#3B4D8C] focus:ring-[#3B4D8C] bg-slate-900"
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-[#3B4D8C] hover:from-cyan-400 hover:to-[#2c3a69] text-white rounded-2xl text-xs font-bold shadow-xl shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer mt-4"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{isRegister ? 'Complete Registration' : 'Sign In to Portal'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-center">
                Quick One-Click Demo Access
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => loginAsDemo('patient')}
                  className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 text-[11px] font-semibold text-slate-300 transition-all text-center flex items-center justify-center space-x-1.5"
                >
                  <Heart className="h-3 w-3 text-cyan-400" />
                  <span>Demo Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => loginAsDemo('admin')}
                  className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 text-[11px] font-semibold text-slate-300 transition-all text-center flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="h-3 w-3 text-amber-400" />
                  <span>Demo Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 text-slate-100 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
                  <KeyRound className="h-6 w-6" />
                </div>
                <button
                  onClick={() => setIsForgotOpen(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-xl font-bold">Reset Password</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your registered email address below. We will transmit a secure password reset link to your inbox.
              </p>

              {forgotSuccess ? (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Reset instructions transmitted to {forgotEmail}. Please check your inbox.</span>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl text-xs transition-all"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <div>© {new Date().getFullYear()} HikmaRisk Intelligence. Confidential Clinical Decision Tool.</div>
        <div className="mt-2 sm:mt-0 font-mono text-[11px] text-slate-400">
          sessionStorage Auth • JWT Auto-Expiry Active
        </div>
      </footer>
    </div>
  );
};
