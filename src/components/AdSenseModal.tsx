import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Settings2, 
  Smartphone, 
  Globe, 
  FileText,
  Copy,
  Check
} from 'lucide-react';

interface AdSenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdSenseModal: React.FC<AdSenseModalProps> = ({ isOpen, onClose }) => {
  const [clientId, setClientId] = useState(() => {
    return localStorage.getItem('pulsenews_adsense_client') || import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-8153839325985487';
  });
  const [headerSlot, setHeaderSlot] = useState(() => {
    return localStorage.getItem('pulsenews_adsense_slot_header') || '1029384756';
  });
  const [feedSlot, setFeedSlot] = useState(() => {
    return localStorage.getItem('pulsenews_adsense_slot_feed') || '5647382910';
  });
  const [testMode, setTestMode] = useState(() => {
    return localStorage.getItem('pulsenews_adsense_test') !== 'false';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedAdsTxt, setCopiedAdsTxt] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'adstxt' | 'android_admob'>('config');

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('pulsenews_adsense_client', clientId.trim());
    localStorage.setItem('pulsenews_adsense_slot_header', headerSlot.trim());
    localStorage.setItem('pulsenews_adsense_slot_feed', feedSlot.trim());
    localStorage.setItem('pulsenews_adsense_test', String(testMode));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const pubIdOnly = clientId.replace('ca-', '');
  const adsTxtSnippet = `google.com, ${pubIdOnly}, DIRECT, f08c47fec0942fa0`;

  const copyAdsTxt = () => {
    navigator.clipboard.writeText(adsTxtSnippet);
    setCopiedAdsTxt(true);
    setTimeout(() => setCopiedAdsTxt(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Google AdSense &amp; Monetization</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">Configure Publisher IDs, ad placements &amp; ads.txt</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-6 pt-3 bg-slate-950/50 border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-rose-500 text-rose-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>AdSense Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('adstxt')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'adstxt'
                ? 'border-rose-500 text-rose-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ads.txt Verification</span>
          </button>
          <button
            onClick={() => setActiveTab('android_admob')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'android_admob'
                ? 'border-rose-500 text-rose-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android (Google AdMob)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* Publisher Client ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Google AdSense Publisher ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="ca-pub-8153839325985487"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Found in your Google AdSense account under <strong>Account &gt; Settings &gt; Publisher ID</strong>.
                </p>
              </div>

              {/* Slot IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Leaderboard Banner Slot ID
                  </label>
                  <input
                    type="text"
                    value={headerSlot}
                    onChange={(e) => setHeaderSlot(e.target.value)}
                    placeholder="1029384756"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Top header banner ad unit.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    In-Feed Native Ad Slot ID
                  </label>
                  <input
                    type="text"
                    value={feedSlot}
                    onChange={(e) => setFeedSlot(e.target.value)}
                    placeholder="5647382910"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Between news categories and reader mode.</p>
                </div>
              </div>

              {/* Test Mode Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">AdSense Test / Preview Mode</span>
                  <span className="text-[11px] text-slate-400 block">
                    Displays mock ad placeholders safely to prevent policy violations while awaiting site approval.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTestMode(!testMode)}
                  className={`w-12 h-6 rounded-full transition p-1 cursor-pointer flex items-center ${
                    testMode ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Placements Guide */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Active AdSense Placements in PulseNews:
                </span>
                <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                  <li><strong>Top Leaderboard</strong>: Displayed directly below the Market Bar.</li>
                  <li><strong>Category In-Feed</strong>: Placed between breaking news and category sections.</li>
                  <li><strong>In-Page News Reader</strong>: Displayed inside the Clean Reader modal below article summary.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-950/50 cursor-pointer"
                >
                  Save AdSense Configuration
                </button>
                {savedSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Configuration saved &amp; applied!
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'adstxt' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-white text-sm">Google ads.txt Verification File</h3>
                <p className="text-slate-400 mt-1">
                  Google AdSense requires an <code className="text-rose-400 font-mono">ads.txt</code> file hosted at the root of your domain to verify publisher ownership and prevent counterfeit ad inventory.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-emerald-400 text-xs flex items-center justify-between">
                <span>{adsTxtSnippet}</span>
                <button
                  onClick={copyAdsTxt}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1"
                >
                  {copiedAdsTxt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copiedAdsTxt ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200">How ads.txt is served in PulseNews:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  PulseNews automatically serves this file at <a href="/ads.txt" target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline">/ads.txt</a>. When you connect a custom domain in Google AdSense, the AdSense crawler will automatically detect this line and mark your domain as <strong>Authorized</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'android_admob' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-white text-sm">Google AdMob for Native Android Apps</h3>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  While Google AdSense powers Web and PWA web applications, native Android APKs use <strong>Google AdMob</strong> (`play-services-ads`).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-2 text-slate-300">
                <span className="text-slate-500">// 1. build.gradle.kts dependency</span>
                <div className="text-rose-400">implementation(&quot;com.google.android.gms:play-services-ads:23.0.0&quot;)</div>
                
                <span className="text-slate-500 block pt-2">// 2. AndroidManifest.xml</span>
                <div className="text-emerald-400">
                  &lt;meta-data<br/>
                  &nbsp;&nbsp;android:name=&quot;com.google.android.gms.ads.APPLICATION_ID&quot;<br/>
                  &nbsp;&nbsp;android:value=&quot;ca-app-pub-3940256099942544~3347511713&quot; /&gt;
                </div>

                <span className="text-slate-500 block pt-2">// 3. Jetpack Compose Banner Ad View</span>
                <div className="text-sky-300">
                  AndroidView(factory = &#123; context -&gt;<br/>
                  &nbsp;&nbsp;AdView(context).apply &#123;<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;setAdSize(AdSize.BANNER)<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;adUnitId = &quot;ca-app-pub-3940256099942544/6300978111&quot;<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;loadAd(AdRequest.Builder().build())<br/>
                  &nbsp;&nbsp;&#125;<br/>
                  &#125;)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
