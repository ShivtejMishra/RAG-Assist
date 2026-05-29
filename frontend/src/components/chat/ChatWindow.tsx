import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Conversation, Message, Citation } from '../../types';
import { MessageBubble } from './MessageBubble';
import { 
  Send, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Plus, 
  Compass, 
  HelpCircle,
  Cpu,
  X
} from 'lucide-react';

export const ChatWindow: React.FC = () => {
  const { getHeaders, logout } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [streamingCitations, setStreamingCitations] = useState<Citation[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [showConvoPanel, setShowConvoPanel] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversation history
  const fetchConversations = async (selectFirst: boolean = false) => {
    try {
      const response = await fetch('/api/v1/chats', {
        headers: getHeaders(),
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (selectFirst && data.length > 0) {
          selectConversation(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  };

  useEffect(() => {
    fetchConversations(true);
  }, []);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isStreaming]);

  // Load a single conversation
  const selectConversation = async (id: string) => {
    setLoading(true);
    setCurrentConvoId(id);
    setStreamingContent('');
    setStreamingCitations([]);
    setIsStreaming(false);
    try {
      const response = await fetch(`/api/v1/chats/${id}`, {
        headers: getHeaders(),
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to load message log", err);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/v1/chats', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title: 'New Conversation' }),
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        const newConvo = await response.json();
        setConversations((prev) => [newConvo, ...prev]);
        setCurrentConvoId(newConvo.id);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to create chat thread", err);
    }
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat session?")) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/chats/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (currentConvoId === id) {
          setCurrentConvoId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    let targetConvoId = currentConvoId;
    
    // 1. Create a session if none exists
    if (!targetConvoId) {
      try {
        const response = await fetch('/api/v1/chats', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ title: input.substring(0, 30) + '...' }),
        });
        if (response.status === 401) {
          logout();
          return;
        }
        if (response.ok) {
          const newConvo = await response.json();
          targetConvoId = newConvo.id;
          setCurrentConvoId(targetConvoId);
          setConversations((prev) => [newConvo, ...prev]);
        } else {
          return;
        }
      } catch (err) {
        console.error("Failed to initialize session auto-bind", err);
        return;
      }
    }

    const userText = input;
    setInput('');
    
    // Append the user message optimistically
    const userMsg: Message = {
      message_id: 'user-temp',
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingCitations([]);

    try {
      const authHeaders = getHeaders();
      const response = await fetch(`/api/v1/chats/${targetConvoId}/messages?stream=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeaders.Authorization || ''
        },
        body: JSON.stringify({ content: userText }),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to post message.');
      }

      if (!response.body) {
        throw new Error('Streaming response body not supported.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last item in buffer if it is incomplete
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim();
            if (rawData === '[DONE]') {
              setIsStreaming(false);
              break;
            }

            try {
              const payload = JSON.parse(rawData);
              if (payload.type === 'content') {
                setStreamingContent((prev) => prev + payload.delta);
              } else if (payload.type === 'citations') {
                setStreamingCitations(payload.citations);
              } else if (payload.type === 'error') {
                setStreamingContent((prev) => prev + `\n[Error: ${payload.message}]`);
                setIsStreaming(false);
              }
            } catch (err) {
              // Ignore line parse errors (e.g. keep parsing buffer)
            }
          }
        }
      }

      // Re-fetch conversation logs to synchronize fully with DB
      fetchConversations(false);
      selectConversation(targetConvoId as string);
    } catch (err) {
      console.error(err);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-all duration-200 relative">
      
      {/* Mobile overlay backdrop for convo panel */}
      {showConvoPanel && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowConvoPanel(false)}
        />
      )}

      {/* Sessions Navigation List */}
      <div className={`
        w-72 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 flex flex-col h-full transition-all duration-300
        md:relative md:translate-x-0 md:flex
        fixed top-0 left-0 z-40 h-full
        ${showConvoPanel ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-550 dark:text-slate-400">Conversations</h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={createNewChat}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-brand-500 text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-all duration-205 flex items-center justify-center active:scale-95 shadow-sm dark:shadow-none"
              title="Create New Conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
            {/* Close button visible on mobile */}
            <button
              onClick={() => setShowConvoPanel(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 dark:text-slate-650 text-xs">
              No sessions. Click '+' to start a new chat.
            </div>
          ) : (
            conversations.map((convo) => (
              <div
                key={convo.id}
                onClick={() => { selectConversation(convo.id); setShowConvoPanel(false); }}
                className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between border ${
                  currentConvoId === convo.id
                    ? 'bg-slate-100 dark:bg-gradient-to-r dark:from-slate-900 dark:to-indigo-950/20 border-brand-500/20 dark:border-brand-500/30 text-brand-600 dark:text-white font-semibold shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/40 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <Cpu className={`w-4 h-4 flex-shrink-0 ${currentConvoId === convo.id ? 'text-brand-500' : 'text-slate-400 dark:text-slate-650'}`} />
                  <span className="text-xs truncate leading-none">{convo.title}</span>
                </div>
                <button
                  onClick={(e) => deleteChat(convo.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 text-slate-400 dark:text-slate-500"
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Primary Chat Display Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/30 transition-all duration-200 min-w-0">
        
        {/* Chat Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/10 flex items-center justify-between backdrop-blur-sm transition-all duration-200">
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Mobile: toggle conversations panel button */}
            <button
              onClick={() => setShowConvoPanel(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mr-1"
              aria-label="Show conversations"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Sparkles className="w-5 h-5 text-brand-550 dark:text-brand-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide truncate max-w-[150px] sm:max-w-xs">
              {currentConvoId 
                ? conversations.find(c => c.id === currentConvoId)?.title || "Knowledge Chat"
                : "Interactive Agent"
              }
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-slate-650 dark:text-slate-400 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 px-2 sm:px-3 py-1 rounded-full shadow-sm flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-mono hidden sm:inline">Gemini 2.5 Flash</span>
            <span className="font-mono sm:hidden">Gemini</span>
          </div>
        </div>

        {/* Message Log Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-950/10 transition-all duration-200">
          {loading ? (
            <div className="h-full flex items-center justify-center flex-col text-slate-400 dark:text-slate-550">
              <RefreshCw className="w-8 h-8 animate-spin mb-3.5 text-brand-500" />
              <p className="text-xs font-bold tracking-wide">Loading dialog history...</p>
            </div>
          ) : messages.length === 0 && !isStreaming ? (
            /* Welcome / Guide Panel */
            <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mb-6 shadow-xl shadow-brand-500/10 border border-brand-400/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 dark:from-white via-slate-700 dark:via-slate-100 to-slate-500 dark:to-slate-400 mb-2.5">
                Welcome to RAGAssist
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-md font-medium">
                Interact dynamically with your company documentation. Ask questions and get answers grounded entirely in your secure knowledge base.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
                <div className="glass-panel bg-white dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-brand-500/30 hover:shadow-lg dark:hover:shadow-brand-500/5 transition-all duration-300">
                  <Compass className="w-5 h-5 text-brand-500 dark:text-brand-400 mb-2.5" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-1.5 uppercase tracking-wide">Source Citations</h4>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
                    Answers link directly to source snippets, identifying filenames and page numbers.
                  </p>
                </div>
                <div className="glass-panel bg-white dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-brand-500/30 hover:shadow-lg dark:hover:shadow-brand-500/5 transition-all duration-300">
                  <HelpCircle className="w-5 h-5 text-brand-500 dark:text-brand-400 mb-2.5" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-1.5 uppercase tracking-wide">Strict Isolation</h4>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
                    Queries are filtered under tenant ID boundaries ensuring organization data isolation.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <MessageBubble key={msg.message_id || index} message={msg} />
              ))}
              
              {/* Active Stream Bubble */}
              {isStreaming && (
                <MessageBubble 
                  message={{
                    message_id: 'streaming-temp',
                    role: 'assistant',
                    content: streamingContent,
                    citations: streamingCitations,
                    timestamp: new Date().toISOString()
                  }}
                  isStreaming={true}
                />
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 transition-all duration-200">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center space-x-2 sm:space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="flex-1 bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all duration-200 focus:shadow-[0_0_20px_-3px_rgba(120,94,247,0.15)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-655 hover:from-brand-500 hover:to-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-900 border border-brand-500/20 text-white font-semibold flex items-center justify-center transition-all duration-200 shadow-md shadow-brand-500/10 hover:shadow-brand-500/25 active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
