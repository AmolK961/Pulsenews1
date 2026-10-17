import React from 'react';
import { Article } from '../types/news';
import { ArticleCard } from './ArticleCard';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  RefreshCw, 
  Flame, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Monitor, 
  Server, 
  Zap,
  CheckCircle2
} from 'lucide-react';

interface TodaysNewsSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onBookmarkToggle?: () => void;
  isSyncing: boolean;
  onManualSync: () => void;
  totalStoreCount: number;
}

export const TodaysNewsSection: React.FC<TodaysNewsSectionProps> = ({
  articles,
  onSelectArticle,
  onBookmarkToggle,
  isSyncing,
  onManualSync,
  totalStoreCount
}) => {
  // Format today's date in a human-friendly format
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <section className="space-y-5 p-4 sm:p-6 lg:p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 shrink-0">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Today's Edition
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {todayFormatted}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">
                {articles.length} Stories Published Today
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <span>Today's Verified Breaking News &amp; Developments</span>
              <span className="text-xs font-normal text-slate-400 hidden sm:inline">&bull; Latest news prioritized first</span>
            </h2>
          </div>
        </div>

        {/* Action Controls & Single Server Reassurance */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Trigger background news fetch and store"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Today\'s News'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Device Responsive Compatibility Pill Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-rose-400" />
            <span>Single Server (Unified Vite + Express):</span>
          </span>
          <span className="text-emerald-400 font-medium">Port 3000 &bull; Zero External Server Required</span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium overflow-x-auto">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Smartphone className="w-3 h-3 text-sky-400" />
            Mobile (1-Col)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Tablet className="w-3 h-3 text-amber-400" />
            Tablet (2-Col)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Laptop className="w-3 h-3 text-emerald-400" />
            Laptop (3-Col)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Monitor className="w-3 h-3 text-purple-400" />
            Desktop (4-Col)
          </span>
        </div>
      </div>

      {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on laptop, 4 on desktop */}
      {articles.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p>No news specifically published in the last 24 hours yet. Running background sync...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {articles.slice(0, 8).map((article, idx) => (
            <ArticleCard
              key={`today-${article.url}-${idx}`}
              article={article}
              onSelect={onSelectArticle}
              onBookmarkToggle={onBookmarkToggle}
              variant="standard"
              rankNumber={idx + 1}
              categoryLabel="Today's News"
            />
          ))}
        </div>
      )}
    </section>
  );
};
