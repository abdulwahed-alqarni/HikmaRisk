import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, saveUser, deleteUser, addAuditLog } from '../services/db';
import { Users, Search, Filter, Shield, UserCheck, Trash2, Key, Sparkles, CheckCircle2 } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'patient' | 'admin'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleRole = (user: User) => {
    const newRole = user.role === 'admin' ? 'patient' : 'admin';
    const updated = { ...user, role: newRole as any };
    saveUser(updated);
    addAuditLog('admin-sys', 'admin@hikmarisk.med', 'USER_ROLE_CHANGED', `Changed role for ${user.email} to ${newRole}`);
    setUsers(getUsers());
    showNotification(`Updated ${user.name}'s role to ${newRole.toUpperCase()}`);
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Are you sure you want to delete user ${user.email}?`)) {
      deleteUser(user.id);
      addAuditLog('admin-sys', 'admin@hikmarisk.med', 'USER_DELETED', `Deleted user ${user.email}`);
      setUsers(getUsers());
      showNotification(`User ${user.email} removed.`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5] text-xs font-bold rounded-full uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">User Access Control &amp; Provisioning</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">System User Management</h1>
        </div>

        {/* Search & Role Filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B4D8C]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{notification}</span>
        </div>
      )}

      {/* Users Bento Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden space-y-4">
        <div className="flex justify-between items-center pb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Registered Identity Records ({filteredUsers.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5] font-bold flex items-center justify-center text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleRole(u)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Toggle Role
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="p-1.5 rounded-xl border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
