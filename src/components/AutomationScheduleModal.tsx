import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Send, 
  GitBranch, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Sparkles, 
  Flame, 
  Server, 
  Smartphone, 
  Terminal, 
  FileCode2, 
  ExternalLink 
} from 'lucide-react';
import { SchedulerStatus, DispatchLogEntry } from '../services/magazineScheduler';

interface AutomationScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutomationScheduleModal: React.FC<AutomationScheduleModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'magazines' | 'news_sync' | 'direct_deploy'>('magazines');
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [triggerMessage, setTriggerMessage] = useState<string>('');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/magazine/scheduler-status');
      if (res.ok) {
        const data = await res.json();
        setSchedulerStatus(data);
      }
    } catch (e) {
      console.warn('Failed to load scheduler status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleTriggerTest = async (type: 'daily_morning' | 'daily_evening' | 'weekly_sunday' | 'monthly_last_day') => {
    setTriggering(type);
    setTriggerMessage('');
    try {
      const res = await fetch('/api/magazine/trigger-scheduled-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setTriggerMessage(`✅ Test dispatch for ${type} executed successfully! (${data.entry.successfulSends} delivered)`);
        fetchStatus();
      } else {
        setTriggerMessage(`❌ Dispatch failed: ${data.message}`);
      }
    } catch (e: any) {
      setTriggerMessage(`❌ Error: ${e.message}`);
    } finally {
      setTriggering(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
              <Clock className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-rose-400">
                  PulseNews Automation Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Active 24/7
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Automated Schedules &amp; Background Sync Hub
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('magazines')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'magazines'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Magazine Dispatch (7 AM / 7 PM)</span>
          </button>
          <button
            onClick={() => setActiveTab('news_sync')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'news_sync'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>5-Hour News Sync (Android &amp; Web)</span>
          </button>
          <button
            onClick={() => setActiveTab('direct_deploy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'direct_deploy'
                ? 'border-rose-400 text-rose-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 text-rose-400" />
            <span>Direct Node.js (No Docker / No CI/CD)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs">
          {/* TAB 1: Magazine Dispatch Schedules */}
          {activeTab === 'magazines' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Scheduled Magazine Distribution Protocol</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Configured according to your exact schedule: <strong>Daily at 7:00 AM &amp; 7:00 PM</strong>, <strong>Weekly on Sunday at 7:00 AM</strong>, and <strong>Monthly on the last day of the month at 7:00 AM</strong>. All editions are automatically compiled and delivered to subscriber inboxes and the Free Plan Mailbox.
                </p>
              </div>

              {triggerMessage && (
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white">
                  {triggerMessage}
                </div>
              )}

              {/* Schedule Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Daily Morning */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase">
                      Every Morning
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">07:00 AM</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Daily Morning Magazine</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dispatches the 30-story Daily Morning verified edition covering overnight global developments.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="font-mono text-[10px] text-slate-500">Cron: 0 7 * * *</span>
                    <button
                      onClick={() => handleTriggerTest('daily_morning')}
                      disabled={triggering !== null}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold transition cursor-pointer"
                    >
                      {triggering === 'daily_morning' ? 'Dispatching...' : 'Test Run (7 AM)'}
                    </button>
                  </div>
                </div>

                {/* 2. Daily Evening */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                      Every Evening
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">07:00 PM</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Daily Evening Magazine</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dispatches the 30-story Daily Evening wrap-up covering market closes, tech breakthroughs, and policy updates.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="font-mono text-[10px] text-slate-500">Cron: 0 19 * * *</span>
                    <button
                      onClick={() => handleTriggerTest('daily_evening')}
                      disabled={triggering !== null}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold transition cursor-pointer"
                    >
                      {triggering === 'daily_evening' ? 'Dispatching...' : 'Test Run (7 PM)'}
                    </button>
                  </div>
                </div>

                {/* 3. Weekly Sunday */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase">
                      Every Sunday
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">07:00 AM</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Weekly Sunday Master Digest</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dispatches the Top 60 verified stories with complete Table of Contents and in-depth analytical deep dives.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="font-mono text-[10px] text-slate-500">Cron: 0 7 * * 0</span>
                    <button
                      onClick={() => handleTriggerTest('weekly_sunday')}
                      disabled={triggering !== null}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold transition cursor-pointer"
                    >
                      {triggering === 'weekly_sunday' ? 'Dispatching...' : 'Test Run (Sunday)'}
                    </button>
                  </div>
                </div>

                {/* 4. Monthly Last Day */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                      Last Day of Month
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">07:00 AM</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Monthly Compendium (200 Stories)</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dispatches the grand 200-story monthly archive spanning all disciplines (Business, Tech, Health, Science).
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="font-mono text-[10px] text-slate-500">Cron: 0 7 * * * (Day Check)</span>
                    <button
                      onClick={() => handleTriggerTest('monthly_last_day')}
                      disabled={triggering !== null}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold transition cursor-pointer"
                    >
                      {triggering === 'monthly_last_day' ? 'Dispatching...' : 'Test Run (Month-end)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Inbuilt 5-Hour News Fetcher */}
          {activeTab === 'news_sync' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-emerald-300">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Dual Architecture: 5-Hour Background Sync</span>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  Both the <strong>React Web App</strong> and the <strong>Android simulated mobile environment</strong> continuously synchronize news every 5 hours. Freshly fetched articles are indexed into the local and server-side JSON store (<code>data/monthly_news.json</code>) with strict <strong>Latest News First</strong> sorting!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Server className="w-4 h-4 text-rose-400" />
                    <span>Server Background Worker</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Runs automated multi-category fetches every 3 hours. Merges articles into the permanent monthly JSON file so responses are instantaneous.
                  </p>
                  <div className="font-mono text-[11px] text-emerald-400 bg-slate-900 p-2 rounded-lg">
                    Schedule: Every 3 hours (0 */3 * * *)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>React App &amp; Android WorkManager</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Client-side <code>useNewsSync</code> hook maintains a 5-hour heartbeat. When building native Android APKs, the included <code>NewsSyncWorker</code> executes via Android OS WorkManager.
                  </p>
                  <div className="font-mono text-[11px] text-amber-400 bg-slate-900 p-2 rounded-lg">
                    Interval: 5 Hours (18,000,000 ms)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Direct Node.js Deployment (No Docker / No CI/CD) */}
          {activeTab === 'direct_deploy' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-rose-300">
                  <Terminal className="w-4 h-4 text-rose-400" />
                  <span>Direct Node.js Architecture (Zero Docker &bull; Zero CI/CD)</span>
                </div>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  As requested, this project uses <strong>NO Docker containers</strong> and <strong>NO complicated CI/CD pipelines</strong>. Everything runs directly on standard Node.js (v20+) as a single unified service handling both the Express backend API and the Vite React frontend on Port 3000!
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm">How to Run &amp; Deploy Directly:</h4>
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-sans text-xs font-semibold">1. Local Development (Single Server)</div>
                    <div className="text-emerald-400 bg-slate-900 px-3 py-2 rounded-lg">
                      npm run dev
                    </div>
                    <div className="text-slate-500 font-sans text-[11px] pt-1">
                      Starts Express server with Vite middleware on http://localhost:3000
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-sans text-xs font-semibold">2. Build Production Bundle</div>
                    <div className="text-amber-400 bg-slate-900 px-3 py-2 rounded-lg">
                      npm run build
                    </div>
                    <div className="text-slate-500 font-sans text-[11px] pt-1">
                      Compiles static frontend assets into <code>dist/</code>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-sans text-xs font-semibold">3. Run Production Server</div>
                    <div className="text-rose-400 bg-slate-900 px-3 py-2 rounded-lg">
                      npm start
                    </div>
                    <div className="text-slate-500 font-sans text-[11px] pt-1">
                      Runs <code>node server.ts</code> serving static assets and API routes directly
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Environment Requirement:</span>
                <span className="font-bold text-white">Node.js 20+ &bull; 1 Process &bull; Port 3000</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-500">
          <span>PulseNews Automation Engine &bull; Lead Developer: Amol Kharat</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
