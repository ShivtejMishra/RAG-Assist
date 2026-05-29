import React, { useState, useEffect } from 'react';
import {
  Database, MessageSquare, FileText, Shield, Zap, Lock,
  Globe, Cpu, HardDrive, Search, Layers,
  CheckCircle, Sun, Moon, ArrowRight,
  LayoutDashboard, LogOut, User as UserIcon, Menu, X,
  TrendingUp, ChevronRight
} from 'lucide-react';

interface LandingProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

/* ─── Benefits data ─── */
const benefits = [
  { icon: Shield, title: 'Multi-Tenant Isolation', desc: 'Every organization gets a completely isolated namespace in both MongoDB and Qdrant. Your data never mixes.', color: 'text-brand-500', bg: 'bg-brand-500/10', border: 'border-brand-500/20', glow: 'hover:shadow-brand-500/10' },
  { icon: Zap, title: 'Real-Time Streaming', desc: 'Answers stream token-by-token via SSE, so users see results instantly instead of waiting for the full response.', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'hover:shadow-amber-500/10' },
  { icon: Search, title: 'Semantic Vector Search', desc: 'Powered by Google text-embedding-004 and Qdrant — find the most semantically relevant chunks across thousands of docs.', color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'hover:shadow-indigo-500/10' },
  { icon: FileText, title: 'Multi-Format Ingestion', desc: 'Drag and drop PDFs, DOCX, TXT, CSV, Markdown. Automatic chunking, vectorization, and metadata extraction.', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'hover:shadow-emerald-500/10' },
  { icon: MessageSquare, title: 'Grounded Responses', desc: 'Every answer is anchored to source documents with exact citations — filename, page, and snippet — no hallucinations.', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', glow: 'hover:shadow-purple-500/10' },
  { icon: Lock, title: 'Enterprise Security', desc: 'JWT auth, role-based access control (admin/editor/viewer), HTTPS everywhere, and environment-scoped API keys.', color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: 'hover:shadow-cyan-500/10' },
];

const stats = [
  { value: '10M+', label: 'Vector Chunks Indexed' },
  { value: '<1s', label: 'Avg. Query Latency' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const techStack = [
  { name: 'Gemini 2.5 Flash', sub: 'LLM Gateway', icon: Cpu, color: 'text-brand-400' },
  { name: 'Qdrant', sub: 'Vector Database', icon: Database, color: 'text-indigo-400' },
  { name: 'MongoDB Atlas', sub: 'Document Store', icon: HardDrive, color: 'text-emerald-400' },
  { name: 'FastAPI', sub: 'Backend Engine', icon: Zap, color: 'text-amber-400' },
  { name: 'Multi-Tenant', sub: 'Org Isolation', icon: Layers, color: 'text-purple-400' },
  { name: 'Global Edge', sub: 'Railway + Vercel', icon: Globe, color: 'text-cyan-400' },
];

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Tech Stack', href: '#stack' },
];

/* ─────────────────────────────────────────────────────────────
   3D Floating Geometry — pure CSS transforms
───────────────────────────────────────────────────────────── */
const FloatingShape: React.FC<{
  size: number;
  color: string;
  top: string;
  left?: string;
  right?: string;
  delay?: number;
  shape?: 'cube' | 'sphere' | 'ring';
}> = ({ size, color, top, left, right, delay = 0, shape = 'sphere' }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    top,
    left,
    right,
    width: size,
    height: size,
    animationDelay: `${delay}s`,
    zIndex: 0,
  };

  if (shape === 'ring') {
    return (
      <div style={style} className="animate-spin-slow opacity-20 dark:opacity-15">
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: `${size / 10}px solid`,
            borderColor: color,
            transform: 'rotateX(70deg)',
            boxShadow: `0 0 ${size / 3}px ${color}40`,
          }}
        />
      </div>
    );
  }

  if (shape === 'cube') {
    const face = size / 2;
    return (
      <div style={{ ...style, perspective: size * 4 }} className="animate-float-slow opacity-30 dark:opacity-20">
        <div style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          transform: 'rotateX(35deg) rotateY(45deg)',
          animation: `spin3d 12s linear infinite`,
          animationDelay: `${delay}s`,
        }}>
          {['front','back','left','right','top','bottom'].map((face_name) => {
            const transforms: Record<string, string> = {
              front: `translateZ(${face}px)`,
              back: `rotateY(180deg) translateZ(${face}px)`,
              left: `rotateY(-90deg) translateZ(${face}px)`,
              right: `rotateY(90deg) translateZ(${face}px)`,
              top: `rotateX(90deg) translateZ(${face}px)`,
              bottom: `rotateX(-90deg) translateZ(${face}px)`,
            };
            return (
              <div key={face_name} style={{
                position: 'absolute',
                width: size,
                height: size,
                border: `1px solid ${color}60`,
                background: `${color}08`,
                transform: transforms[face_name],
                backfaceVisibility: 'hidden',
              }} />
            );
          })}
        </div>
      </div>
    );
  }

  // sphere (default)
  return (
    <div style={{
      ...style,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 35%, ${color}30, ${color}05)`,
      border: `1px solid ${color}20`,
      boxShadow: `0 0 ${size}px ${color}10, inset 0 0 ${size / 2}px ${color}05`,
    }} className="animate-float-slow opacity-60 dark:opacity-40" />
  );
};

/* ─────────────────────────────────────────────────────────────
   Dashboard Preview — responsive (desktop full / mobile cards)
───────────────────────────────────────────────────────────── */
const DashboardPreview: React.FC = () => {
  const statCards = [
    { label: 'Total Documents', val: '24', sub: 'Stored in S3', icon: FileText, iconBg: 'bg-brand-500/10 border-brand-500/20', iconColor: 'text-brand-500', subColor: 'text-emerald-500' },
    { label: 'Vector Blocks', val: '1,248', sub: 'Indexed in Qdrant', icon: Database, iconBg: 'bg-indigo-500/10 border-indigo-500/20', iconColor: 'text-indigo-500', subColor: 'text-indigo-500' },
    { label: 'Active Chats', val: '18', sub: 'Saved in MongoDB', icon: MessageSquare, iconBg: 'bg-purple-500/10 border-purple-500/20', iconColor: 'text-purple-500', subColor: 'text-purple-500' },
    { label: 'Ingested Size', val: '48.2 MB', sub: 'Metadata tracks', icon: HardDrive, iconBg: 'bg-cyan-500/10 border-cyan-500/20', iconColor: 'text-cyan-500', subColor: 'text-cyan-500' },
  ];

  const activityLog = [
    { type: 'document', event: 'Vectorization Complete', detail: 'Q4-Report.pdf (2.3 MB)', status: 'success' },
    { type: 'document', event: 'Document Processing', detail: 'HR-Policy-2025.docx (0.8 MB)', status: 'processing' },
    { type: 'chat', event: 'Knowledge Chat Activity', detail: 'Session: Q4 Financial Analysis', status: 'success' },
    { type: 'system', event: 'Gemini Gateway Online', detail: 'text-embedding-004 & Gemini 2.5 Flash', status: 'success' },
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-2xl shadow-black/25 dark:shadow-black/60 select-none pointer-events-none bg-slate-50 dark:bg-slate-950">

      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
        <div className="flex-1 mx-3 bg-slate-100 dark:bg-slate-800 rounded-md px-3 py-1 text-[9px] text-slate-400 dark:text-slate-500 font-mono text-center truncate">
          ragassist.vercel.app — Analytics Dashboard
        </div>
      </div>

      {/* ── MOBILE layout (< md) ── */}
      <div className="md:hidden bg-slate-50 dark:bg-slate-950 p-3 space-y-3">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-1 py-2">
          <div>
            <div className="text-[11px] font-bold text-slate-900 dark:text-white">Performance & Insights</div>
            <div className="text-[8px] text-brand-500 font-semibold">Acme Corporation</div>
          </div>
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Mobile 2x2 stat grid */}
        <div className="grid grid-cols-2 gap-2">
          {statCards.map(({ label, val, sub, icon: Icon, iconBg, iconColor, subColor }) => (
            <div key={label} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-[8px] uppercase font-bold text-slate-400">{label}</div>
                <div className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">{val}</div>
                <div className={`text-[7px] font-semibold ${subColor}`}>{sub}</div>
              </div>
              <div className={`w-7 h-7 rounded-lg ${iconBg} border flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile activity log */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[8px] font-bold uppercase text-slate-500 dark:text-slate-400">Activity Log</div>
            <span className="text-[6px] bg-brand-500/10 text-brand-500 px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
          </div>
          <div className="space-y-1.5">
            {activityLog.slice(0, 3).map((log, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-[8px] text-slate-700 dark:text-slate-300 font-semibold truncate">{log.event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile status row */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="text-[8px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">System Status</div>
          <div className="grid grid-cols-2 gap-1.5">
            {['Gemini LLM', 'Qdrant', 'MongoDB', 'Celery'].map((s, i) => (
              <div key={s} className="flex items-center justify-between">
                <span className="text-[8px] text-slate-500 dark:text-slate-400">{s}</span>
                <span className={`text-[7px] font-extrabold ${i < 3 ? 'text-emerald-500' : 'text-indigo-500'}`}>{i < 3 ? 'ON' : 'IDLE'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP layout (md+) ── */}
      <div className="hidden md:flex" style={{ fontSize: '12px', height: '520px' }}>

        {/* Sidebar */}
        <div className="w-44 lg:w-48 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 h-full">
          <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow shadow-brand-500/30">
              <Database className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-slate-900 dark:text-white leading-none">RAGAssist</div>
              <div className="text-[8px] text-brand-500 font-bold uppercase tracking-widest mt-0.5">Enterprise</div>
            </div>
          </div>

          <div className="mx-3 mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
            <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Organization</div>
            <div className="text-[9px] font-semibold text-slate-800 dark:text-slate-200 truncate">Acme Corporation</div>
            <div className="text-[8px] text-brand-600 dark:text-brand-400 font-mono truncate">acme.com</div>
          </div>

          <nav className="flex-1 px-3 py-3 space-y-1">
            {[
              { Icon: LayoutDashboard, label: 'Analytics Dashboard', active: true },
              { Icon: MessageSquare, label: 'Knowledge Chat', active: false },
              { Icon: FileText, label: 'Document Manager', active: false },
              { Icon: UserIcon, label: 'My Profile', active: false },
            ].map(({ Icon, label, active }) => (
              <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-semibold ${active ? 'bg-brand-600 text-white shadow shadow-brand-600/20' : 'text-slate-500 dark:text-slate-400'}`}>
                <Icon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </nav>

          <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-600 to-indigo-500 flex items-center justify-center text-white text-[8px] font-extrabold flex-shrink-0">AC</div>
              <div>
                <div className="text-[8px] font-semibold text-slate-800 dark:text-slate-200 truncate">Alice Chen</div>
                <div className="text-[7px] text-brand-500 font-bold uppercase">admin</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[8px] text-amber-500 font-semibold">
              <Sun className="w-2.5 h-2.5" /><span>Light Theme</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[8px] text-red-400 font-semibold">
              <LogOut className="w-2.5 h-2.5" /><span>Sign Out</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 min-w-0">
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 flex-shrink-0">
            <div>
              <div className="text-[13px] font-bold text-slate-900 dark:text-white">System Performance &amp; Insights</div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Real-time metrics for: <span className="text-brand-600 dark:text-brand-400 font-bold">Acme Corporation</span></div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-semibold text-slate-600 dark:text-slate-300 shadow-sm">Refresh Data</div>
          </div>

          <div className="flex-1 overflow-hidden p-4 lg:p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {statCards.map(({ label, val, sub, icon: Icon, iconBg, iconColor, subColor }) => (
                <div key={label} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex items-center justify-between shadow-sm dark:shadow-none">
                  <div>
                    <div className="text-[8px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
                    <div className="text-[15px] font-extrabold text-slate-900 dark:text-white mt-0.5 leading-none">{val}</div>
                    <div className={`text-[7px] font-semibold mt-1 ${subColor}`}>{sub}</div>
                  </div>
                  <div className={`w-8 h-8 rounded-lg ${iconBg} border flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    <Database className="w-3 h-3 text-brand-500" /> Workspace Activity Log
                  </div>
                  <span className="text-[7px] bg-brand-500/10 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full font-bold uppercase">Live Feed</span>
                </div>
                <div className="space-y-2">
                  {activityLog.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${log.type === 'document' ? 'bg-brand-500/10 text-brand-500' : log.type === 'chat' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {log.type === 'document' && <FileText className="w-2.5 h-2.5" />}
                          {log.type === 'chat' && <MessageSquare className="w-2.5 h-2.5" />}
                          {log.type === 'system' && <Cpu className="w-2.5 h-2.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-bold text-slate-800 dark:text-slate-200 truncate">{log.event}</span>
                            <span className={`text-[6px] font-extrabold uppercase px-1 py-0.5 rounded ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>{log.status}</span>
                          </div>
                          <div className="text-[7px] text-slate-400 dark:text-slate-500 truncate">{log.detail}</div>
                        </div>
                      </div>
                      <span className="text-[7px] text-slate-400 whitespace-nowrap ml-2">Recently</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-sm dark:shadow-none flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4">
                    <Cpu className="w-3 h-3 text-brand-500" /> Operational Status
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Gemini LLM Gateway', status: 'ONLINE', color: 'text-emerald-500' },
                      { name: 'Qdrant Vector Cluster', status: 'ONLINE', color: 'text-emerald-500' },
                      { name: 'MongoDB Atlas', status: 'ONLINE', color: 'text-emerald-500' },
                      { name: 'Celery Workers', status: 'IDLE', color: 'text-indigo-500' },
                    ].map(({ name, status, color }) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-[8px] text-slate-500 dark:text-slate-400 font-semibold truncate pr-2">{name}</span>
                        <span className={`text-[7px] ${color} font-extrabold flex-shrink-0`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                  <span className="text-[7px] text-slate-500 dark:text-slate-400 font-mono">All microservices operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main Landing Component
───────────────────────────────────────────────────────────── */
export const Landing: React.FC<LandingProps> = ({ onSignIn, onGetStarted, theme, toggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = ['home', 'features', 'dashboard', 'benefits', 'stack'];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* ── 3D CSS keyframes injected via style tag ── */}
      <style>{`
        @keyframes spin3d { from { transform: rotateX(35deg) rotateY(0deg); } to { transform: rotateX(35deg) rotateY(360deg); } }
        @keyframes float-slow { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-18px) rotate(3deg); } }
        @keyframes float-mid  { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-2deg); } }
        @keyframes spin-slow  { from { transform: rotateZ(0deg) rotateX(70deg); } to { transform: rotateZ(360deg) rotateX(70deg); } }
        @keyframes tilt3d     { 0%,100% { transform: perspective(600px) rotateX(0deg) rotateY(0deg); } 25% { transform: perspective(600px) rotateX(4deg) rotateY(-4deg); } 75% { transform: perspective(600px) rotateX(-4deg) rotateY(4deg); } }
        .animate-float-slow  { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-mid   { animation: float-mid  5s ease-in-out infinite; }
        .animate-spin-slow   { animation: spin-slow 20s linear infinite; }
        .animate-tilt3d      { animation: tilt3d 10s ease-in-out infinite; }
        .card-3d { transition: transform 0.3s ease, box-shadow 0.3s ease; transform-style: preserve-3d; }
        .card-3d:hover { transform: perspective(800px) rotateX(-4deg) rotateY(4deg) translateY(-6px); }
        .dashboard-3d { transition: transform 0.6s cubic-bezier(0.23,1,0.32,1); transform-style: preserve-3d; }
        .dashboard-3d:hover { transform: perspective(1200px) rotateX(3deg) rotateY(-3deg) scale(1.01); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm shadow-black/5 border-b border-slate-200/60 dark:border-slate-800/60' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => scrollTo('#home')} className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">RAGAssist</span>
            <span className="hidden sm:inline text-xs text-brand-500 font-bold uppercase tracking-widest glow-text-indigo">Enterprise</span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => scrollTo(href)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeSection === href.replace('#', '')
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
            <button onClick={onSignIn} className="hidden sm:block px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Sign In
            </button>
            <button onClick={onGetStarted} className="px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all shadow-md shadow-brand-500/20 active:scale-95">
              Get Started
            </button>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ml-1">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-64 border-b border-slate-200 dark:border-slate-800' : 'max-h-0'} bg-white dark:bg-slate-900`}>
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => scrollTo(href)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-brand-600 dark:hover:text-brand-400 transition-all text-left"
              >
                {label}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button onClick={onSignIn} className="flex-1 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-400 transition-all">Sign In</button>
              <button onClick={onGetStarted} className="flex-1 py-2.5 text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all">Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="relative overflow-hidden py-20 sm:py-28 md:py-36 px-4 sm:px-6">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none" />

        {/* 3D floating shapes */}
        <FloatingShape size={90}  color="#7c5bf6" top="12%"  left="4%"  delay={0}   shape="cube"   />
        <FloatingShape size={60}  color="#6366f1" top="70%"  left="2%"  delay={2}   shape="sphere" />
        <FloatingShape size={110} color="#818cf8" top="15%"  right="3%" delay={1}   shape="ring"   />
        <FloatingShape size={70}  color="#8b5cf6" top="65%"  right="5%" delay={3}   shape="sphere" />
        <FloatingShape size={50}  color="#a855f7" top="40%"  right="2%" delay={1.5} shape="cube"   />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
            Powered by Gemini 2.5 Flash + Qdrant
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            <span className="text-slate-900 dark:text-white">Your Documents,</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500">
              Grounded Intelligence.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            RAGAssist transforms your organization's documents into an intelligent knowledge base.
            Ask questions in natural language and get accurate, source-cited answers — with full enterprise isolation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm shadow-xl shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-8 py-4 border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm transition-all active:scale-95 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
            >
              Sign In to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section id="features" className="py-6 sm:py-8 px-4 sm:px-6 border-y border-slate-200 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section id="dashboard" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
              <LayoutDashboard className="w-3 h-3" /> Live Preview
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Everything in one place
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              A unified analytics dashboard gives you real-time visibility across documents, vectors, chats, and system health.
            </p>
          </div>

          {/* 3D perspective tilt wrapper */}
          <div className="relative dashboard-3d">
            {/* Glow behind */}
            <div className="absolute -inset-3 bg-gradient-to-r from-brand-500/20 via-indigo-500/15 to-purple-500/20 rounded-3xl blur-3xl pointer-events-none" />
            {/* Decorative dots grid */}
            <div className="absolute -top-4 -left-4 w-24 h-24 opacity-20 dark:opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #7c5bf6 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20 dark:opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
            <div className="relative">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="benefits" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-100/50 dark:bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <CheckCircle className="w-3 h-3" /> Core Benefits
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Built for the Enterprise
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Every feature is designed around security, scalability, and developer experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className={`card-3d bg-white dark:bg-slate-900/60 border ${b.border} p-6 rounded-2xl hover:shadow-xl ${b.glow} dark:shadow-none transition-all duration-300 cursor-default`}
              >
                <div className={`w-11 h-11 rounded-xl ${b.bg} border ${b.border} flex items-center justify-center mb-4`}>
                  <b.icon className={`w-5 h-5 ${b.color}`} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{b.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section id="stack" className="py-14 sm:py-20 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Powered by world-class infrastructure</p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-brand-500 to-indigo-500 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {techStack.map((t, i) => (
              <div
                key={t.name}
                className="card-3d flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 hover:border-brand-400/40 dark:hover:border-brand-500/30 hover:shadow-lg transition-all cursor-default"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <t.icon className={`w-6 h-6 ${t.color}`} />
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{t.name}</div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER SECTION ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-br from-brand-600 via-indigo-700 to-purple-700 relative overflow-hidden">
        {/* 3D floating shapes inside CTA */}
        <FloatingShape size={120} color="#ffffff" top="10%"  left="5%"   delay={0}   shape="ring"   />
        <FloatingShape size={80}  color="#ffffff" top="60%"  right="6%"  delay={2}   shape="cube"   />
        <FloatingShape size={50}  color="#ffffff" top="40%"  right="15%" delay={1}   shape="sphere" />

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zMHY2aC02di02aDZ6bS0zMCAzMHY2SDZ2LTZoNnptMC0zMHY2SDZ2LTZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mx-auto mb-6 animate-float-slow">
            <Database className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Ready to ground your AI?
          </h2>
          <p className="text-white/70 text-sm sm:text-base mb-10 max-w-lg mx-auto leading-relaxed">
            Set up your organization in under 2 minutes. Upload documents, ask questions, get cited answers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onGetStarted} className="w-full sm:w-auto px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl text-sm shadow-xl hover:bg-white/90 transition-all active:scale-95 flex items-center justify-center gap-2">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={onSignIn} className="w-full sm:w-auto px-8 py-4 border border-white/30 text-white font-bold rounded-2xl text-sm hover:bg-white/10 transition-all active:scale-95">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-6 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <button onClick={() => scrollTo('#home')} className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center group-hover:shadow-md group-hover:shadow-brand-500/30 transition-all">
              <Database className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">RAGAssist Enterprise</span>
          </button>
          {/* Footer nav links */}
          <div className="flex items-center gap-4">
            {navLinks.map(({ label, href }) => (
              <button key={href} onClick={() => scrollTo(href)} className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 font-semibold transition-colors">
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>All systems operational</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} RAGAssist</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
