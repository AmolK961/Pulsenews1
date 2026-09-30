import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Laptop, 
  Terminal, 
  FolderArchive, 
  Check, 
  Copy, 
  Github, 
  ExternalLink,
  Sparkles,
  Zap,
  Play
} from 'lucide-react';

interface DownloadLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadLaptopModal: React.FC<DownloadLaptopModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleDownload = () => {
    setDownloading(true);
    // Direct link to server endpoint
    window.location.href = '/api/project/download-zip';
    setTimeout(() => setDownloading(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Run PulseNews on Your Laptop</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Full Project
                </span>
              </h3>
              <p className="text-xs text-slate-400">Download the complete source code or clone via GitHub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Option A: React Native (Android & Apple iOS) Mobile App ZIP */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-800/80 to-slate-900 border border-indigo-500/40 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  React Native &bull; Android &amp; Apple iOS
                </span>
                <h4 className="text-base font-bold text-white mt-1">Download React Native Mobile Project (.ZIP)</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Complete cross-platform mobile app with Expo, React Navigation, Voice Narrator, Clean Reader, and <strong>Over-The-Air (OTA) live updates</strong>.
                </p>
              </div>
              <FolderArchive className="w-8 h-8 text-indigo-400/70 shrink-0" />
            </div>

            <div className="pt-1">
              <a
                href="/api/project/download-react-native-zip"
                download="PulseNews-ReactNative-Android-iOS.zip"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download React Native App (.ZIP)</span>
              </a>
            </div>
          </div>

          {/* Option B: Full-Stack Web + Node Server ZIP */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-800/80 to-slate-900 border border-rose-500/30 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" />
                  Full-Stack Web &amp; API Server
                </span>
                <h4 className="text-base font-bold text-white mt-1">Download Complete Web &amp; Server ZIP</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Contains React web frontend, Express server, Google AdSense setup, PWA files, assets, and configs.
                </p>
              </div>
              <FolderArchive className="w-8 h-8 text-rose-400/60 shrink-0" />
            </div>

            <div className="pt-1">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Packaging PulseNews-project.zip...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PulseNews-project.zip</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OTA Updates Explanation: "After updating, change should be after update" */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h5 className="text-xs font-bold text-white">How Code Updates Work (Over-The-Air)</h5>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In React Native, whenever you make changes to your screens, styles, or code, you don&apos;t have to re-submit to Apple App Store or Google Play. Run <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono text-[11px]">npx eas update --auto</code>. The app checks on launch via <code className="text-slate-200 font-mono text-[11px]">updateService.ts</code>, downloads the changes in the background, and reloads immediately so the user sees the new changes right after the update!
            </p>
          </div>

          {/* Quick Steps to Run on Laptop */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              How to Run on Your Laptop (3 Easy Steps)
            </h4>

            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="text-xs font-semibold text-white">Extract the ZIP & Open Terminal</span>
              </div>
              <p className="text-xs text-slate-400 pl-7">
                Unzip <code className="text-slate-200 font-mono bg-slate-800 px-1 py-0.5 rounded text-[11px]">PulseNews-project.zip</code> on your Mac, Windows, or Linux laptop, and open your terminal or command prompt inside the unzipped folder.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="text-xs font-semibold text-white">Install Project Dependencies</span>
                </div>
                <button
                  onClick={() => copyToClipboard('npm install', 'step2')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                >
                  {copiedCmd === 'step2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'step2' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="pl-7">
                <pre className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl font-mono text-xs text-emerald-400">
                  npm install
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="text-xs font-semibold text-white">Start the App on Localhost</span>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run dev', 'step3')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                >
                  {copiedCmd === 'step3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'step3' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="pl-7 space-y-2">
                <pre className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl font-mono text-xs text-amber-400 flex items-center justify-between">
                  <span>npm run dev</span>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                </pre>
                <p className="text-xs text-slate-400">
                  Open <strong>http://localhost:3000</strong> in your browser to use the full news app with clean reader, AdSense, and live streams!
                </p>
              </div>
            </div>
          </div>

          {/* Method 2: Export via GitHub */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-300" />
              <h5 className="text-xs font-bold text-white">Prefer Git & GitHub?</h5>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In Google AI Studio, look at the <strong>top header</strong> and click <strong>&quot;Export to GitHub&quot;</strong>. This automatically pushes this complete repository to your personal GitHub account so you can run <code className="text-slate-300 font-mono">git clone &lt;repo&gt;</code> directly on your laptop.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Check className="w-4 h-4 text-emerald-400" />
            Tested &amp; ready for Node.js 18+ on Windows, Mac, &amp; Linux
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
