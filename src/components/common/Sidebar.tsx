import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, FileText, LogOut, Shield, Database, LayoutDashboard, Sun, Moon, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeTab: 'chat' | 'documents' | 'dashboard';
  setActiveTab: (tab: 'chat' | 'documents' | 'dashboard') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, theme, toggleTheme }) => {
  const { user, tenant, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (tab: 'chat' | 'documents' | 'dashboard') => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

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
        {/* Close button — only visible in mobile overlay */}
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
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'dashboard'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Analytics Dashboard</span>
        </button>

        <button
          onClick={() => handleNavClick('chat')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'chat'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Knowledge Chat</span>
        </button>

        <button
          onClick={() => handleNavClick('documents')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'documents'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Document Manager</span>
        </button>
      </nav>

      {/* User Session & Theme Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        {user && (
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/50 mb-3 shadow-sm dark:shadow-none">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <Shield className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.full_name}</h4>
              <span className="text-[9px] text-slate-500 dark:text-slate-450 font-bold tracking-wider uppercase">
                {user.role}
              </span>
            </div>
          </div>
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

      {/* Desktop sidebar — always visible */}
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
