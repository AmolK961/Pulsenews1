import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  User, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  Calendar, 
  BookOpen, 
  ShieldCheck, 
  Stethoscope,
  Laptop,
  Trophy,
  DollarSign,
  Youtube,
  Atom,
  Globe,
  ExternalLink,
  Award
} from 'lucide-react';
import { MagazinePeriod } from '../types/magazine';

interface MagazineSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCategory?: string;
  preselectedPeriod?: MagazinePeriod;
  onOpenMagazineHub?: (category?: string) => void;
}

export const MagazineSubscribeModal: React.FC<MagazineSubscribeModalProps> = ({
  isOpen,
  onClose,
  preselectedCategory,
  preselectedPeriod,
  onOpenMagazineHub
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('Business Executive / Founder');
  
  // Frequency: Daily (30 news), Weekly (Top 60 news), Monthly (200 news)
  const [frequency, setFrequency] = useState<MagazinePeriod>(preselectedPeriod || 'weekly');
  
  // Categories: Business, Technology, Health, Sports, Science, General
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    preselectedCategory && preselectedCategory !== 'all' 
      ? [preselectedCategory] 
      : ['business', 'technology']
  );

  // Content Ninja YouTube Channel subscription state
  const [youtubeSubscribed, setYoutubeSubscribed] = useState<boolean>(true);
  const [youtubeVisited, setYoutubeVisited] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    subscriber: any;
    stats: any;
  } | null>(null);

  if (!isOpen) return null;

  const CATEGORY_OPTIONS = [
    {
      id: 'business',
      label: 'Business & Finance',
      audience: 'For Business Men & Founders',
      icon: DollarSign,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      activeColor: 'bg-amber-500/20 border-amber-500 text-amber-300'
    },
    {
      id: 'technology',
      label: 'Technology & Systems',
      audience: 'For Tech Persons & Engineers',
      icon: Laptop,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      activeColor: 'bg-sky-500/20 border-sky-500 text-sky-300'
    },
    {
      id: 'health',
      label: 'Clinical Medicine & Health',
      audience: 'For Doctors & Clinicians',
      icon: Stethoscope,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      activeColor: 'bg-rose-500/20 border-rose-500 text-rose-300'
    },
    {
      id: 'sports',
      label: 'Sports Science & Athletics',
      audience: 'For Athletes & Sports Persons',
      icon: Trophy,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      activeColor: 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
    },
    {
      id: 'science',
      label: 'Frontier Science & Physics',
      audience: 'For Researchers & Innovators',
      icon: Atom,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      activeColor: 'bg-purple-500/20 border-purple-500 text-purple-300'
    },
    {
      id: 'general',
      label: 'Global Macro & World',
      audience: 'For Leaders & Policymakers',
      icon: Globe,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      activeColor: 'bg-blue-500/20 border-blue-500 text-blue-300'
    }
  ];

  const FREQUENCY_OPTIONS: { id: MagazinePeriod; label: string; countBadge: string; description: string }[] = [
    {
      id: 'daily',
      label: 'Daily Edition',
      countBadge: '30 News / Day',
      description: 'Morning executive briefing with exactly 30 high-priority verified news stories, key takeaways, and daily metrics.'
    },
    {
      id: 'weekly',
      label: 'Weekly Edition',
      countBadge: 'Top 60 News / Week',
      description: 'The weekly flagship edition featuring the top 60 rated news stories, full editorial analysis, and trend forecasting.'
    },
    {
      id: 'monthly',
      label: 'Monthly Compendium',
      countBadge: '200 News / Month',
      description: 'Comprehensive 200-news master journal with complete table of contents, in-depth research, and macro retrospectives.'
    }
  ];

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(c => c !== catId);
      }
      return [...prev, catId];
    });
  };

  const handleOpenYoutubeChannel = () => {
    setYoutubeVisited(true);
    setYoutubeSubscribed(true);
    window.open('https://www.youtube.com', '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one magazine category.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/magazine/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          profession,
          categories: selectedCategories,
          frequency,
          format: 'digital',
          youtubeSubscribed
        })
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to complete subscription');
      }

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message || 'Subscription failed. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-amber-500/20 to-sky-500/20 text-white border border-rose-500/30">
              <Mail className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Subscribe to Technical Magazines</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Daily &bull; Weekly &bull; Monthly
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Receive peer-reviewed editions tailored to your field &amp; join Content Ninja
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
          {successData ? (
            /* Success Confirmation Screen */
            <div className="text-center py-6 px-4 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Subscription Confirmed!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                  {successData.message}
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left max-w-md mx-auto space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Subscriber Name:</span>
                  <span className="text-white font-bold">{successData.subscriber?.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white font-mono">{successData.subscriber?.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Publication Cadence:</span>
                  <span className="text-amber-400 font-bold uppercase tracking-wider">
                    {frequency === 'daily' ? 'Daily (30 News)' : frequency === 'weekly' ? 'Weekly (Top 60)' : 'Monthly (200 News)'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Selected Topics:</span>
                  <span className="text-slate-200 capitalize">
                    {selectedCategories.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Content Ninja YouTube:</span>
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>VIP Channel Member</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onOpenMagazineHub && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMagazineHub(selectedCategories[0]);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950/40 transition cursor-pointer"
                  >
                    Read Today's Issue Now
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Subscription Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* YouTube Channel Promotion Box: Content Ninja */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/30 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-md shadow-red-950/60">
                      <Youtube className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          Subscribe to YouTube: Content Ninja
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Get our weekly video deep-dives, technical architecture tutorials, and breakdown podcasts.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenYoutubeChannel}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-950/50 cursor-pointer"
                  >
                    <span>Visit Channel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <label className="flex items-center gap-2.5 pt-2 border-t border-slate-800/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={youtubeSubscribed}
                    onChange={(e) => setYoutubeSubscribed(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-700 cursor-pointer"
                  />
                  <span className="text-xs text-slate-200 font-medium">
                    Yes! I want to subscribe to <strong className="text-red-400">Content Ninja</strong> on YouTube for bonus masterclasses
                  </span>
                </label>
              </div>

              {/* 1. Name & Email Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-400" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Sterling"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Work Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. elena@enterprise.com"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* 2. Frequency Selection: Daily, Weekly, Monthly */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>Publication Frequency &bull; Delivery Cadence *</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Select one option</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FREQUENCY_OPTIONS.map((freq) => {
                    const isSelected = frequency === freq.id;
                    return (
                      <div
                        key={freq.id}
                        onClick={() => setFrequency(freq.id)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer select-none flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-950/30'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-white">
                              {freq.label}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {freq.countBadge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            {freq.description}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-end">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Category Selection: Business, Tech, Health, Sports, Science, General */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                    <span>Select Magazine Categories (Multi-Select) *</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {selectedCategories.length} selected
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    const IconComp = cat.icon;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer select-none ${
                          isSelected
                            ? cat.activeColor + ' shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComp className="w-4 h-4 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">
                              {cat.label}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {cat.audience}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {loading ? 'Activating Subscription...' : 'Subscribe to Magazines & Join Content Ninja'}
                  </span>
                </button>
                <p className="text-center text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Free &bull; No spam &bull; One-click unsubscribe at any time</span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
