import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, ShieldAlert, KeyRound, Mail } from 'lucide-react';

interface LoginProps {
  onRegisterClick: () => void;
}

export const Login: React.FC<LoginProps> = ({ onRegisterClick }) => {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      // handled by context state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden transition-all duration-200">
      
      {/* Decorative Gradient Background Elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-8 rounded-3xl glow-indigo z-10 shadow-lg dark:shadow-none transition-all duration-200">
        
        {/* Title Header */}
        <div className="text-center mb-8 bg-transparent">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Access Grounded Intelligence</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Sign in to query organization records.</p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 text-red-700 dark:text-red-300 text-xs">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Authentication failure</p>
              <p className="mt-0.5 leading-relaxed font-semibold">{error}</p>
            </div>
            <button 
              onClick={clearError}
              className="text-red-500 dark:text-red-400 hover:text-red-800 dark:hover:text-white font-bold leading-none text-sm p-1 rounded"
            >
              ×
            </button>
          </div>
        )}

        {/* Input Fields Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-slate-100/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-655 text-slate-800 dark:text-slate-200 outline-none transition-all duration-155"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-655 text-slate-800 dark:text-slate-200 outline-none transition-all duration-155"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center transition-all duration-155 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-[0.98]"
          >
            {loading ? 'Authenticating credentials...' : 'Authenticate Profile'}
          </button>
        </form>

        {/* Footer redirection */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/60 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
            New Organization?{' '}
            <button 
              onClick={onRegisterClick}
              className="text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 font-extrabold focus:outline-none hover:underline"
            >
              Register Tenant Group
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
