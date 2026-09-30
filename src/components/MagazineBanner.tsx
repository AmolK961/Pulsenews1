import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Mail, 
  ArrowRight, 
  DollarSign, 
  Stethoscope, 
  Laptop, 
  Trophy, 
  Calendar,
  Youtube,
  ListOrdered
} from 'lucide-react';

interface MagazineBannerProps {
  onOpenHub: (category?: string) => void;
  onOpenSubscribe: (category?: string) => void;
}

export const MagazineBanner: React.FC<MagazineBannerProps> = ({
  onOpenHub,
  onOpenSubscribe
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/25 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl mb-8">
      {/* Decorative Glow */}
      <div className="absolute -right-20 -top-20 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              New &bull; Professional Technical Magazines
            </span>
            <span className="text-xs text-rose-300 font-semibold hidden sm:inline">
              &bull; Daily (30) &bull; Weekly Top-Rated (60) &bull; Monthly (200)
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            Curated Industry Journals with Cover Page, Table of Contents &amp; Sequential Pages
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Read complete magazine editions page-by-page: <strong>Daily 30 News</strong> briefings, <strong>Weekly Top 60</strong> rated analyses, and <strong>Monthly 200 News</strong> compendiums. Plus subscribe to our YouTube partner <strong className="text-red-400">Content Ninja</strong> for weekly video breakdowns.
          </p>

          {/* Category Chips */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenHub('business')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-[11px] font-semibold transition cursor-pointer"
            >
              <DollarSign className="w-3 h-3" />
              <span>Business Executive</span>
            </button>

            <button
              onClick={() => onOpenHub('health')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-[11px] font-semibold transition cursor-pointer"
            >
              <Stethoscope className="w-3 h-3" />
              <span>Doctors &amp; Clinical</span>
            </button>

            <button
              onClick={() => onOpenHub('technology')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-300 text-[11px] font-semibold transition cursor-pointer"
            >
              <Laptop className="w-3 h-3" />
              <span>Tech &amp; Architecture</span>
            </button>

            <button
              onClick={() => onOpenHub('sports')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold transition cursor-pointer"
            >
              <Trophy className="w-3 h-3" />
              <span>Sports &amp; Athletics</span>
            </button>

            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-300 text-[11px] font-semibold transition cursor-pointer"
            >
              <Youtube className="w-3 h-3 text-red-500" />
              <span>YouTube: Content Ninja</span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <button
            onClick={() => onOpenSubscribe()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Subscribe (Daily/Weekly/Monthly)</span>
          </button>

          <button
            onClick={() => onOpenHub('all')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
            <span>Browse Cover &amp; Table of Contents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
