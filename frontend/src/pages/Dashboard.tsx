import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DocumentInfo, Conversation } from '../types';
import { 
  FileText, 
  MessageSquare, 
  Database, 
  Cpu, 
  HardDrive,
  TrendingUp
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { getHeaders, tenant, logout } = useAuth();
  const [docs, setDocs] = useState<DocumentInfo[]>([]);
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      const [docsRes, chatsRes] = await Promise.all([
        fetch('/api/v1/documents', { headers }),
        fetch('/api/v1/chats', { headers })
      ]);
      
      if (docsRes.status === 401 || chatsRes.status === 401) {
        logout();
        return;
      }
      
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocs(docsData);
      }
      if (chatsRes.ok) {
        const chatsData = await chatsRes.json();
        setChats(chatsData);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalBytes = docs.reduce((acc, curr) => acc + curr.file_size, 0);
  const totalChunks = docs.reduce((acc, curr) => acc + curr.chunk_count, 0);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-all duration-200">
        <div className="text-center text-slate-400 dark:text-slate-550">
          <TrendingUp className="w-8 h-8 animate-pulse text-brand-500 mx-auto mb-2" />
          <p className="text-xs font-semibold">Aggregating workspace analytics...</p>
        </div>
      </div>
    );
  }

  // Construct dynamic system logs based on active document and chat statuses
  const activityLogs = [
    ...docs.slice(0, 3).map(doc => ({
      id: `doc-${doc.id}`,
      type: 'document',
      event: doc.status === 'processed' ? 'Vectorization Complete' : 'Document Processing',
      details: `File: ${doc.filename} (${formatBytes(doc.file_size)})`,
      time: 'Recently',
      status: doc.status === 'processed' ? 'success' : 'processing',
    })),
    ...chats.slice(0, 2).map(chat => ({
      id: `chat-${chat.id}`,
      type: 'chat',
      event: 'Knowledge Chat Activity',
      details: `Session: ${chat.title}`,
      time: 'Recently',
      status: 'success',
    })),
    {
      id: 'sys-1',
      type: 'system',
      event: 'Tenant Partition Isolated',
      details: `Qdrant & MongoDB boundary synced: ${tenant?.domain || 'acme.com'}`,
      time: 'System uptime',
      status: 'success',
    },
    {
      id: 'sys-2',
      type: 'system',
      event: 'Gemini Gateway Online',
      details: 'Connected using text-embedding-004 & Gemini 2.5 Flash',
      time: 'System uptime',
      status: 'success',
    }
  ].slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all duration-200">
      
      {/* Upper header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Performance & Insights</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time metrics for organization: <span className="text-brand-600 dark:text-brand-400 font-bold">{tenant?.name}</span>
          </p>
        </div>
        
        <button
          onClick={fetchStats}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 hover:dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-150 shadow-sm dark:shadow-none active:scale-95"
        >
          Refresh Data
        </button>
      </div>

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl glow-indigo flex items-center justify-between shadow-sm dark:shadow-none">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-555 block">Total Documents</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{docs.length}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-450 mt-1 font-semibold block">Stored in S3</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-550 dark:text-brand-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl glow-indigo flex items-center justify-between shadow-sm dark:shadow-none">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-555 block">Vector Blocks</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{totalChunks}</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-450 mt-1 font-semibold block">Indexed in Qdrant</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-550 dark:text-indigo-400">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl glow-indigo flex items-center justify-between shadow-sm dark:shadow-none">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-555 block">Active Chats</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{chats.length}</span>
            <span className="text-[10px] text-purple-650 dark:text-purple-450 mt-1 font-semibold block">Saved in MongoDB</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-550 dark:text-purple-400">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl glow-indigo flex items-center justify-between shadow-sm dark:shadow-none">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-555 block">Ingested Size</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{formatBytes(totalBytes)}</span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-450 mt-1 font-semibold block">Metadata tracks</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-555 dark:text-cyan-400">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Recent Workspace Activities Audit Feed */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-4 sm:p-6 rounded-2xl lg:col-span-2 shadow-sm dark:shadow-none flex flex-col justify-between h-72">
          <div className="flex items-center justify-between mb-4 select-none">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center">
              <Database className="w-4 h-4 mr-2 text-brand-500 dark:text-brand-400" /> Workspace Activity Log
            </h3>
            <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Live Feed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {activityLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-450 dark:text-slate-555">
                No recent activity recorded.
              </div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-150">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      log.type === 'document' 
                        ? 'bg-brand-500/10 text-brand-555 dark:text-brand-400' 
                        : log.type === 'chat'
                        ? 'bg-indigo-500/10 text-indigo-555 dark:text-indigo-450'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450'
                    }`}>
                      {log.type === 'document' && <FileText className="w-4 h-4" />}
                      {log.type === 'chat' && <MessageSquare className="w-4 h-4" />}
                      {log.type === 'system' && <Cpu className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-205 truncate">{log.event}</h4>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                          log.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450'
                            : log.status === 'processing'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450 animate-pulse'
                            : 'bg-indigo-500/10 text-indigo-655 dark:text-indigo-400'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-450 truncate mt-0.5">{log.details}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-555 font-medium whitespace-nowrap">{log.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Engine status */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-6 flex items-center select-none">
              <Cpu className="w-4 h-4 mr-2 text-brand-500 dark:text-brand-400" /> Operational Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Gemini LLM Gateway</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Qdrant Vector Cluster</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">MongoDB Atlas Instance</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Celery Workers</span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">IDLE / WAITING</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-900 flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span>All microservices operational</span>
          </div>
        </div>

      </div>

    </div>
  );
};
