import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/common/Sidebar';
import { FileUploader } from './components/document/FileUploader';
import { FileList } from './components/document/FileList';
import { ChatWindow } from './components/chat/ChatWindow';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DocumentInfo } from './types';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, getHeaders, logout } = useAuth();
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'dashboard'>('dashboard');
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    console.log('[Theme Debug] Applying theme to html classList:', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('LocalStorage blocked or unavailable:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      console.log('[Theme Debug] Toggling theme state to:', next);
      return next;
    });
  };

  // Document state and polling trigger
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [docsLoading, setDocsLoading] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const fetchDocuments = async (silent: boolean = false) => {
    if (!isAuthenticated) return;
    if (!silent) setDocsLoading(true);
    try {
      const response = await fetch('/api/v1/documents', {
        headers: getHeaders(),
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load documents list', err);
    } finally {
      if (!silent) setDocsLoading(false);
    }
  };

  // Poll for document status (essential for background celery vectorization)
  useEffect(() => {
    fetchDocuments(false);
  }, [isAuthenticated, refreshTrigger]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Check if any documents are in 'processing' or 'uploaded' state, and poll if so
    const hasActiveTasks = documents.some(
      doc => doc.status === 'processing' || doc.status === 'uploaded'
    );
    
    if (hasActiveTasks) {
      const interval = setInterval(() => {
        fetchDocuments(true);
      }, 3000); // poll every 3s
      return () => clearInterval(interval);
    }
  }, [documents, isAuthenticated]);

  const triggerDocsRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-brand-500 dark:text-brand-400">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
          <h2 className="text-sm font-bold tracking-widest uppercase">Initializing RAG Environment...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onLoginClick={() => setShowRegister(false)} />
    ) : (
      <Login onRegisterClick={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar Nav */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />
      
      {/* Main Display Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        {activeTab === 'dashboard' && <Dashboard />}

        {activeTab === 'chat' && <ChatWindow />}
        
        {activeTab === 'documents' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Document Center</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage files processed by Google Gemini and stored in Qdrant.</p>
            </div>
            
            <FileUploader onUploadSuccess={triggerDocsRefresh} />
            <FileList 
              documents={documents} 
              loading={docsLoading} 
              onDeleteSuccess={triggerDocsRefresh} 
            />
          </div>
        )}
      </main>
      
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
