import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onUploadSuccess: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const { getHeaders, logout } = useAuth();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file: File) => {
    // Check supported file extensions
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'doc', 'txt', 'md', 'csv'];
    if (!ext || !allowed.includes(ext)) {
      setUploadStatus({
        type: 'error',
        message: `Unsupported format: ${file.name}. Supported formats: PDF, DOCX, TXT, CSV, MD.`
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const authHeaders = getHeaders();
      const headers: Record<string, string> = {};
      if (authHeaders.Authorization) {
        headers['Authorization'] = authHeaders.Authorization;
      }

      const response = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        headers, // Do NOT set Content-Type header when uploading files via FormData
        body: formData,
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ingestion request failed.');
      }

      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${file.name}. Vector indexing enqueued.`
      });
      onUploadSuccess();
    } catch (err: any) {
      setUploadStatus({
        type: 'error',
        message: err.message || `Failed to upload ${file.name}.`
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl glow-indigo mb-6 shadow-sm dark:shadow-none transition-all duration-200">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ingest Knowledge</h2>
      
      <form 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          dragActive 
            ? 'border-brand-500 bg-brand-500/10' 
            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-brand-400 dark:hover:border-slate-700 hover:bg-slate-100/30 dark:hover:bg-slate-900/10'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept=".pdf,.docx,.doc,.txt,.md,.csv"
          onChange={handleChange}
        />

        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-3">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-brand-500 dark:text-brand-400 animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-brand-500 dark:text-brand-400" />
          )}
        </div>

        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {uploading ? 'Processing & Vectorizing...' : 'Drag & drop file or click to select'}
        </p>
        <span className="text-xs text-slate-500 mt-1 font-medium">
          PDF, DOCX, TXT, CSV, or MD (Max 10MB)
        </span>
      </form>

      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-xl flex items-start space-x-3 text-sm border ${
          uploadStatus.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-700 dark:text-emerald-350' 
            : 'bg-red-500/10 border-red-500/35 text-red-700 dark:text-red-350'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-semibold leading-relaxed">{uploadStatus.message}</span>
        </div>
      )}
    </div>
  );
};
