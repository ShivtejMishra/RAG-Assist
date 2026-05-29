import React from 'react';
import {
  Database, MessageSquare, FileText, Shield, Zap, Lock,
  Globe, Cpu, HardDrive, Search, Layers,
  CheckCircle, Sun, Moon, ArrowRight,
  LayoutDashboard, LogOut, User as UserIcon
} from 'lucide-react';

interface LandingProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const benefits = [
  {
    icon: Shield,
    title: 'Multi-Tenant Isolation',
    desc: 'Every organization gets a completely isolated namespace in both MongoDB and Qdrant. Your data never mixes.',
    color: 'text-brand-500',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
  },
  {
    icon: Zap,
    title: 'Real-Time Streaming',
    desc: 'Answers stream token-by-token via SSE, so users see results instantly instead of waiting for the full response.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Search,
    title: 'Semantic Vector Search',
    desc: 'Powered by Google text-embedding-004 and Qdrant — find the most semantically relevant chunks across thousands of docs.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: FileText,
    title: 'Multi-Format Ingestion',
    desc: 'Drag and drop PDFs, DOCX, TXT, CSV, Markdown. Automatic chunking, vectorization, and metadata extraction.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Grounded Responses',
    desc: 'Every answer is anchored to source documents with exact citations — filename, page, and snippet — no hallucinations.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    desc: 'JWT auth, role-based access control (admin/editor/viewer), HTTPS everywhere, and environment-scoped API keys.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
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

/* ── Full Dashboard Preview — pixel-accurate replica ── */
const DashboardPreview: React.FC = () => (
  <div className="w-full rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-2xl shadow-black/25 dark:shadow-black/60 select-none pointer-events-none bg-slate-50 dark:bg-slate-950" style={{ fontSize: '0' }}>

    {/* ── Window chrome bar ── */}
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" style={{ fontSize: '12px' }}>
      <span className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0" />
      <span className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
      <span className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0" />
      <div className="flex-1 mx-3 bg-slate-100 dark:bg-slate-800 rounded-md px-3 py-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono text-center truncate">
        ragassist.vercel.app — Analytics Dashboard
      </div>
    </div>

    {/* ── App shell ── */}
    <div className="flex" style={{ fontSize: '12px', height: '520px' }}>

      {/* ── Sidebar ── */}
      <div className="w-48 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 h-full">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow shadow-brand-500/30">
            <Database className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-slate-900 dark:text-white leading-none">RAGAssist</div>
            <div className="text-[8px] text-brand-500 font-bold uppercase tracking-widest mt-0.5">Enterprise</div>
          </div>
        </div>

        {/* Org badge */}
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
          <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Organization</div>
          <div className="text-[9px] font-semibold text-slate-800 dark:text-slate-200 truncate">Acme Corporation</div>
          <div className="text-[8px] text-brand-600 dark:text-brand-400 font-mono truncate">acme.com</div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {[
            { Icon: LayoutDashboard, label: 'Analytics Dashboard', active: true },
            { Icon: MessageSquare, label: 'Knowledge Chat', active: false },
            { Icon: FileText, label: 'Document Manager', active: false },
            { Icon: UserIcon, label: 'My Profile', active: false },
          ].map(({ Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-semibold ${
                active
                  ? 'bg-brand-600 text-white shadow shadow-brand-600/20'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-600 to-indigo-500 flex items-center justify-center text-white text-[8px] font-extrabold flex-shrink-0">AC</div>
            <div>
              <div className="text-[8px] font-semibold text-slate-800 dark:text-slate-200 truncate">Alice Chen</div>
              <div className="text-[7px] text-brand-500 font-bold uppercase">admin</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[8px] text-amber-500 font-semibold">
            <Sun className="w-2.5 h-2.5" />
            <span>Light Theme</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[8px] text-red-400 font-semibold">
            <LogOut className="w-2.5 h-2.5" />
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 min-w-0">

        {/* Page header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 flex-shrink-0">
          <div>
            <div className="text-[13px] font-bold text-slate-900 dark:text-white">System Performance &amp; Insights</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time metrics for: <span className="text-brand-600 dark:text-brand-400 font-bold">Acme Corporation</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
            Refresh Data
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-hidden p-5 space-y-4">

          {/* ── 4 Stat Cards ── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Documents', val: '24', sub: 'Stored in S3', icon: FileText, iconBg: 'bg-brand-500/10 border-brand-500/20', iconColor: 'text-brand-500', subColor: 'text-emerald-500' },
              { label: 'Vector Blocks', val: '1,248', sub: 'Indexed in Qdrant', icon: Database, iconBg: 'bg-indigo-500/10 border-indigo-500/20', iconColor: 'text-indigo-500', subColor: 'text-indigo-500' },
              { label: 'Active Chats', val: '18', sub: 'Saved in MongoDB', icon: MessageSquare, iconBg: 'bg-purple-500/10 border-purple-500/20', iconColor: 'text-purple-500', subColor: 'text-purple-500' },
              { label: 'Ingested Size', val: '48.2 MB', sub: 'Metadata tracks', icon: HardDrive, iconBg: 'bg-cyan-500/10 border-cyan-500/20', iconColor: 'text-cyan-500', subColor: 'text-cyan-500' },
            ].map(({ label, val, sub, icon: Icon, iconBg, iconColor, subColor }) => (
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

          {/* ── Bottom panels ── */}
          <div className="grid grid-cols-3 gap-3">

            {/* Activity Log — col-span-2 */}
            <div className="col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Database className="w-3 h-3 text-brand-500" /> Workspace Activity Log
                </div>
                <span className="text-[7px] bg-brand-500/10 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Live Feed</span>
              </div>
              <div className="space-y-2">
                {[
                  { type: 'document', event: 'Vectorization Complete', detail: 'File: Q4-Report.pdf (2.3 MB)', status: 'success' },
                  { type: 'document', event: 'Document Processing', detail: 'File: HR-Policy-2025.docx (0.8 MB)', status: 'processing' },
                  { type: 'chat', event: 'Knowledge Chat Activity', detail: 'Session: Q4 Financial Analysis', status: 'success' },
                  { type: 'system', event: 'Gemini Gateway Online', detail: 'text-embedding-004 & Gemini 2.5 Flash', status: 'success' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                        log.type === 'document' ? 'bg-brand-500/10 text-brand-500'
                        : log.type === 'chat' ? 'bg-indigo-500/10 text-indigo-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {log.type === 'document' && <FileText className="w-2.5 h-2.5" />}
                        {log.type === 'chat' && <MessageSquare className="w-2.5 h-2.5" />}
                        {log.type === 'system' && <Cpu className="w-2.5 h-2.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-bold text-slate-800 dark:text-slate-200 truncate">{log.event}</span>
                          <span className={`text-[6px] font-extrabold uppercase px-1 py-0.5 rounded ${
                            log.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>{log.status}</span>
                        </div>
                        <div className="text-[7px] text-slate-400 dark:text-slate-500 truncate">{log.detail}</div>
                      </div>
                    </div>
                    <span className="text-[7px] text-slate-400 whitespace-nowrap ml-2">Recently</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Status */}
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

export const Landing: React.FC<LandingProps> = ({ onSignIn, onGetStarted, theme, toggleTheme }) => {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">RAGAssist</span>
            <span className="hidden sm:inline text-xs text-brand-500 font-bold uppercase tracking-widest ml-1 glow-text-indigo">Enterprise</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
            <button
              onClick={onSignIn}
              className="px-3 sm:px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-3 sm:px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all shadow-md shadow-brand-500/20 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-28 px-4 sm:px-6">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
            Powered by Gemini 2.5 Flash + Qdrant
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="text-slate-900 dark:text-white">Your Documents,</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500">
              Grounded Intelligence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
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

      {/* ── Stats Bar ── */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 border-y border-slate-200 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              Everything in one place
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              A unified analytics dashboard gives you real-time visibility across documents, vectors, chats, and system health.
            </p>
          </div>

          {/* Glowing wrapper */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-brand-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
            <div className="relative">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits Grid ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-100/50 dark:bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
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
                className={`bg-white dark:bg-slate-900/60 border ${b.border} dark:border-opacity-50 p-6 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 glass-panel-hover`}
              >
                <div className={`w-11 h-11 rounded-xl ${b.bg} ${b.border} border flex items-center justify-center mb-4`}>
                  <b.icon className={`w-5 h-5 ${b.color}`} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{b.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack Strip ── */}
      <section className="py-14 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">
            Powered by world-class infrastructure
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {techStack.map((t) => (
              <div key={t.name} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 hover:border-brand-400/40 dark:hover:border-brand-500/30 transition-all">
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

      {/* ── CTA Footer ── */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-brand-600 via-indigo-700 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zMHY2aC02di02aDZ6bS0zMCAzMHY2SDZ2LTZoNnptMC0zMHY2SDZ2LTZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mx-auto mb-6">
            <Database className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Ready to ground your AI?
          </h2>
          <p className="text-white/70 text-sm sm:text-base mb-10 max-w-lg mx-auto leading-relaxed">
            Set up your organization in under 2 minutes. Upload documents, ask questions, get cited answers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl text-sm shadow-xl hover:bg-white/90 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Create Free Account <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-8 py-4 border border-white/30 text-white font-bold rounded-2xl text-sm hover:bg-white/10 transition-all active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center">
              <Database className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">RAGAssist Enterprise</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>All systems operational</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} RAGAssist. Built with Gemini &amp; Qdrant.
          </p>
        </div>
      </footer>

    </div>
  );
};
