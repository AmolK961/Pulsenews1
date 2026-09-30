import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Smartphone, 
  Wifi, 
  Database, 
  Trash2, 
  Info, 
  ShieldCheck, 
  KeyRound, 
  ExternalLink,
  BellRing,
  Headphones,
  User
} from 'lucide-react';

interface AndroidAppSettingsProps {
  onClearStorage: () => void;
  bookmarkCount: number;
  onOpenAudioBriefing?: () => void;
  onOpenDeveloperProfile?: () => void;
}

export const AndroidAppSettings: React.FC<AndroidAppSettingsProps> = ({
  onClearStorage,
  bookmarkCount,
  onOpenAudioBriefing,
  onOpenDeveloperProfile
}) => {
  return (
    <div className="p-4 space-y-4 text-slate-200">
      {/* App Header Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-900/40 via-slate-900 to-slate-900 border border-rose-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">PulseNews Android App</h2>
            <p className="text-xs text-rose-300">Version 2.4.0 &bull; PWA & WebAPK</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 mt-3 leading-relaxed">
          Full-featured Android news client connected directly to NewsAPI.org v2 with live iframe reader mode, Gemini AI brief, and offline caching.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <PWAInstallButton className="w-full justify-center" />
          {onOpenDeveloperProfile && (
            <button
              onClick={onOpenDeveloperProfile}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600/20 to-amber-500/20 hover:from-rose-600/30 hover:to-amber-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <User className="w-4 h-4 text-rose-400" />
              <span>Lead Developer Profile (Amol Kharat)</span>
            </button>
          )}
          {onOpenAudioBriefing && (
            <button
              onClick={onOpenAudioBriefing}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Headphones className="w-4 h-4 text-amber-400" />
              <span>Launch Audio Daily Briefing</span>
            </button>
          )}
        </div>
      </div>

      {/* Android Device Status */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Performance</h3>
        
        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>Connection</span>
          </div>
          <span className="font-semibold text-emerald-400">High Speed (Online)</span>
        </div>

        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>Offline Saved Articles</span>
          </div>
          <span className="font-semibold text-white">{bookmarkCount} items</span>
        </div>

        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>API Engine</span>
          </div>
          <span className="font-semibold text-slate-300">NewsAPI.org v2 (Active)</span>
        </div>
      </div>

      {/* Storage Management */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Local Device Storage</h3>
        <p className="text-xs text-slate-400">
          Clear cached articles, temporary thumbnails, and saved reading history.
        </p>
        <button
          onClick={onClearStorage}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Local News Cache</span>
        </button>
      </div>

      {/* About & Attributions */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Info className="w-4 h-4 text-rose-400" />
          <span>About PulseNews</span>
        </div>
        <p>
          News content provided in real-time by NewsAPI.org. Articles and media remain the property of their respective publishers.
        </p>
        <a
          href="https://newsapi.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-rose-400 hover:underline pt-1"
        >
          <span>Visit NewsAPI.org</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
