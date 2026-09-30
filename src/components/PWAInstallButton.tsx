import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Check, X, Chrome, HelpCircle } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'subtle' | 'android-badge';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'primary'
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  // If already installed in standalone mode
  if (isInstalled) {
    if (variant === 'android-badge') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Check className="w-3.5 h-3.5" /> Installed App
        </span>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstalledNotice(true);
        setTimeout(() => setInstalledNotice(false), 4000);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        aria-label="Install App"
        className={`group relative inline-flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer active:scale-95 ${
          variant === 'android-badge'
            ? 'px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 text-xs'
            : variant === 'subtle'
            ? 'px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700 text-xs border border-slate-700'
            : 'px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm shadow-lg shadow-emerald-950/40 border border-emerald-400/30'
        } ${className}`}
      >
        <Smartphone className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Install Android / Web App</span>
        <span className="sm:hidden">Install App</span>
        <Download className="w-3.5 h-3.5 opacity-80" />
      </button>

      {/* Installed notification toast */}
      {installedNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-2xl animate-bounce">
          <Check className="w-5 h-5" />
          <span className="text-sm font-semibold">PulseNews installed successfully!</span>
        </div>
      )}

      {/* Android & Mobile Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Install PulseNews App</h3>
                <p className="text-xs text-slate-400">Android WebAPK & Progressive Web App</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-1">
                  <Chrome className="w-4 h-4" />
                  <span>On Android (Google Chrome or Samsung Browser):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 text-xs">
                  <li>Tap the <strong>three dots menu (⋮)</strong> at the top right of your browser.</li>
                  <li>Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                  <li>Confirm installation. PulseNews will appear on your home screen with its native icon and launch full-screen!</li>
                </ol>
              </div>

              {isIOS && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center gap-2 font-semibold text-sky-400 mb-1">
                    <Smartphone className="w-4 h-4" />
                    <span>On Apple iOS (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 text-xs">
                    <li>Tap the <strong>Share</strong> icon (square with arrow up) at the bottom.</li>
                    <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                  </ol>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center gap-2 font-semibold text-purple-400 mb-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>Features of the Installed Android App:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs pl-1">
                  <li>Full-screen native experience without browser address bar</li>
                  <li>Offline news reading with cached articles and bookmarks</li>
                  <li>High-speed instant loading with service worker cache</li>
                  <li>Android native sharing and reader mode</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-md transition"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
