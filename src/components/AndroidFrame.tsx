import React from 'react';
import { Wifi, Signal, BatteryCharging, Home, Grid, Bookmark, Settings, Smartphone } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeNavTab: 'home' | 'categories' | 'bookmarks' | 'settings';
  onNavTabChange: (tab: 'home' | 'categories' | 'bookmarks' | 'settings') => void;
  bookmarkCount: number;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeNavTab,
  onNavTabChange,
  bookmarkCount
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6 bg-slate-950/80 min-h-screen">
      {/* Device wrapper */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-950 rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[10px] border-slate-800 ring-1 ring-slate-700/60 overflow-hidden flex flex-col">
        {/* Android Punch Hole Camera Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-40 border border-slate-800 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
        </div>

        {/* Android Status Bar */}
        <div className="h-8 bg-slate-950/95 backdrop-blur-md px-6 flex items-center justify-between text-xs text-slate-300 select-none z-30 shrink-0 border-b border-slate-900">
          <span className="font-semibold text-[11px] tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400">5G</span>
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono">98%</span>
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Main Content inside Android Phone */}
        <div className="flex-1 overflow-y-auto bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800">
          {children}
        </div>

        {/* Android Material Design 3 Bottom Navigation Bar */}
        <div className="h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-4 flex items-center justify-around z-30 shrink-0">
          <button
            onClick={() => onNavTabChange('home')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeNavTab === 'home' ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full ${activeNavTab === 'home' ? 'bg-rose-500/15' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button
            onClick={() => onNavTabChange('categories')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeNavTab === 'categories' ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full ${activeNavTab === 'categories' ? 'bg-rose-500/15' : ''}`}>
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Categories</span>
          </button>

          <button
            onClick={() => onNavTabChange('bookmarks')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-all ${
              activeNavTab === 'bookmarks' ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full ${activeNavTab === 'bookmarks' ? 'bg-rose-500/15' : ''}`}>
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Saved</span>
            {bookmarkCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavTabChange('settings')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeNavTab === 'settings' ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full ${activeNavTab === 'settings' ? 'bg-rose-500/15' : ''}`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">App & PWA</span>
          </button>
        </div>

        {/* Android Gesture Navigation Bar Pill */}
        <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
