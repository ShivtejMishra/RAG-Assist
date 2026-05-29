import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, ShieldAlert, CheckCircle, Globe, Mail, Lock, User as UserIcon, Sun, Moon } from 'lucide-react';

interface RegisterProps {
  onLoginClick: () => void;
  onBackToLanding: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const inputClass = "w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all duration-150 placeholder-slate-400 dark:placeholder-slate-500";

export const Register: React.FC<RegisterProps> = ({ onLoginClick, onBackToLanding, theme, toggleTheme }) => {
  const { register, error, clearError } = useAuth();

  const [tenantName, setTenantName] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !domain || !adminName || !email || !password) return;

    setLoading(true);
    clearError();
    try {
      await register(tenantName, domain, email, password, adminName);
      setSuccess(true);
    } catch {
      // Handled by auth context error field
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden transition-all duration-200">

      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top bar — brand (left) + theme toggle (right) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2.5 group"
          aria-label="Back to home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all duration-200">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">RAGAssist</span>
            <span className="block text-[9px] text-brand-500 font-bold uppercase tracking-widest leading-none">Enterprise</span>
          </div>
          <span className="sm:hidden font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">RAGAssist</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-400 dark:hover:border-brand-500 shadow-sm transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4 text-indigo-500" />
          }
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-8 rounded-3xl glow-indigo z-10 shadow-lg dark:shadow-none transition-all duration-200">

        {/* Header Title */}
        <div className="text-center mb-6 bg-transparent">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Register Organization</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Establish isolated tenant boundaries and admin.</p>
        </div>

        {/* Success Panel */}
        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Workspace Provisioned</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal px-2 font-medium">
                Tenant isolation and database settings successfully created. You can now login with your administrator account.
              </p>
            </div>
            <button
              onClick={onLoginClick}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors duration-150 active:scale-95"
            >
              Sign In to RAGAssist
            </button>
          </div>
        ) : (
          <>
            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 text-red-700 dark:text-red-300 text-xs">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Setup failure</p>
                  <p className="mt-0.5 leading-relaxed font-semibold">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 dark:text-red-400 hover:text-red-850 dark:hover:text-white font-bold leading-none text-sm p-1 rounded"
                >
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                    Org Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Corp"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                    Domain
                  </label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="acme.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">
                  Admin Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Alice Smith"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">
                  Secure Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center transition-all duration-150 shadow-lg shadow-brand-500/10 active:scale-[0.98] mt-1"
              >
                {loading ? 'Configuring secure tenant...' : 'Provision Tenant Workspace'}
              </button>
            </form>

            {/* Back redirection footer */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/60 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                Already registered?{' '}
                <button
                  onClick={onLoginClick}
                  className="text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 font-extrabold focus:outline-none hover:underline"
                >
                  Sign In Profile
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
