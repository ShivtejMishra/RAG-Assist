import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, FileText, LogOut, Database, LayoutDashboard, Sun, Moon, Menu, X, User as UserIcon } from 'lucide-react';

type Tab = 'chat' | 'documents' | 'dashboard' | 'profile';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

/* Inline avatar with initials */
const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const gradients = ['from-brand-600 to-indigo-500', 'from-indigo-500 to-purple-600', 'from-emerald-500 to-cyan-500', 'from-amber-500 to-orange-500'];
  const g = gradients[name.charCodeAt(0) % gradients.length];
  return (
    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${g} flex items-center justify-center text-xs font-extrabold text-white shadow select-none flex-shrink-0`}>
      {initials}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, theme, toggleTheme }) => {
  const { user, tenant, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (tab: Tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const navBtn = (tab: Tab, Icon: React.FC<{ className?: string }>, label: string) => (
    <button
      onClick={() => handleNavClick(tab)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
        activeTab === tab
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </button>
  );

  const sidebarContent = (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col h-full text-slate-600 dark:text-slate-300 transition-all duration-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">RAGAssist</h1>
            <span className="text-xs text-brand-500 dark:text-brand-400 font-semibold tracking-wider uppercase glow-text-indigo">
              Enterprise
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tenant Context Indicator */}
      {tenant && (
        <div className="mx-4 my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 flex flex-col space-y-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Organization</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{tenant.name}</span>
          <span className="text-[11px] text-brand-600 dark:text-brand-400 font-mono truncate">{tenant.domain}</span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-2 space-y-1.5">
        {navBtn('dashboard', LayoutDashboard, 'Analytics Dashboard')}
        {navBtn('chat', MessageSquare, 'Knowledge Chat')}
        {navBtn('documents', FileText, 'Document Manager')}
        {navBtn('profile', UserIcon, 'My Profile')}
      </nav>

      {/* User Session & Theme Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        {user && (
          <button
            onClick={() => handleNavClick('profile')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl border mb-3 text-left transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-brand-600/10 border-brand-500/30 dark:border-brand-500/20'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/50 hover:border-brand-400/40 dark:hover:border-brand-500/30'
            } shadow-sm dark:shadow-none`}
          >
            <Avatar name={user.full_name} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.full_name}</h4>
              <span className="text-[9px] text-brand-600 dark:text-brand-400 font-bold tracking-wider uppercase">
                {user.role}
              </span>
            </div>
          </button>
        )}

        {/* Theme Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all duration-200 mb-1.5"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5 h-5 text-amber-500" />
              <span>Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-indigo-500" />
              <span>Dark Theme</span>
            </>
          )}
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow shadow-brand-500/20">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-white">RAGAssist</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 z-50 h-full transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
