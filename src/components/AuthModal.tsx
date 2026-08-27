import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getUsers, saveUser, addAuditLog } from '../services/db';
import { hashPassword, generateId } from '../utils/crypto';
import { Lock, Mail, User as UserIcon, Shield, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const users = getUsers();
      const cleanEmail = email.trim().toLowerCase();

      if (isRegister) {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }
        if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
          setError('An account with this email address already exists.');
          setLoading(false);
          return;
        }

        const hashed = await hashPassword(password);
        const newUser: User = {
          id: generateId(),
          name: name.trim(),
          email: cleanEmail,
          passwordHash: hashed,
          role,
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        saveUser(newUser);
        addAuditLog(newUser.id, newUser.email, 'USER_REGISTERED', `New account registered as ${role}`);
        sessionStorage.setItem('hikmarisk_session', JSON.stringify(newUser));
        onLoginSuccess(newUser);
        onClose();
      } else {
        const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (!user) {
          setError('Invalid email address or password.');
          setLoading(false);
          return;
        }
        if (!user.isActive) {
          setError('This account has been deactivated by an administrator.');
          setLoading(false);
          return;
        }

        const hashed = await hashPassword(password);
        if (user.passwordHash !== hashed) {
          setError('Invalid email address or password.');
          setLoading(false);
          return;
        }

        addAuditLog(user.id, user.email, 'USER_LOGGED_IN', 'User logged in successfully');
        sessionStorage.setItem('hikmarisk_session', JSON.stringify(user));
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const users = getUsers();
      const user = users.find((u) => u.email.toLowerCase() === demoEmail.toLowerCase());
      if (user && user.isActive) {
        sessionStorage.setItem('hikmarisk_session', JSON.stringify(user));
        addAuditLog(user.id, user.email, 'DEMO_LOGIN', 'Quick demo access login');
        onLoginSuccess(user);
        onClose();
      } else {
        setError('Demo user account not found or disabled.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-6 text-white text-center">
          <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-3 backdrop-blur">
            <Shield className="h-7 w-7 text-indigo-200" />
          </div>
          <h2 className="text-xl font-bold">{isRegister ? 'Create HikmaRisk Account' : 'Sign In to HikmaRisk'}</h2>
          <p className="text-xs text-indigo-200 mt-1">
            {isRegister ? 'Register for clinical screening & tracking' : 'Access your personalized risk profile'}
          </p>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Quick Demo Access:</span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('patient@hikmarisk.med', 'patient123')}
              className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold transition-colors"
            >
              Patient Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@hikmarisk.med', 'admin123')}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold transition-colors"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. John Doe"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@hikmarisk.med"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
                    role === 'patient'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Patient</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
                    role === 'admin'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Administrator</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer switch */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
