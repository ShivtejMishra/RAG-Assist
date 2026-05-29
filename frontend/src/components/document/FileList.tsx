import React from 'react';
import { DocumentInfo } from '../../types';
import { FileText, Trash2, CheckCircle2, AlertTriangle, RefreshCw, File } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FileListProps {
  documents: DocumentInfo[];
  loading: boolean;
  onDeleteSuccess: () => void;
}

export const FileList: React.FC<FileListProps> = ({ documents, loading, onDeleteSuccess }) => {
  const { getHeaders, logout } = useAuth();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? All associated vector embeddings will be permanently removed from Qdrant.')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/documents/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete file.');
      }
      onDeleteSuccess();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Indexing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Uploaded
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm font-medium">Fetching documents...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-all duration-200">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Ingested Knowledge Base</h3>
      </div>
      
      {documents.length === 0 ? (
        <div className="p-12 text-center text-slate-450 dark:text-slate-500">
          <FileText className="w-12 h-12 mx-auto stroke-[1.5] text-slate-350 dark:text-slate-650 mb-3" />
          <p className="text-sm font-medium">No files ingested yet.</p>
          <span className="text-xs text-slate-400 dark:text-slate-600">Upload documents above to inject company domain data.</span>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors duration-150">
              <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center flex-shrink-0">
                  <File className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.filename}</h4>
                  <div className="flex items-center space-x-2.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatBytes(doc.file_size)}</span>
                    <span>•</span>
                    <span>{doc.chunk_count} vector blocks</span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {getStatusBadge(doc.status)}
                
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all duration-150"
                  title="Delete Ingested File"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
