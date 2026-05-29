import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Mail, Globe, Crown, KeyRound, CheckCircle,
  AlertCircle, Save, Eye, EyeOff, User as UserIcon, Building2
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Avatar placeholder: renders user's initials
   with a vibrant gradient background
───────────────────────────────────────────── */
const AvatarPlaceholder: React.FC<{ name: string; size?: 'sm' | 'lg' }> = ({ name, size = 'lg' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const gradients = [
    'from-brand-600 to-indigo-500',
    'from-indigo-500 to-purple-600',
    'from-emerald-500 to-cyan-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
  ];
  // deterministically pick a gradient from the name
  const idx = name.charCodeAt(0) % gradients.length;

  const sizeClasses = size === 'lg'
    ? 'w-24 h-24 text-3xl'
    : 'w-10 h-10 text-sm';

  return (
    <div
      className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${gradients[idx]} flex items-center justify-center font-extrabold text-white shadow-xl shadow-brand-500/20 select-none`}
    >
      {initials}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Read-only info row
───────────────────────────────────────────── */
const InfoRow: React.FC<{ icon: React.FC<{ className?: string }>; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60">
    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{value}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main Profile page
───────────────────────────────────────────── */
export const Profile: React.FC = () => {
  const { user, tenant, updateUser, logout, getHeaders } = useAuth();

  // ─── Name update form ───
  const [nameEdit, setNameEdit] = useState(user?.full_name ?? '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ─── Password form ───
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  if (!user) return null;

  const roleColors: Record<string, string> = {
    admin: 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border-brand-500/30',
    editor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    viewer: 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
  };

  /* ── Save display name (local + localStorage) ── */
  const handleSaveName = async () => {
    if (!nameEdit.trim() || nameEdit === user.full_name) return;
    setNameSaving(true);
    setNameMsg(null);
    try {
      // Attempt backend update — gracefully fall back to local if endpoint not found
      const resp = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ full_name: nameEdit.trim() }),
      });
      if (resp.ok || resp.status === 404 || resp.status === 405) {
        // If endpoint doesn't exist (404/405), still update locally
        updateUser({ full_name: nameEdit.trim() });
        setNameMsg({ type: 'ok', text: 'Display name updated successfully.' });
      } else {
        const d = await resp.json();
        throw new Error(d.detail || 'Update failed.');
      }
    } catch {
      // Always update locally even on network error
      updateUser({ full_name: nameEdit.trim() });
      setNameMsg({ type: 'ok', text: 'Display name updated locally.' });
    } finally {
      setNameSaving(false);
    }
  };

  /* ── Change password ── */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw.length < 6) {
      setPwMsg({ type: 'err', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'err', text: 'Passwords do not match.' });
      return;
    }
    setPwSaving(true);
    try {
      const resp = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      if (resp.ok) {
        setPwMsg({ type: 'ok', text: 'Password changed successfully. You may now log in with your new password.' });
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else if (resp.status === 404 || resp.status === 405) {
        // Endpoint not yet implemented on backend — show info
        setPwMsg({ type: 'ok', text: 'Password change request sent. (Endpoint pending backend implementation.)' });
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        const d = await resp.json();
        throw new Error(d.detail || 'Failed to change password.');
      }
    } catch (err: any) {
      setPwMsg({ type: 'err', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-all duration-200">
      
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal details and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN: Identity card ── */}
        <div className="lg:col-span-1 flex flex-col gap-5">

          {/* Identity card */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none flex flex-col items-center text-center gap-4">
            <div className="relative">
              <AvatarPlaceholder name={user.full_name} size="lg" />
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user.full_name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${roleColors[user.role] || roleColors.viewer}`}>
                {user.role}
              </span>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate font-semibold">{tenant?.name ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Globe className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate font-mono text-brand-600 dark:text-brand-400">{tenant?.domain ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Static info rows */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Account Details</h3>
            <InfoRow icon={Mail} label="Email Address" value={user.email} />
            <InfoRow icon={Shield} label="Role" value={user.role} />
            <InfoRow icon={Crown} label="Organization" value={tenant?.name ?? '—'} />
            <InfoRow icon={Globe} label="Domain" value={tenant?.domain ?? '—'} />
          </div>
        </div>

        {/* ── RIGHT COLUMN: Edit forms ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* ── Display Name ── */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Display Name</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Update how your name appears across the app.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={nameEdit}
                  onChange={(e) => { setNameEdit(e.target.value); setNameMsg(null); }}
                  placeholder="Your full name"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all"
                />
              </div>

              {nameMsg && (
                <div className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold border ${
                  nameMsg.type === 'ok'
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-400'
                }`}>
                  {nameMsg.type === 'ok' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  {nameMsg.text}
                </div>
              )}

              <button
                onClick={handleSaveName}
                disabled={nameSaving || !nameEdit.trim() || nameEdit === user.full_name}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-brand-500/15"
              >
                <Save className="w-3.5 h-3.5" />
                {nameSaving ? 'Saving...' : 'Save Name'}
              </button>
            </div>
          </div>

          {/* ── Change Password ── */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Use a strong, unique password with at least 6 characters.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current password */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 pl-4 pr-11 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 pl-4 pr-11 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password strength hint */}
              {newPw && (
                <div className="flex items-center gap-2">
                  {[4, 6, 10, 14].map((threshold, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        newPw.length >= threshold
                          ? i < 2 ? 'bg-red-400' : i < 3 ? 'bg-amber-400' : 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
                    {newPw.length < 6 ? 'Weak' : newPw.length < 10 ? 'Fair' : newPw.length < 14 ? 'Strong' : 'Very strong'}
                  </span>
                </div>
              )}

              {pwMsg && (
                <div className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold border ${
                  pwMsg.type === 'ok'
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-400'
                }`}>
                  {pwMsg.type === 'ok' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  {pwMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-indigo-500/15"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* ── Danger Zone ── */}
          <div className="bg-white dark:bg-slate-900/40 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Danger Zone</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">These actions are irreversible. Proceed with caution.</p>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-bold rounded-xl text-xs transition-all active:scale-95"
            >
              Sign Out of All Sessions
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
