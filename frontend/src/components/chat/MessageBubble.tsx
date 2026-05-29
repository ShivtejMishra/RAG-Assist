import React, { useState } from 'react';
import { Message, Citation } from '../../types';
import { FileText, User as UserIcon, Bot, CornerDownRight, X, ShieldCheck } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex space-x-4 max-w-4xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''} animate-fade-in`}>
        
        {/* Avatar with beautiful gradients */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${
          isUser 
            ? 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-slate-300 dark:border-slate-600/70 text-slate-700 dark:text-slate-200 shadow-sm' 
            : 'bg-gradient-to-tr from-brand-600 to-indigo-500 border-brand-400/30 text-white shadow-md shadow-brand-500/10'
        }`}>
          {isUser ? <UserIcon className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
        </div>

        {/* Bubble container */}
        <div className="flex flex-col">
          {/* Main bubble */}
          <div className={`p-4 rounded-2xl text-sm leading-relaxed border transition-all duration-200 ${
            isUser 
              ? 'bg-slate-200/80 dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-800/80 border-slate-300 dark:border-slate-700/50 text-slate-850 dark:text-slate-100 rounded-tr-none shadow-sm hover:border-slate-400 dark:hover:border-slate-600/50' 
              : 'bg-white dark:bg-slate-900/75 backdrop-blur-md border-slate-250 dark:border-slate-800/80 hover:border-brand-500/20 text-slate-850 dark:text-slate-200 rounded-tl-none shadow-md dark:shadow-indigo-950/10'
          } ${isStreaming && !message.content ? 'streaming-cursor' : ''}`}>
            
            {/* Message Text (Markdown parsed rendering) */}
            {message.content ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <p className="whitespace-pre-wrap font-sans font-medium text-slate-500 dark:text-slate-400">
                {isStreaming ? '' : '...'}
              </p>
            )}
            
            {/* Streaming Indicator */}
            {isStreaming && message.content && (
              <span className="streaming-cursor inline-block w-2"></span>
            )}
          </div>

          {/* Citations Footer */}
          {!isUser && message.citations && message.citations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-slate-450 dark:text-slate-550 uppercase tracking-widest font-extrabold flex items-center select-none mr-1">
                <CornerDownRight className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-600" /> Citations:
              </span>
              {message.citations.map((citation, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCitation(citation)}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-brand-500/5 dark:bg-brand-500/5 hover:bg-brand-500/10 dark:hover:bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/20 dark:border-brand-500/15 hover:border-brand-500/30 active:scale-95 transition-all duration-150 shadow-sm"
                  title="Click to view context source"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-brand-500 dark:text-brand-400" />
                  <span className="truncate max-w-[150px]">{citation.filename}</span>
                  {citation.page_number && (
                    <span className="font-mono ml-1.5 text-[9px] bg-brand-500/10 px-1 py-0.5 rounded text-brand-600 dark:text-brand-300">
                      p.{citation.page_number}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Citation Popover Modal with Premium Styling */}
      {selectedCitation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col scale-up-animation">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                  <FileText className="w-4.5 h-4.5 text-brand-550 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-sm">
                    {selectedCitation.filename}
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    {selectedCitation.page_number && (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        Page {selectedCitation.page_number}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500 font-medium flex items-center">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 mr-0.5" /> Isolated Context
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors duration-150 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[380px] bg-slate-50/50 dark:bg-slate-950/20">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 block select-none">
                Source Document Segment
              </span>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans p-4 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/60">
                {selectedCitation.snippet}
              </p>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10 text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Verified secure tenant partition ground truth
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
