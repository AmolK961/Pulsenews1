import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface GoogleAdBannerProps {
  slot?: string;
  format?: 'horizontal' | 'in-feed' | 'rectangle' | 'mobile-banner';
  responsive?: boolean;
  className?: string;
  label?: string;
  onBannerClick?: () => void;
}

export const GoogleAdBanner: React.FC<GoogleAdBannerProps> = ({
  slot = '1029384756',
  format = 'horizontal',
  responsive = true,
  className = '',
  label = 'Sponsored',
  onBannerClick
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const [realAdFilled, setRealAdFilled] = useState(false);

  // Retrieve client ID from localStorage or environment for real AdSense script
  const savedClientId = typeof window !== 'undefined' ? localStorage.getItem('pulsenews_adsense_client') : null;
  const clientId = savedClientId || import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-8153839325985487';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch {
      // Ad blocker or development preview
    }

    const insNode = adRef.current;
    if (!insNode) return;

    // Check if Google AdSense successfully rendered a real ad
    const checkRealAd = () => {
      if (!insNode) return;
      const status = insNode.getAttribute('data-ad-status');
      const hasIframe = insNode.querySelector('iframe') !== null;
      if (status === 'filled' || hasIframe) {
        setRealAdFilled(true);
      }
    };

    // Watch for DOM changes inside the <ins> tag when Google loads the ad
    const observer = new MutationObserver(() => {
      checkRealAd();
    });

    observer.observe(insNode, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['data-ad-status']
    });

    const interval = setInterval(checkRealAd, 1200);
    const timeout = setTimeout(() => clearInterval(interval), 8000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [slot, clientId]);

  // Different format dimensions
  const getFormatClasses = () => {
    switch (format) {
      case 'horizontal':
        return 'w-full min-h-[90px] max-w-5xl mx-auto';
      case 'in-feed':
        return 'w-full min-h-[220px] max-w-lg mx-auto';
      case 'rectangle':
        return 'w-full min-h-[220px] max-w-[360px] mx-auto';
      case 'mobile-banner':
        return 'w-full min-h-[60px] max-w-sm mx-auto';
      default:
        return 'w-full min-h-[90px]';
    }
  };

  const handleFallbackClick = () => {
    if (onBannerClick) {
      onBannerClick();
    } else {
      // Smoothly navigate or open magazines
      const magazineSection = document.getElementById('technical-magazines-section');
      if (magazineSection) {
        magazineSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={`my-4 sm:my-6 overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800/80 p-2 sm:p-2.5 transition-all ${className}`}>
      {/* Discreet Ad Tag without exposing raw publisher IDs or account details */}
      <div className="flex items-center justify-between px-2 pb-1.5 text-[9px] uppercase font-bold tracking-widest text-slate-500 border-b border-slate-800/40 mb-2">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
          {label}
        </span>
        <span className="text-[9px] text-slate-500 font-medium">
          Verified Partner
        </span>
      </div>

      <div className={`relative flex items-center justify-center ${getFormatClasses()}`}>
        {/* Real Google AdSense <ins> Element */}
        <ins
          ref={adRef}
          className={`adsbygoogle block w-full h-full text-center ${realAdFilled ? 'visible' : 'hidden'}`}
          style={{ display: realAdFilled ? 'block' : 'none' }}
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format={responsive ? 'auto' : undefined}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />

        {/* Polished Visual Creative Banner (Shown until Google Ad renders, zero account details exposed) */}
        {!realAdFilled && (
          <div
            onClick={handleFallbackClick}
            className="w-full h-full group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 transition cursor-pointer"
          >
            {format === 'horizontal' && (
              <div className="relative flex flex-col sm:flex-row items-center justify-between p-3.5 sm:p-4 gap-3 overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/40 min-h-[90px]">
                {/* Background artistic image with subtle overlay */}
                <div 
                  className="absolute inset-0 opacity-15 group-hover:opacity-25 transition duration-500 bg-cover bg-center pointer-events-none"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80')` }}
                />

                <div className="relative z-10 flex items-center gap-3 sm:gap-4 text-left">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-900/30">
                    <Sparkles className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        Editorial Showcase
                      </span>
                      <span className="text-[11px] text-slate-400 hidden md:inline">
                        PulseNews Technical Editions
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-1 mt-0.5">
                      Explore Technical Magazines — Architecture, Biotech, AI &amp; Macro Markets
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 hidden sm:block">
                      Free in-depth digital journals with curated stories and verified reporting.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 group-hover:bg-rose-600 text-slate-200 group-hover:text-white text-xs font-semibold border border-slate-700/80 group-hover:border-rose-500 transition shadow-sm">
                    <span>Read Free</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            )}

            {format === 'in-feed' && (
              <div className="relative flex flex-col p-4 gap-3 bg-gradient-to-b from-slate-900 to-slate-950 min-h-[220px]">
                {/* Hero Image for In-Feed Creative */}
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-800/80">
                  <img
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
                    alt="PulseNews Technology Insights"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-slate-800">
                    Partner Spotlight
                  </div>
                </div>

                <div className="text-left space-y-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition line-clamp-1">
                    Content Ninja: Cloud Engineering &amp; AI Architectures
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    In-depth video tutorials, technical design breakdowns, and developer strategies for production teams.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-rose-400 font-semibold">
                    <span>Watch Tutorial Series</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}

            {format === 'rectangle' && (
              <div className="relative flex flex-col p-4 gap-3 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-[220px]">
                <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
                    alt="PulseNews Global Edition"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="text-left space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Digital Digest
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition">
                    PulseNews Global Journal
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    Get 30 daily, 60 weekly, or 200 monthly verified stories delivered straight to your inbox.
                  </p>
                </div>
              </div>
            )}

            {format === 'mobile-banner' && (
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-950 to-slate-900 min-h-[55px]">
                <div className="flex items-center gap-2 text-left">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white line-clamp-1">PulseNews Digital Journals</span>
                    <span className="text-[10px] text-slate-400">Free technical releases</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
