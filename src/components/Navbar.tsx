import React, { useState } from 'react';
import { CATEGORIES, COUNTRIES } from '../utils/categories';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Radio, 
  Search, 
  Smartphone, 
  Monitor, 
  Bookmark, 
  X, 
  Globe, 
  Menu,
  Sparkles,
  Headphones,
  Code2,
  DollarSign,
  Laptop,
  BookOpen,
  User,
  ShoppingBag,
  Clock,
  GitBranch
} from 'lucide-react';

interface NavbarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  isAndroidView: boolean;
  onToggleAndroidView: () => void;
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onOpenAudioBriefing: () => void;
  onOpenCodeModal?: () => void;
  onOpenAdSense?: () => void;
  onOpenDownloadLaptop?: () => void;
  onOpenDeveloperProfile?: () => void;
  onOpenMagazineHub?: (category?: string) => void;
  onOpenMagazineSubscribe?: (category?: string) => void;
  onOpenDeals?: () => void;
  onOpenAutomationSchedule?: () => void;
  isMonthlyArchive?: boolean;
  onToggleMonthlyArchive?: () => void;
  isTop10Overview?: boolean;
  onToggleTop10Overview?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedCountry,
  onSelectCountry,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isAndroidView,
  onToggleAndroidView,
  bookmarkCount,
  onOpenBookmarks,
  onOpenAudioBriefing,
  onOpenCodeModal,
  onOpenAdSense,
  onOpenDownloadLaptop,
  onOpenDeveloperProfile,
  onOpenMagazineHub,
  onOpenMagazineSubscribe,
  onOpenDeals,
  onOpenAutomationSchedule,
  isMonthlyArchive = false,
  onToggleMonthlyArchive,
  isTop10Overview = false,
  onToggleTop10Overview
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onSelectCategory('all');
                onSearchChange('');
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/30 group-hover:scale-105 transition-transform">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">Pulse</span>
                  <span className="text-lg font-black tracking-tight text-rose-500">News</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Global Feed &bull; NewsAPI &bull; Android PWA
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search global breaking news, topics, companies..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 transition outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    onSelectCategory('all');
                  }}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white md:hidden"
              aria-label="Toggle search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Country Selector */}
            <div className="relative hidden sm:block">
              <select
                value={selectedCountry}
                onChange={(e) => onSelectCountry(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium rounded-xl pl-2.5 pr-7 py-2 cursor-pointer outline-none focus:border-rose-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.flag} {c.code.toUpperCase()}
                  </option>
                ))}
              </select>
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Audio Briefing / Podcast Mode Button */}
            <button
              onClick={onOpenAudioBriefing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-rose-500/10 hover:from-amber-500/20 hover:to-rose-500/20 text-amber-300 border border-amber-500/30 transition cursor-pointer"
              title="Listen to Top Stories (Daily Podcast Mode)"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Audio Briefing</span>
            </button>

            {/* Technical Magazines Button */}
            {onOpenMagazineHub && (
              <button
                onClick={() => onOpenMagazineHub()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 hover:from-rose-500/20 hover:to-amber-500/20 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                title="Browse Technical Magazines (Business, Health, Tech, Sports)"
              >
                <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Magazines</span>
              </button>
            )}

            {/* Exclusive Deals Button */}
            {onOpenDeals && (
              <button
                onClick={onOpenDeals}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 hover:from-amber-500/25 hover:to-rose-500/25 text-amber-300 border border-amber-500/40 transition cursor-pointer shadow-sm animate-pulse-subtle"
                title="Amazon & Flipkart Tech Deals (Up to 70% Off)"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Deals</span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black">
                  HOT
                </span>
              </button>
            )}

            {/* Automations & Magazine Schedules Button */}
            {onOpenAutomationSchedule && (
              <button
                onClick={onOpenAutomationSchedule}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500/15 via-indigo-500/15 to-emerald-500/15 hover:from-emerald-500/25 hover:to-indigo-500/25 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                title="Automated Magazine Schedules (7 AM / 7 PM) & 5h Background News Sync"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Automations</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  7AM/PM
                </span>
              </button>
            )}

            {/* Developer Profile Button */}
            {onOpenDeveloperProfile && (
              <button
                onClick={onOpenDeveloperProfile}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600/10 via-indigo-600/10 to-amber-500/10 hover:from-rose-600/20 hover:to-amber-500/20 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                title="View Lead Developer Profile & Suggestions (Amol Kharat)"
              >
                <User className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Developer</span>
              </button>
            )}

            {/* Android vs Web App Mode Switcher */}
            <button
              onClick={onToggleAndroidView}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                isAndroidView
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
              }`}
              title={isAndroidView ? 'Switch to Full Web View' : 'Preview in Android Mobile App Simulator'}
            >
              {isAndroidView ? (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Web Portal</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Android App</span>
                </>
              )}
            </button>

            {/* Bookmarks Button */}
            <button
              onClick={onOpenBookmarks}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition relative"
              title="Saved Articles"
            >
              <Bookmark className="w-4 h-4" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-scale">
                  {bookmarkCount}
                </span>
              )}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>

        {/* Mobile Search Input Bar */}
        {showSearchInput && (
          <div className="py-2.5 md:hidden border-t border-slate-800 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search breaking news..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                autoFocus
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={onSearchSubmit}
              className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
            >
              Go
            </button>
          </div>
        )}
      </div>

      {/* Categories Horizontal Navigation Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
            {/* All / Home Pill */}
            <button
              onClick={() => onSelectCategory('all')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedCategory === 'all' && !isTop10Overview && !isMonthlyArchive
                  ? 'bg-white text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              All Categories
            </button>

            {/* Top 10 News On One Page Pill */}
            {onToggleTop10Overview && (
              <button
                onClick={onToggleTop10Overview}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  isTop10Overview
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-slate-900 border border-amber-500/30'
                }`}
              >
                <span>⭐ Top 10 News</span>
              </button>
            )}

            {/* Curated Edition Archive Pill */}
            {onToggleMonthlyArchive && (
              <button
                onClick={onToggleMonthlyArchive}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  isMonthlyArchive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-900 border border-emerald-500/30'
                }`}
                title="Instant access to verified curated news coverage"
              >
                <span>⚡ Curated Edition</span>
              </button>
            )}

            {/* Technical Magazines Pill */}
            {onOpenMagazineHub && (
              <button
                onClick={() => onOpenMagazineHub()}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 text-rose-300 hover:text-white hover:bg-slate-900 border border-rose-500/30 transition cursor-pointer"
                title="Categorical Technical Magazines: Business, Health, Tech, Sports"
              >
                <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                <span>📰 Technical Magazines</span>
              </button>
            )}

            {/* Deals Pill */}
            {onOpenDeals && (
              <button
                onClick={onOpenDeals}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/15 to-rose-500/15 text-amber-300 hover:text-white hover:bg-slate-900 border border-amber-500/30 transition cursor-pointer"
                title="Amazon & Flipkart Tech Deals (Up to 70% Off)"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>🔥 Tech Deals (70% Off)</span>
              </button>
            )}

            {/* Automations Pill */}
            {onOpenAutomationSchedule && (
              <button
                onClick={onOpenAutomationSchedule}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/15 to-indigo-500/15 text-emerald-300 hover:text-white hover:bg-slate-900 border border-emerald-500/30 transition cursor-pointer"
                title="Automated Magazine Schedules (7 AM/PM) & 5h Background Sync"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>⚙️ Automations (7 AM/PM)</span>
              </button>
            )}

            {/* Divider */}
            <div className="h-4 w-px bg-slate-800 shrink-0 mx-1" />

            {/* Categories */}
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
