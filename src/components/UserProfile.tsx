import React, { useState } from 'react';
import { User } from '../types';
import { saveUser, addAuditLog } from '../services/db';
import { hashPassword } from '../utils/crypto';
import { User as UserIcon, Mail, ShieldCheck, Key, Save, CheckCircle, Smartphone, MapPin } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onUpdateSuccess: (updated: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateSuccess }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '+966 50 123 4567');
  const [region, setRegion] = useState(user.region || 'Riyadh Region');
  const [newPassword, setNewPassword] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedUser: User = {
      ...user,
      name,
      phone,
      region,
    };

    if (newPassword.trim().length >= 6) {
      const passHash = await hashPassword(newPassword.trim());
      updatedUser.passwordHash = passHash;
    }

    saveUser(updatedUser);
    addAuditLog(user.id, user.email, 'PROFILE_UPDATED', 'Updated profile information.');
    sessionStorage.setItem('hikmarisk_session', JSON.stringify(updatedUser));
    onUpdateSuccess(updatedUser);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5] text-xs font-bold rounded-full uppercase tracking-wider">
            Account Preferences
          </span>
          <span className="text-xs text-slate-400">Manage Identity &amp; Security</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">User Profile &amp; Settings</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center space-x-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-[#3B4D8C] to-[#5A7BD5] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[#3B4D8C]/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-[#3B4D8C] dark:text-[#5A7BD5]">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>Profile and security credentials updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#3B4D8C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email (Read Only)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#3B4D8C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Geographic Region</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#3B4D8C]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <Key className="h-4 w-4 text-[#3B4D8C]" />
              <span>Security Credentials</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#3B4D8C]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="py-3 px-8 rounded-2xl bg-[#3B4D8C] hover:bg-[#2c3a69] text-white font-bold text-xs shadow-lg shadow-[#3B4D8C]/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
