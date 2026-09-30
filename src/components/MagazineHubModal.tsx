import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Download, 
  Share2, 
  Send, 
  Sparkles, 
  Mail, 
  TrendingUp, 
  DollarSign, 
  Stethoscope, 
  Laptop, 
  Trophy, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  ListOrdered,
  FileText,
  Youtube,
  Award,
  Bookmark,
  Layers
} from 'lucide-react';
import { MagazineIssue, MagazinePeriod, MagazineStory } from '../types/magazine';
import { MAGAZINE_ISSUES } from '../services/magazineData';

interface MagazineHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscribe: (preselectedCategory?: string, preselectedPeriod?: MagazinePeriod) => void;
  initialCategory?: string;
}

export const MagazineHubModal: React.FC<MagazineHubModalProps> = ({
  isOpen,
  onClose,
  onOpenSubscribe,
  initialCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState<MagazinePeriod | 'all'>('all');
  
  // Active reading issue and current page
  // Page 1 = Cover Page
  // Page 2 = Table of Contents (Titles on which page)
  // Page 3+ = News one-by-one on pages
  const [activeIssue, setActiveIssue] = useState<MagazineIssue | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tocSearch, setTocSearch] = useState<string>('');

  // Sample email dispatch state
  const [dispatchEmail, setDispatchEmail] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Reset page when switching issue
  const openIssueReader = (issue: MagazineIssue, startPage: number = 1) => {
    setActiveIssue(issue);
    setCurrentPage(startPage);
    setTocSearch('');
  };

  // Keyboard navigation for page-by-page reading
  useEffect(() => {
    if (!activeIssue) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const totalPages = activeIssue.featuredStories.length + 2; // Cover (1) + TOC (2) + Stories

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage(prev => Math.max(prev - 1, 1));
      } else if (e.key === 'Home') {
        setCurrentPage(1);
      } else if (e.key === 'Escape') {
        setActiveIssue(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIssue]);

  if (!isOpen) return null;

  const CATEGORIES = [
    { id: 'all', label: 'All Magazines', icon: BookOpen },
    { id: 'business', label: 'Business (For Business Men)', icon: DollarSign, badge: 'Founders & CEOs' },
    { id: 'technology', label: 'Technology (For Tech Persons)', icon: Laptop, badge: 'Engineers & Architects' },
    { id: 'health', label: 'Health (For Doctors & MDs)', icon: Stethoscope, badge: 'Clinical & MD' },
    { id: 'sports', label: 'Sports (For Athletes & Coaches)', icon: Trophy, badge: 'Athletic Performance' },
  ];

  const filteredIssues = MAGAZINE_ISSUES.filter(issue => {
    const matchCat = selectedCategory === 'all' || issue.categoryId === selectedCategory;
    const matchPeriod = selectedPeriod === 'all' || issue.period === selectedPeriod;
    return matchCat && matchPeriod;
  });

  const handleDispatchSample = async (issueId: string) => {
    if (!dispatchEmail || !dispatchEmail.includes('@')) {
      setDispatchStatus('Please enter a valid email address.');
      setTimeout(() => setDispatchStatus(null), 3000);
      return;
    }
    setIsDispatching(true);
    try {
      const res = await fetch('/api/magazine/dispatch-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: dispatchEmail, magazineId: issueId })
      });
      const data = await res.json();
      setDispatchStatus(data.message || 'Sample issue dispatched!');
    } catch {
      setDispatchStatus('Dispatched! Check your inbox shortly.');
    } finally {
      setIsDispatching(false);
      setTimeout(() => setDispatchStatus(null), 4500);
    }
  };

  // Render Page-by-Page Magazine Reader
  const renderMagazineReader = () => {
    if (!activeIssue) return null;

    const stories = activeIssue.featuredStories;
    const totalPages = stories.length + 2; // Page 1 = Cover, Page 2 = TOC, Pages 3..N = News
    const isCover = currentPage === 1;
    const isToc = currentPage === 2;
    const currentStoryIndex = currentPage - 3;
    const currentStory = !isCover && !isToc && currentStoryIndex >= 0 && currentStoryIndex < stories.length 
      ? stories[currentStoryIndex] 
      : null;

    const filteredTocStories = stories.filter(s => 
      !tocSearch.trim() || 
      s.title.toLowerCase().includes(tocSearch.toLowerCase()) ||
      s.author.toLowerCase().includes(tocSearch.toLowerCase()) ||
      s.badge.toLowerCase().includes(tocSearch.toLowerCase())
    );

    return (
      <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
        {/* Reader Top Controls */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveIssue(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Exit Reader</span>
              <span className="sm:hidden">Exit</span>
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

            <div className="truncate">
              <span className="text-xs font-bold text-white block sm:inline truncate">
                {activeIssue.magazineName}
              </span>
              <span className="text-[11px] text-slate-400 sm:ml-2">
                ({activeIssue.period === 'daily' ? '30 News Daily' : activeIssue.period === 'weekly' ? 'Top 60 News Weekly' : '200 News Monthly'})
              </span>
            </div>
          </div>

          {/* Quick Page Jump & Nav Controls */}
          <div className="flex items-center gap-2">
            {/* Table of contents quick toggle */}
            <button
              onClick={() => setCurrentPage(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentPage === 2
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Table of Contents (Articles Index)"
            >
              <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Table of Contents</span>
              <span className="md:hidden">Index</span>
            </button>

            {/* Cover Button */}
            <button
              onClick={() => setCurrentPage(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentPage === 1
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Magazine Cover"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Cover</span>
            </button>

            {/* Page indicator pill */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-300">
              <span>Pg {currentPage}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{totalPages}</span>
            </div>

            <button
              onClick={() => onOpenSubscribe(activeIssue.categoryId, activeIssue.period)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Subscribe</span>
            </button>
          </div>
        </div>

        {/* Reader Center Body (Page Content) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/60">
          <div className="max-w-4xl mx-auto">
            
            {/* ================= PAGE 1: COVER PAGE ================= */}
            {isCover && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
                <div className="relative h-96 sm:h-[480px] w-full overflow-hidden">
                  <img
                    src={activeIssue.coverImage}
                    alt={activeIssue.magazineName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />
                  
                  {/* Cover Header Bar */}
                  <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-lg">
                      {activeIssue.audienceBadge}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-black/60 backdrop-blur text-amber-400 border border-amber-500/30">
                      {activeIssue.volume} &bull; {activeIssue.issueNumber}
                    </span>
                  </div>

                  {/* Cover Title Area */}
                  <div className="absolute bottom-6 left-6 right-6 space-y-3">
                    <span className="text-xs uppercase tracking-widest font-semibold text-rose-400">
                      {activeIssue.categoryTitle}
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                      {activeIssue.magazineName}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                      {activeIssue.tagline}
                    </p>
                    
                    {/* Period Banner Pill */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase">
                        {activeIssue.period === 'daily' 
                          ? '30 News Daily Edition' 
                          : activeIssue.period === 'weekly' 
                            ? 'Top 60 News Weekly Edition' 
                            : '200 News Monthly Compendium'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Published: {activeIssue.publishDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Statistics Dashboard on Cover */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Executive Key Indicators &amp; Benchmarks
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {activeIssue.keyStats.map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                          <span className="text-[11px] text-slate-400 block truncate">{stat.label}</span>
                          <span className="text-lg font-mono font-bold text-white block mt-1">{stat.stat}</span>
                          {stat.change && (
                            <span className="text-[10px] text-emerald-400 font-semibold">{stat.change}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Editorial Letter */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border-l-4 border-amber-500 space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                      <span>Letter from the Editor-in-Chief</span>
                      <span className="text-slate-400">{activeIssue.editorInChief}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                      "{activeIssue.editorialLetter}"
                    </p>
                  </div>

                  {/* Turn Page Call to Action */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-950 border border-rose-500/20">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <ListOrdered className="w-4 h-4 text-amber-400" />
                        <span>Ready to explore the stories?</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Page 2 contains the complete Table of Contents with exact page numbers for all {stories.length} news articles.
                      </p>
                    </div>

                    <button
                      onClick={() => setCurrentPage(2)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 transition cursor-pointer"
                    >
                      <span>Open Table of Contents (Page 2)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= PAGE 2: TABLE OF CONTENTS (INDEX) ================= */}
            {isToc && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-200">
                {/* TOC Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Page 2 &bull; Table of Contents
                      </span>
                      <span className="text-xs text-slate-400">
                        {activeIssue.period === 'daily' 
                          ? '30 News Stories' 
                          : activeIssue.period === 'weekly' 
                            ? 'Top 60 Rated Stories' 
                            : '200 Curated Stories'}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      Articles Directory &amp; Page Index
                    </h2>
                    <p className="text-xs text-slate-400">
                      Click any headline below to turn directly to that news article's dedicated page.
                    </p>
                  </div>

                  {/* Search filter within TOC */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={tocSearch}
                      onChange={(e) => setTocSearch(e.target.value)}
                      placeholder="Search article titles..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                    {tocSearch && (
                      <button
                        onClick={() => setTocSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>

                {/* Table of Contents List */}
                <div className="divide-y divide-slate-800/80">
                  {filteredTocStories.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No article titles matching "{tocSearch}".
                    </div>
                  ) : (
                    filteredTocStories.map((story) => {
                      const pageNum = story.pageNumber || 3;
                      return (
                        <div
                          key={story.id}
                          onClick={() => setCurrentPage(pageNum)}
                          className="py-3 sm:py-3.5 flex items-center justify-between gap-4 group hover:bg-slate-800/50 px-3 rounded-xl transition cursor-pointer"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Page Badge */}
                            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700/80 text-amber-400 font-mono text-xs font-bold group-hover:border-amber-500 transition">
                              Page {pageNum}
                            </span>
                            
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-rose-300 transition truncate">
                                {story.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="text-slate-300 font-medium">{story.author}</span>
                                <span>&bull;</span>
                                <span>{story.readTime}</span>
                                <span>&bull;</span>
                                <span className="text-amber-400/80 font-medium">{story.badge}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-slate-500 group-hover:text-rose-400 transition hidden sm:inline">
                              Read &rarr;
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* TOC Bottom Jump to First Story */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Cover Page</span>
                  </button>

                  <button
                    onClick={() => setCurrentPage(3)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition cursor-pointer"
                  >
                    <span>Start Reading Page 3 &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= PAGE 3+: NEWS ONE BY ONE ON PAGES ================= */}
            {currentStory && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
                {/* Article Header & Page Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-rose-400 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                      {currentStory.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentStory.readTime}</span>
                    <span>&bull;</span>
                    <button
                      onClick={() => setCurrentPage(2)}
                      className="text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <ListOrdered className="w-3 h-3" />
                      <span>Back to Index</span>
                    </button>
                  </div>
                </div>

                {/* Article Title */}
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    {currentStory.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Reported by <strong className="text-slate-200">{currentStory.author}</strong> &bull; {currentStory.authorTitle}
                  </p>
                </div>

                {/* Featured Editorial Image */}
                {currentStory.imageUrl && (
                  <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-800">
                    <img
                      src={currentStory.imageUrl}
                      alt={currentStory.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-300">
                      <span>Source: {currentStory.source || 'PulseNews Bureau'}</span>
                      <span className="font-mono">Page {currentPage}</span>
                    </div>
                  </div>
                )}

                {/* Key Metrics Dashboard */}
                {currentStory.keyMetrics && currentStory.keyMetrics.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    {currentStory.keyMetrics.map((km, i) => (
                      <div key={i} className="text-center">
                        <span className="text-[10px] text-slate-400 block">{km.label}</span>
                        <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">{km.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary Box */}
                <div className="p-4 rounded-xl bg-slate-950 border-l-4 border-rose-500 text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  {currentStory.summary}
                </div>

                {/* Story Paragraphs */}
                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentStory.contentParagraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Key Strategic Takeaways */}
                {currentStory.takeaways && currentStory.takeaways.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Executive Key Takeaways &bull; Page {currentPage}</span>
                    </h4>
                    <ul className="space-y-2">
                      {currentStory.takeaways.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reader Bottom Navigation Bar */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-900/90 backdrop-blur shrink-0 flex items-center justify-between gap-3">
          {/* Previous Page Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              currentPage <= 1
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {currentPage === 2 ? 'Cover (Page 1)' : `Page ${currentPage - 1}`}
            </span>
            <span className="sm:hidden">Prev</span>
          </button>

          {/* Page Dropdown / Slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden md:inline">Jump to:</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500"
            >
              <option value={1}>Page 1: Cover Page</option>
              <option value={2}>Page 2: Table of Contents ({stories.length} Articles)</option>
              {stories.map((st, i) => (
                <option key={st.id} value={i + 3}>
                  Page {i + 3}: {st.title.slice(0, 38)}...
                </option>
              ))}
            </select>
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              currentPage >= totalPages
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
            }`}
          >
            <span className="hidden sm:inline">
              {currentPage === 1 ? 'Table of Contents (Page 2)' : `Page ${currentPage + 1}`}
            </span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* If user is inside an active issue reader, show the page-by-page reader! */}
        {activeIssue ? (
          renderMagazineReader()
        ) : (
          /* Main Magazines Catalog & Selection Screen */
          <>
            {/* Top Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-sky-500/20 text-white border border-amber-500/30">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Categorical Technical Magazines</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      Daily (30) &bull; Weekly (60) &bull; Monthly (200)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Peer-reviewed cover editions with dedicated Table of Contents and sequential page-by-page reading
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenSubscribe(selectedCategory !== 'all' ? selectedCategory : 'business', selectedPeriod !== 'all' ? selectedPeriod : 'weekly')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold transition shadow-md shadow-rose-950/40 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Subscribe Free</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Navigation Bar */}
            <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {CATEGORIES.map((cat) => {
                  const IconComp = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Cadence Switcher: Daily (30 News) vs Weekly (60 News) vs Monthly (200 News) */}
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedPeriod('daily')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    selectedPeriod === 'daily'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Daily (30)
                </button>
                <button
                  onClick={() => setSelectedPeriod('weekly')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    selectedPeriod === 'weekly'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Weekly (60)
                </button>
                <button
                  onClick={() => setSelectedPeriod('monthly')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    selectedPeriod === 'monthly'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly (200)
                </button>
                <button
                  onClick={() => setSelectedPeriod('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    selectedPeriod === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Modal Body: Magazine Issues Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
              <div className="space-y-6">
                
                {/* Banner Callout for Content Ninja YouTube & Specifications */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/30 via-slate-900 to-amber-950/20 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                      <Youtube className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <span>Subscribe to Content Ninja on YouTube</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">
                          VIP Reader Partner
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Join Content Ninja for weekly technical analysis, architecture masterclasses, and executive briefings.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://www.youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-950/50"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Watch Content Ninja</span>
                  </a>
                </div>

                {/* Issues Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col group"
                    >
                      {/* Issue Cover Header */}
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={issue.coverImage}
                          alt={issue.magazineName}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow">
                            {issue.audienceBadge}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-black/60 backdrop-blur text-amber-300 border border-amber-500/30">
                            {issue.volume} &bull; {issue.issueNumber}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-4 right-4">
                          <span className="text-[10px] uppercase font-semibold text-rose-400">
                            {issue.categoryTitle}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                            {issue.magazineName}
                          </h3>
                        </div>
                      </div>

                      {/* Issue Details & Story Count */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {issue.tagline}
                          </p>

                          {/* Edition & News Count Pill */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              {issue.period === 'daily'
                                ? '📰 30 News Daily Edition'
                                : issue.period === 'weekly'
                                  ? '⭐ Top 60 Rated Stories'
                                  : '📚 200 News Compendium'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Cover &bull; TOC Index &bull; Page-by-Page
                            </span>
                          </div>

                          {/* Sample headlines teaser */}
                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              In This Issue:
                            </span>
                            {issue.featuredStories.slice(0, 2).map((s, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                                <span className="font-mono text-amber-400 text-[10px]">Pg {s.pageNumber}:</span>
                                <span className="truncate">{s.title}</span>
                              </div>
                            ))}
                            {issue.featuredStories.length > 2 && (
                              <span className="text-[11px] text-slate-500 italic block">
                                + {issue.featuredStories.length - 2} more news stories on sequential pages...
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                          <button
                            onClick={() => openIssueReader(issue, 1)}
                            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-rose-950/40 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Read Cover Page</span>
                          </button>

                          <button
                            onClick={() => openIssueReader(issue, 2)}
                            className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Open Table of Contents (Article Titles & Page Numbers)"
                          >
                            <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
                            <span>Table of Contents</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Email Sample Dispatch Section */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">
                      Instant Sample Dispatch
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Receive a free sample issue of our Daily 30 News, Weekly Top 60, or Monthly 200 News Compendium in your inbox.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={dispatchEmail}
                      onChange={(e) => setDispatchEmail(e.target.value)}
                      placeholder="Enter work email (e.g. founder@domain.com)..."
                      className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      onClick={() => handleDispatchSample(filteredIssues[0]?.id || 'biz-daily-today')}
                      disabled={isDispatching}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isDispatching ? 'Dispatching...' : 'Send Sample Issue'}
                    </button>
                  </div>

                  {dispatchStatus && (
                    <p className="text-xs text-emerald-400 font-semibold animate-in fade-in duration-150">
                      {dispatchStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
