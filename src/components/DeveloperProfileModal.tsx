import React, { useState } from 'react';
import { 
  X, 
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
  Send,
  FileText,
  Star,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

interface DeveloperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBulkEmail?: () => void;
  developerEmail?: string;
  developerName?: string;
}

export const DeveloperProfileModal: React.FC<DeveloperProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenBulkEmail,
  developerEmail = 'amolkharat817@gmail.com',
  developerName = 'Amol Kharat'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'projects' | 'suggestions' | 'contact'>('overview');
  const [copied, setCopied] = useState(false);
  
  // Contact form state
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${developerEmail}?subject=${encodeURIComponent(contactSubject || 'Software Engineering Inquiry')}&body=${encodeURIComponent(contactMessage)}`;
    window.location.href = mailtoUrl;
    setContactSent(true);
    setTimeout(() => setContactSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-amber-500 p-0.5 shadow-md">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white font-bold text-sm">
                {developerName.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {developerName}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Lead Software Architect
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full-Stack React &bull; Native Android Kotlin &bull; Systems Architecture &bull; Applied AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBulkEmail && (
              <button
                onClick={onOpenBulkEmail}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold transition cursor-pointer border border-amber-500/40"
                title="Open Bulk Email Dispatcher"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Bulk Email</span>
              </button>
            )}

            <button
              onClick={handleCopyEmail}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Email'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Overview &amp; Bio
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'skills'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Tech Stack &amp; Skills
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'projects'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Architecture Portfolio
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'suggestions'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Profile Suggestions (Tips)</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'contact'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Contact
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40 space-y-6">

          {/* TAB 1: OVERVIEW & BIO */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Executive Summary Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {developerName}
                    </h3>
                    <p className="text-xs text-rose-400 font-semibold mt-0.5">
                      Full-Stack Web &bull; Mobile Systems &bull; Applied AI Lead
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${developerEmail}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs shadow-md transition"
                    >
                      Hire / Contact
                    </a>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Hi, I’m <strong>{developerName}</strong>. I architect and engineer modern, production-grade web and mobile applications with high reliability, performance, and aesthetic precision. From designing reactive React/TypeScript client frontends to building native Kotlin Android applications and low-latency Express/Node.js API layers, I focus on clean code, type safety, and seamless end-user experiences.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Specialization</span>
                    <span className="text-xs sm:text-sm font-bold text-white block mt-1">Full-Stack &amp; Mobile</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Native Mobile</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 block mt-1">Android Kotlin &amp; PWA</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">AI Integration</span>
                    <span className="text-xs sm:text-sm font-bold text-indigo-400 block mt-1">Gemini 3.8 Flash</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Status</span>
                    <span className="text-xs sm:text-sm font-bold text-amber-400 block mt-1">Open to Roles</span>
                  </div>
                </div>
              </div>

              {/* Core Philosophy & Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Engineering Philosophy</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Prioritizing real architecture over surface-level mocks. Emphasizing sub-second latency, deterministic state management, offline-first capabilities, and zero runtime crashes through strict TypeScript typing and defensive design.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cross-Platform Versatility</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Fluently delivering native Kotlin Android architectures, web PWAs with background service workers, and full-stack Node.js microservices with Python integration and automated ZIP packaging.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TECH STACK & SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frontend */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    <span>Frontend Engineering</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'HTML5 / Semantic Web', 'PWA & Service Workers', 'State Machines & Custom Hooks', 'Accessibility (a11y)'].map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mobile / Android */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile &amp; Android Development</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Kotlin', 'Jetpack Compose', 'MVVM Architecture', 'Coroutines & Flow', 'Retrofit & Moshi', 'Room Database', 'React Native / Expo', 'Android Studio & Gradle'].map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Backend & Systems */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span>Backend &amp; API Architecture</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Node.js', 'Express', 'TypeScript Server', 'RESTful APIs', 'Python Scripts', 'In-Memory Cache & TTL', 'Local JSON Datastores', 'Proxy & CORS Middleware'].map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI, DevOps & Cloud */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    <span>AI, Cloud &amp; OS Tooling</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Google GenAI SDK (Gemini)', 'Prompt Engineering', 'Structured JSON Output', 'Linux / Fedora / Bash', 'Git & GitHub', 'Docker', 'Google Cloud Run'].map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE PORTFOLIO */}
          {activeTab === 'projects' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                      <Globe className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">PulseNews Real-Time Multi-Platform Hub</h4>
                      <p className="text-[11px] text-slate-400">Full-Stack Global Aggregator &bull; React, TypeScript, Express, NewsAPI</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30">
                    Live Production
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Engineered high-frequency global news monitoring system serving Top 10 pagination across 7 categories, financial index tickers, localized weather forecasting, and Gemini Flash 3.8 AI takeaways with in-app audio briefings.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Native Android (Kotlin) &amp; React Native Mobile Clients</h4>
                      <p className="text-[11px] text-slate-400">Modern Android Jetpack Compose, MVVM Architecture &amp; Standalone APK</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                    Mobile Native
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Developed standalone Android application with Retrofit networking, Room database caching, bottom navigation, and Material 3 design system, accompanied by cross-platform React Native export modules.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Categorical Technical Magazines Publishing Engine</h4>
                      <p className="text-[11px] text-slate-400">Cover Pages, Table of Contents, Page-by-Page Reader (Daily 30, Weekly 60, Monthly 200)</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30">
                    Publishing Suite
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Created comprehensive digital journal reader with cover pages, interactive table of contents indexed by page number, and sequential reading flow. Includes partner integration with Content Ninja YouTube channel.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: DEVELOPER PROFILE SUGGESTIONS & TIPS */}
          {activeTab === 'suggestions' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/30 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">
                    Actionable Recommendations to Elevate Your Developer Profile
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Here are concrete, industry-proven suggestions for <strong>{developerName}</strong> to optimize your online presence, attract high-paying client contracts, and secure lead software engineering positions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Suggestion 1 */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">1</span>
                    <h5 className="text-xs font-bold text-white">Create a Custom GitHub Readme &amp; Pinned Repos</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Set up a `username/username` repository with dynamic GitHub stats, live deployed links, tech stack badges, and pin PulseNews as your flagship full-stack system.
                  </p>
                </div>

                {/* Suggestion 2 */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">2</span>
                    <h5 className="text-xs font-bold text-white">Add Architecture Trade-Off Writeups</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Senior hiring managers love engineering case studies: document why you chose Express proxy over pure client fetch, how you prevented NewsAPI rate limits, and your offline caching strategy.
                  </p>
                </div>

                {/* Suggestion 3 */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                    <h5 className="text-xs font-bold text-white">Leverage "Content Ninja" Video Breakdowns</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Embed short 3-5 minute YouTube walkthroughs or technical diagrams explaining system architecture. Developers with demonstrated public communication command higher compensation.
                  </p>
                </div>

                {/* Suggestion 4 */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">4</span>
                    <h5 className="text-xs font-bold text-white">Highlight Quantified Performance Metrics</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Use concrete numbers in your resume and profile: "Cut API overhead by 80% via TTL memory caching", "Engineered 30/60/200 story generation pipeline in &lt;15ms", "100% TypeScript type safety".
                  </p>
                </div>
              </div>

              {/* Suggested LinkedIn Headline & Bio Template */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Recommended LinkedIn Headline &amp; Tagline
                </h5>
                <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 select-all">
                  Lead Software Architect | Full-Stack React &bull; TypeScript &bull; Native Android Kotlin &bull; Applied AI (Gemini) | Open to Senior &amp; Principal Opportunities
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Get in Touch with {developerName}</h4>
                    <p className="text-xs text-slate-400">Available for full-time roles, contracts, and technical consulting.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs text-slate-200">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span className="font-mono">{developerEmail}</span>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Email Address'}</span>
                  </button>
                </div>

                {/* Direct Message Form */}
                <form onSubmit={handleSendMessage} className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Subject</label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="e.g. Senior Software Engineer Role at TechCorp"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Message / Opportunity Details</label>
                    <textarea
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Briefly describe your project, timeline, or position..."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Email Client &amp; Send Message</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
