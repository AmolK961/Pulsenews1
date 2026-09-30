import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ExternalLink, 
  Tag, 
  Flame, 
  Clock, 
  Star, 
  SlidersHorizontal, 
  Check, 
  Sparkles,
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Settings,
  X
} from 'lucide-react';
import { AFFILIATE_DEALS, buildAffiliateUrl, getStoredAffiliateConfig, saveStoredAffiliateConfig } from '../data/affiliateDealsData';
import { AffiliateDeal, AffiliatePlatform, DealCategory, AffiliateConfig } from '../types/affiliate';

interface AffiliateDealsHubProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const AffiliateDealsHub: React.FC<AffiliateDealsHubProps> = ({ onClose, isModal = false }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | AffiliatePlatform>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | DealCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [affConfig, setAffConfig] = useState<AffiliateConfig>(getStoredAffiliateConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filteredDeals = AFFILIATE_DEALS.filter((deal) => {
    if (selectedPlatform !== 'all' && deal.platform !== selectedPlatform) return false;
    if (selectedCategory !== 'all' && deal.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return deal.title.toLowerCase().includes(q) || deal.tagline.toLowerCase().includes(q);
    }
    return true;
  });

  const dealOfTheDay = AFFILIATE_DEALS.find((d) => d.isDealOfTheDay) || AFFILIATE_DEALS[0];

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredAffiliateConfig(affConfig);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setConfigModalOpen(false);
    }, 1200);
  };

  const content = (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Live Affiliate Deals Hub
              </span>
              <span className="text-xs text-slate-400">
                Amazon &amp; Flipkart Curated
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Exclusive High-Discount Tech &amp; Gadget Offers
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hand-picked daily discounts on MacBooks, flagship phones, studio headphones, and developer setups. Every click supports PulseNews!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setConfigModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
              title="Customize your Amazon & Flipkart Affiliate IDs"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Affiliate Settings</span>
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Deal of the Day Hero Card */}
      {dealOfTheDay && (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-amber-500/30 p-4 sm:p-6 backdrop-blur-sm">
          <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-[11px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deal of the Day — Up to {dealOfTheDay.discountPercentage}% OFF</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-3 sm:pt-0">
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-800">
              <img
                src={dealOfTheDay.imageUrl}
                alt={dealOfTheDay.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs font-bold text-amber-400">
                {dealOfTheDay.platform === 'amazon' ? 'Amazon Exclusive' : 'Flipkart Special'}
              </div>
            </div>

            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold ml-1 text-slate-200">{dealOfTheDay.rating}</span>
                </div>
                <span>•</span>
                <span>{dealOfTheDay.reviewCount.toLocaleString()} verified ratings</span>
                {dealOfTheDay.endsInHours && (
                  <>
                    <span>•</span>
                    <span className="text-rose-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> Ends in {dealOfTheDay.endsInHours}h
                    </span>
                  </>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {dealOfTheDay.title}
              </h3>

              <p className="text-xs text-slate-400">
                {dealOfTheDay.tagline}
              </p>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-black text-emerald-400">
                  {dealOfTheDay.currency}{dealOfTheDay.discountedPrice.toLocaleString()}
                </span>
                <span className="text-sm text-slate-500 line-through">
                  {dealOfTheDay.currency}{dealOfTheDay.originalPrice.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                  {dealOfTheDay.discountPercentage}% OFF
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={buildAffiliateUrl(dealOfTheDay.affiliateUrl, dealOfTheDay.platform, affConfig)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg cursor-pointer ${
                    dealOfTheDay.platform === 'amazon'
                      ? 'bg-[#FF9900] hover:bg-[#e88b00] text-slate-950 shadow-amber-900/30'
                      : 'bg-[#2874F0] hover:bg-[#1a5ec4] text-white shadow-blue-900/30'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buy on {dealOfTheDay.platform === 'amazon' ? 'Amazon' : 'Flipkart'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[11px] text-slate-500">
                  Verified price &amp; affiliate commission tracked
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        {/* Platform tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              selectedPlatform === 'all'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            All Stores
          </button>
          <button
            onClick={() => setSelectedPlatform('amazon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedPlatform === 'amazon'
                ? 'bg-[#FF9900] text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <span>Amazon India</span>
          </button>
          <button
            onClick={() => setSelectedPlatform('flipkart')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedPlatform === 'flipkart'
                ? 'bg-[#2874F0] text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <span>Flipkart Offers</span>
          </button>
        </div>

        {/* Category icons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Tech' },
            { id: 'laptops', label: 'Laptops' },
            { id: 'smartphones', label: 'Phones' },
            { id: 'audio', label: 'Audio' },
            { id: 'workstation', label: 'Setup' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDeals.map((deal) => {
          const buyUrl = buildAffiliateUrl(deal.affiliateUrl, deal.platform, affConfig);
          return (
            <div
              key={deal.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 transition duration-300 hover:shadow-xl hover:shadow-black/50"
            >
              <div className="space-y-3">
                {/* Image & Discount Badge */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                    {deal.discountPercentage}% OFF
                  </div>
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    deal.platform === 'amazon' ? 'bg-[#FF9900] text-slate-950' : 'bg-[#2874F0] text-white'
                  }`}>
                    {deal.platform === 'amazon' ? 'Amazon' : 'Flipkart'}
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 mb-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-bold">{deal.rating}</span>
                    <span className="text-slate-500">({deal.reviewCount.toLocaleString()})</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition line-clamp-2 leading-relaxed">
                    {deal.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                    {deal.tagline}
                  </p>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-black text-emerald-400 block">
                      {deal.currency}{deal.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500 line-through">
                      {deal.currency}{deal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                    Save {deal.currency}{(deal.originalPrice - deal.discountedPrice).toLocaleString()}
                  </span>
                </div>

                <a
                  href={buyUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md ${
                    deal.platform === 'amazon'
                      ? 'bg-[#FF9900] hover:bg-[#e88b00] text-slate-950'
                      : 'bg-[#2874F0] hover:bg-[#1a5ec4] text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Grab Deal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Affiliate ID Configuration Modal */}
      {configModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Affiliate Accounts Configuration
                </h3>
              </div>
              <button
                onClick={() => setConfigModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your official affiliate tracking IDs. Every deal button across PulseNews will automatically append your tracking tags so purchases generate commissions directly to your bank account.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Amazon Associates Tracking ID / Tag
                </label>
                <input
                  type="text"
                  value={affConfig.amazonTag}
                  onChange={(e) => setAffConfig({ ...affConfig, amazonTag: e.target.value })}
                  placeholder="e.g. pulsenews-21 or yourtag-21"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 block">
                  Found on your Amazon Associates dashboard (ends in -21 for India or -20 for US).
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Flipkart Affiliate ID (affid)
                </label>
                <input
                  type="text"
                  value={affConfig.flipkartAffId}
                  onChange={(e) => setAffConfig({ ...affConfig, flipkartAffId: e.target.value })}
                  placeholder="e.g. pulsenews_aff"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono outline-none focus:border-blue-400"
                />
                <span className="text-[10px] text-slate-500 block">
                  Found in your Flipkart Affiliate dashboard or aggregator like Cuelinks/EarnKaro.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {saveSuccess ? <Check className="w-4 h-4" /> : null}
                  <span>{saveSuccess ? 'Saved!' : 'Save Affiliate IDs'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="w-full max-w-6xl my-auto bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div id="affiliate-deals-section" className="my-8">
      {content}
    </div>
  );
};
