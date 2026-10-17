import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle2, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { SyncStatus } from '../services/newsSyncService';

interface NewsSyncBadgeProps {
  syncStatus: SyncStatus;
  isSyncing: boolean;
  onManualSync: () => void;
  isAndroidView?: boolean;
}

export const NewsSyncBadge: React.FC<NewsSyncBadgeProps> = ({
  syncStatus,
  isSyncing,
  onManualSync,
  isAndroidView = false
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const ms = syncStatus.timeUntilNextSyncMs;
      if (ms <= 0) {
        setTimeLeftStr('Sync due');
        return;
      }
      const totalMinutes = Math.floor(ms / (60 * 1000));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      setTimeLeftStr(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, [syncStatus.timeUntilNextSyncMs]);

  const lastSyncDateStr = syncStatus.lastSyncTime > 0
    ? new Date(syncStatus.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';

  if (isAndroidView) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">5h News Sync</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Next: {timeLeftStr}</span>
        </div>
        <button
          onClick={onManualSync}
          disabled={isSyncing}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-400 transition cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-slate-900/80 via-slate-950/80 to-slate-900/80 border border-slate-800 text-xs backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Inbuilt 5h Sync Active</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Last fetch: <strong className="text-slate-200">{lastSyncDateStr}</strong></span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">Next auto-fetch: <strong className="text-amber-400">{timeLeftStr}</strong></span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-400">Sorting: <strong className="text-emerald-400">Latest News First</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onManualSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-[11px] border border-slate-700 transition cursor-pointer disabled:opacity-50"
          title="Force immediate 5-hour news fetch and store in JSON"
        >
          <RefreshCw className={`w-3 h-3 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Fetching Latest News...' : '⚡ Sync News Now'}</span>
        </button>
      </div>
    </div>
  );
};
