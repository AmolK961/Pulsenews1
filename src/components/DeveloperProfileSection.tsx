import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Code2, 
  Terminal, 
  ExternalLink, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Layers, 
  Github, 
  Linkedin, 
  Copy, 
  Check, 
  Smartphone, 
  Cpu, 
  Globe, 
  Lightbulb, 
  TrendingUp, 
  ArrowRight,
  BookOpen,
  Send
} from 'lucide-react';

interface DeveloperProfileSectionProps {
  onOpenModal?: () => void;
  onOpenBulkEmail?: () => void;
  developerEmail?: string;
  developerName?: string;
}

export const DeveloperProfileSection: React.FC<DeveloperProfileSectionProps> = ({
  onOpenModal,
  onOpenBulkEmail,
  developerEmail = 'amolkharat817@gmail.com',
  developerName = 'Amol Kharat'
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedRoleFocus, setSelectedRoleFocus] = useState<'fullstack' | 'android' | 'ai'>('fullstack');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const ROLE_FOCUS_DATA = {
    fullstack: {
      title: 'Senior Full-Stack & Systems Engineer',
      tagline: 'End-to-End Enterprise Web & Cloud Architectures',
      skills: ['React 18', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'Vite', 'RESTful APIs', 'PostgreSQL', 'PWA Offline Sync'],
      highlights: [
        'Engineered PulseNews real-time global aggregator with sub-millisecond local caching',
        'Implemented responsive multi-viewport system supporting desktop web and Android simulators',
        'Designed high-throughput NewsAPI proxies with intelligent cache fallbacks'
      ]
    },
    android: {
      title: 'Mobile & Android Systems Architect',
      tagline: 'Native Android Kotlin, Jetpack Compose & PWA Apps',
      skills: ['Android Kotlin', 'Jetpack Compose', 'Coroutines & Flow', 'Retrofit & OkHttp', 'Room DB', 'Material 3 Design', 'React Native'],
      highlights: [
        'Built full standalone Android Kotlin mobile client with MVVM clean architecture',
        'Configured native APK & PWA offline manifest with seamless installability',
        'Created high-fidelity mobile device simulator with hardware gestures and settings'
      ]
    },
    ai: {
      title: 'Applied AI & Intelligent Data Engineer',
      tagline: 'LLM Orchestration, Prompt Engineering & NLP',
      skills: ['Google Gemini 3.8 Flash', 'Generative Language SDK', 'AI Takeaways & Summaries', 'Multi-Language Neural Translation', 'NLP Data Pipelines'],
      highlights: [
        'Integrated Gemini Flash for instant 3-point executive briefings and ELI5 summaries',
        'Developed multi-lingual translation pipeline with fallback rule engines',
        'Constructed categorical technical magazine synthesis algorithms for 30/60/200 stories'
      ]
    }
  };

  const activeFocus = ROLE_FOCUS_DATA[selectedRoleFocus];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 mt-12 mb-8">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar Badge */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-amber-500 p-0.5 shadow-xl shadow-rose-950/40">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white">
                  <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
                    {developerName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center" title="Available for Opportunities">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {developerName}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Lead Software Engineer
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Available for Hire
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {activeFocus.title} &bull; {activeFocus.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Remote / Global Relocation</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <a href={`mailto:${developerEmail}`} className="hover:text-amber-300 transition">
                    {developerEmail}
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyEmail}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              title="Copy Email Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Email Copied!' : 'Copy Email'}</span>
            </button>

            <a
              href={`mailto:${developerEmail}?subject=Inquiry%20regarding%20Software%20Engineering%20Opportunities`}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold transition shadow-md shadow-rose-950/50 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Developer</span>
            </a>

            {onOpenBulkEmail && (
              <button
                onClick={onOpenBulkEmail}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer"
                title="Send bulk newsletters & magazines via Gmail SMTP"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Bulk Email (SMTP)</span>
              </button>
            )}

            {onOpenModal && (
              <button
                onClick={onOpenModal}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Full Portfolio &amp; Suggestions</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Role Focus Switcher */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-rose-400" />
              <span>Engineering Specialization Focus</span>
            </span>
            <span className="text-[11px] text-slate-500">Click to switch stack view</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => setSelectedRoleFocus('fullstack')}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                selectedRoleFocus === 'fullstack'
                  ? 'bg-rose-600/15 border-rose-500 text-white shadow-md shadow-rose-950/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white">Full-Stack Web</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                React, Node.js, TypeScript, REST APIs, Microservices &amp; PWA
              </p>
            </button>

            <button
              onClick={() => setSelectedRoleFocus('android')}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                selectedRoleFocus === 'android'
                  ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-md shadow-emerald-950/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Android &amp; Mobile</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Native Kotlin, Jetpack Compose, Coroutines, MVVM &amp; React Native
              </p>
            </button>

            <button
              onClick={() => setSelectedRoleFocus('ai')}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                selectedRoleFocus === 'ai'
                  ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-950/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">AI &amp; Data Systems</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gemini 3.8 Flash, Prompt Engineering, Real-Time Translation &amp; Caching
              </p>
            </button>
          </div>
        </div>

        {/* Skills & Key Architectural Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tech Stack Tags */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Core Technologies &amp; Tooling</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {activeFocus.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Key Milestones in This Architecture */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Demonstrated Milestones &amp; Impact</span>
            </h3>
            <ul className="space-y-2">
              {activeFocus.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suggestion & Recommendation Callout for Developer Profile */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/30 via-slate-950 to-amber-950/20 border border-indigo-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Developer Profile Strategic Suggestions &amp; Enhancements
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              Profile Score: 95%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-300 block">1. GitHub Repository Showcase</span>
              <p className="text-[11px] text-slate-400">
                Pin 3 prominent open repositories with clear READMEs, architecture diagrams, and one-click demo links.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-sky-300 block">2. Architecture Case Studies</span>
              <p className="text-[11px] text-slate-400">
                Highlight trade-offs made: e.g. Why PWA + Express instead of purely client-side; offline caching strategy.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-rose-300 block">3. Content Ninja Partner</span>
              <p className="text-[11px] text-slate-400">
                Feature tech tutorials &amp; YouTube breakdowns to establish thought leadership and attract senior roles.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
