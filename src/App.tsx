import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Article, CategoriesOverview, BookmarkArticle } from './types/news';
import { CATEGORIES } from './utils/categories';
import { getBookmarks } from './utils/storage';
import { Navbar } from './components/Navbar';
import { MarketBar } from './components/MarketBar';
import { NewsTicker } from './components/NewsTicker';
import { CategorySection } from './components/CategorySection';
import { ArticleCard } from './components/ArticleCard';
import { NewsReaderModal } from './components/NewsReaderModal';
import { BookmarksModal } from './components/BookmarksModal';
import { AndroidFrame } from './components/AndroidFrame';
import { AndroidAppSettings } from './components/AndroidAppSettings';
import { AudioBriefingBar } from './components/AudioBriefingBar';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Pagination } from './components/Pagination';
import { GoogleAdBanner } from './components/GoogleAdBanner';
import { AdSenseModal } from './components/AdSenseModal';
import { DownloadLaptopModal } from './components/DownloadLaptopModal';
import { MagazineHubModal } from './components/MagazineHubModal';
import { MagazineSubscribeModal } from './components/MagazineSubscribeModal';
import { MagazineBanner } from './components/MagazineBanner';
import { DeveloperProfileSection } from './components/DeveloperProfileSection';
import { DeveloperProfileModal } from './components/DeveloperProfileModal';
import { BulkEmailModal } from './components/BulkEmailModal';
import { AffiliateDealsHub } from './components/AffiliateDealsHub';
import { NewsSyncBadge } from './components/NewsSyncBadge';
import { TodaysNewsSection } from './components/TodaysNewsSection';
import { AutomationScheduleModal } from './components/AutomationScheduleModal';
import { useNewsSync } from './hooks/useNewsSync';
import { MagazinePeriod } from './types/magazine';
import { 
  Flame, 
  RefreshCw, 
  ArrowLeft,
  Code2,
  Headphones,
  Zap,
  Star,
  BookOpen,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Trophy,
  Film,
  Atom,
  HeartPulse,
  DollarSign,
  Laptop,
  Mail,
  Youtube,
  User,
  Clock,
  X,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('us');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  
  // Data states
  const [categoriesOverview, setCategoriesOverview] = useState<CategoriesOverview | null>(null);
  const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states (Top 10 news per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  // Dedicated Views: Top 10 News On One Page & Fast Monthly JSON Archive
  const [isTop10Overview, setIsTop10Overview] = useState<boolean>(false);
  const [isMonthlyArchive, setIsMonthlyArchive] = useState<boolean>(false);
  const [monthlyMetadata, setMonthlyMetadata] = useState<{
    month: string;
    totalArticles: number;
    lastUpdated: string;
    categoryCounts?: Record<string, number>;
  } | null>(null);

  // App & Android Mode States
  const [isAndroidView, setIsAndroidView] = useState<boolean>(false);
  const [androidNavTab, setAndroidNavTab] = useState<'home' | 'categories' | 'bookmarks' | 'settings'>('home');
  const [bookmarks, setBookmarks] = useState<BookmarkArticle[]>([]);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);

  // Features Modals: Audio Daily Briefing, Android/React Code Center, Google AdSense & Monetization
  const [isAudioBriefingOpen, setIsAudioBriefingOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isAdSenseOpen, setIsAdSenseOpen] = useState<boolean>(false);
  const [isDownloadLaptopOpen, setIsDownloadLaptopOpen] = useState<boolean>(false);
  const [isMagazineHubOpen, setIsMagazineHubOpen] = useState<boolean>(false);
  const [isMagazineSubscribeOpen, setIsMagazineSubscribeOpen] = useState<boolean>(false);
  const [magazineTargetCategory, setMagazineTargetCategory] = useState<string>('all');
  const [magazineTargetPeriod, setMagazineTargetPeriod] = useState<MagazinePeriod>('weekly');
  const [isDeveloperProfileOpen, setIsDeveloperProfileOpen] = useState<boolean>(false);
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState<boolean>(false);
  const [isDealsModalOpen, setIsDealsModalOpen] = useState<boolean>(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState<boolean>(false);
  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // 5-Hour Inbuilt Background News Sync Hook (Latest News First)
  const { syncStatus, isSyncing, triggerSync } = useNewsSync(
    useCallback((freshArticles: Article[]) => {
      if (freshArticles && freshArticles.length > 0) {
        setCategoryArticles(freshArticles);
        setSyncToastMessage(`Background 5-hour sync completed: Updated ${freshArticles.length} stories with latest news first!`);
        setTimeout(() => setSyncToastMessage(null), 6000);
      }
    }, [])
  );

  // Calculate Today's Articles (published within the last 24 hours)
  const todayArticles = React.useMemo(() => {
    const now = Date.now();
    return categoryArticles.filter(a => {
      if (!a.publishedAt) return false;
      const pub = new Date(a.publishedAt).getTime();
      return !isNaN(pub) && (now - pub) <= 24 * 60 * 60 * 1000;
    });
  }, [categoryArticles]);

  // Sync bookmarks
  const refreshBookmarks = useCallback(() => {
    setBookmarks(getBookmarks());
  }, []);

  useEffect(() => {
    refreshBookmarks();
  }, [refreshBookmarks]);

  // Fetch Monthly JSON Store Metadata
  const loadMonthlyMetadata = useCallback(async () => {
    try {
      const res = await fetch('/api/news/monthly-store');
      const data = await res.json();
      if (data.status === 'ok') {
        setMonthlyMetadata(data);
      }
    } catch (e) {
      console.warn('Could not load monthly store metadata:', e);
    }
  }, []);

  useEffect(() => {
    loadMonthlyMetadata();
  }, [loadMonthlyMetadata]);

  // Fetch overview of all categories (Home page: latest news first)
  const loadCategoriesOverview = useCallback(async (country: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/categories-overview?country=${country}&limit=10`);
      const data = await res.json();
      if (data.status === 'ok' && data.categories) {
        // Ensure latest news is first
        const sortedCats: Record<string, Article[]> = {};
        Object.keys(data.categories).forEach(k => {
          sortedCats[k] = [...data.categories[k]].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        });
        setCategoriesOverview(sortedCats as unknown as CategoriesOverview);
      } else {
        throw new Error(data.message || 'Failed to load categories');
      }
    } catch (err: any) {
      console.error('Error fetching categories overview:', err);
      setError('Notice: Running in high-speed local news mode.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specific category stories with Top 10 pagination (latest news first)
  const loadCategoryArticles = useCallback(async (
    category: string, 
    country: string, 
    page: number = 1,
    fromMonthlyJson: boolean = false
  ) => {
    if (category === 'all') return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = fromMonthlyJson
        ? `/api/news/monthly-store?category=${category}&page=${page}&pageSize=10`
        : `/api/news/headlines?category=${category}&country=${country}&page=${page}&pageSize=10`;

      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.articles)) {
        // Sort latest news first
        const sorted = [...data.articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setCategoryArticles(sorted);
        setCurrentPage(data.page || page);
        setTotalPages(data.totalPages || Math.ceil((data.totalResults || sorted.length) / 10) || 1);
        setTotalResults(data.totalResults || sorted.length);
      } else {
        throw new Error(data.message || 'Failed to load category news');
      }
    } catch (err: any) {
      console.error('Error fetching category headlines:', err);
      // Graceful fallback from categoriesOverview if available
      if (categoriesOverview && categoriesOverview[category as keyof CategoriesOverview]) {
        const fullList = [...categoriesOverview[category as keyof CategoriesOverview]].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        const start = (page - 1) * 10;
        const paginated = fullList.slice(start, start + 10);
        setCategoryArticles(paginated);
        setTotalResults(fullList.length);
        setTotalPages(Math.ceil(fullList.length / 10) || 1);
        setCurrentPage(page);
      }
    } finally {
      setLoading(false);
    }
  }, [categoriesOverview]);

  // Page change handler for Top 10 pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (selectedCategory !== 'all') {
      loadCategoryArticles(selectedCategory, selectedCountry, newPage, isMonthlyArchive);
    }
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }
    setLoading(true);
    setIsSearching(true);
    setIsTop10Overview(false);
    try {
      const res = await fetch(`/api/news/search?q=${encodeURIComponent(searchQuery)}&pageSize=20`);
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.articles)) {
        const sorted = [...data.articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setSearchResults(sorted);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCategoriesOverview(selectedCountry);
  }, [selectedCountry, loadCategoriesOverview]);

  // Category switch
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setIsSearching(false);
      setIsTop10Overview(false);
      setCurrentPage(1);
      loadCategoryArticles(selectedCategory, selectedCountry, 1, isMonthlyArchive);
    }
  }, [selectedCategory, selectedCountry, isMonthlyArchive, loadCategoryArticles]);

  // Featured top story from General or first available
  const featuredArticle = categoriesOverview?.general?.[0] || 
    categoriesOverview?.technology?.[0] || 
    categoryArticles?.[0];

  // All breaking news for ticker and audio briefing playlist
  const tickerArticles = useMemo(() => {
    if (!categoriesOverview) return [];
    const pool: Article[] = [];
    Object.values(categoriesOverview).forEach(list => {
      if (list && list[0]) pool.push(list[0]);
    });
    return pool;
  }, [categoriesOverview]);

  // Active articles list for Next/Previous story navigation in Reader modal
  const currentArticlesList = useMemo(() => {
    if (isSearching) return searchResults;
    if (selectedCategory !== 'all') return categoryArticles;
    return tickerArticles;
  }, [isSearching, searchResults, selectedCategory, categoryArticles, tickerArticles]);

  const activeIndex = activeArticle ? currentArticlesList.findIndex(a => a.url === activeArticle.url) : -1;
  const hasNext = activeIndex >= 0 && activeIndex < currentArticlesList.length - 1;
  const hasPrevious = activeIndex > 0;

  const handleNextArticle = () => {
    if (hasNext) setActiveArticle(currentArticlesList[activeIndex + 1]);
  };

  const handlePreviousArticle = () => {
    if (hasPrevious) setActiveArticle(currentArticlesList[activeIndex - 1]);
  };

  // Clear cache handler
  const handleClearCache = () => {
    localStorage.clear();
    setBookmarks([]);
    loadCategoriesOverview(selectedCountry);
  };

  // Helper to get category icon
  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'general': return <Flame className="w-4 h-4 text-rose-500" />;
      case 'technology': return <Cpu className="w-4 h-4 text-sky-400" />;
      case 'business': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'sports': return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'entertainment': return <Film className="w-4 h-4 text-purple-400" />;
      case 'science': return <Atom className="w-4 h-4 text-indigo-400" />;
      case 'health': return <HeartPulse className="w-4 h-4 text-teal-400" />;
      default: return <Flame className="w-4 h-4 text-rose-500" />;
    }
  };

  // Render Inner Content (shared between Web View and Android Frame)
  const renderMainContent = () => {
    if (loading && !categoriesOverview && categoryArticles.length === 0) {
      return (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Fetching latest live breaking news...</p>
          <p className="text-xs text-slate-500">Aggregating global headlines across all categories</p>
        </div>
      );
    }

    // Android Tab: Saved Articles
    if (isAndroidView && androidNavTab === 'bookmarks') {
      return (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Saved Stories ({bookmarks.length})</h2>
            {bookmarks.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem('pulsenews_bookmarks_v1');
                  setBookmarks([]);
                }}
                className="text-xs text-rose-400 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              No saved stories. Tap the bookmark icon on any article to read it later offline.
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((article, idx) => (
                <ArticleCard
                  key={`${article.url}-${idx}`}
                  article={article}
                  onSelect={setActiveArticle}
                  onBookmarkToggle={refreshBookmarks}
                  variant="compact"
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Android Tab: Categories Grid
    if (isAndroidView && androidNavTab === 'categories') {
      return (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Explore Categories</h2>
            <button
              onClick={() => {
                setIsTop10Overview(true);
                setSelectedCategory('all');
                setAndroidNavTab('home');
              }}
              className="text-xs text-amber-400 font-semibold flex items-center gap-1"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Top 10 View</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setAndroidNavTab('home');
                }}
                className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-left text-white shadow-md active:scale-95 transition`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm">{cat.name}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-bold">Top 10</span>
                </div>
                <p className="text-[10px] text-white/80 line-clamp-2 mt-1">{cat.description}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Android Tab: App Settings
    if (isAndroidView && androidNavTab === 'settings') {
      return (
        <AndroidAppSettings
          onClearStorage={handleClearCache}
          bookmarkCount={bookmarks.length}
          onOpenAudioBriefing={() => setIsAudioBriefingOpen(true)}
          onOpenDeveloperProfile={() => setIsDeveloperProfileOpen(true)}
        />
      );
    }

    // Search Results View
    if (isSearching) {
      return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-white">
                Search Results for &quot;{searchQuery}&quot;
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-600/20 text-rose-400 font-semibold">
                {searchResults.length} articles
              </span>
            </div>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-base font-semibold">No articles found matching &quot;{searchQuery}&quot;</p>
              <p className="text-xs text-slate-500 mt-1">Try another keyword or browse categories below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResults.map((article, idx) => (
                <ArticleCard
                  key={`${article.url}-${idx}`}
                  article={article}
                  onSelect={setActiveArticle}
                  onBookmarkToggle={refreshBookmarks}
                  variant="standard"
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // 1. DEDICATED VIEW: "TOP 10 NEWS ON ONE PAGE" ACROSS ALL CATEGORIES
    if (isTop10Overview) {
      return (
        <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border border-amber-500/30 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Special Unified View
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    70 Curated Top Stories
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Categories Top 10 News &bull; All on One Page
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl">
                  Showing the top 10 ranked news stories for each of the 7 global categories simultaneously. Ranked #1 through #10 with instant in-page reading.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsTop10Overview(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Standard Home</span>
                </button>
              </div>
            </div>

            {/* Quick Category Anchor Bar */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Jump to:</span>
              {CATEGORIES.map(cat => (
                <a
                  key={cat.id}
                  href={`#top10-${cat.id}`}
                  className="shrink-0 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-slate-700/60"
                >
                  {getCategoryIcon(cat.id)}
                  <span>{cat.name} (10)</span>
                </a>
              ))}
            </div>
          </div>

          {/* All 7 Categories Top 10 News Blocks */}
          <div className="space-y-12">
            {CATEGORIES.map(category => {
              const list = (categoriesOverview ? categoriesOverview[category.id] : []) || [];
              const top10List = list.slice(0, 10);

              return (
                <section
                  key={category.id}
                  id={`top10-${category.id}`}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
                        {getCategoryIcon(category.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white tracking-tight">{category.name}</h2>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30">
                            Top 10 Ranked
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{category.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsTop10Overview(false);
                        setSelectedCategory(category.id);
                      }}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition px-3 py-1.5 rounded-xl hover:bg-slate-800 border border-slate-800"
                    >
                      Open Paginated View &rarr;
                    </button>
                  </div>

                  {/* 10 Articles Grid with Rank Badges #1 to #10 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
                    {top10List.map((article, idx) => (
                      <ArticleCard
                        key={`${article.url}-top10-${idx}`}
                        article={article}
                        onSelect={setActiveArticle}
                        onBookmarkToggle={refreshBookmarks}
                        variant="compact"
                        rankNumber={idx + 1}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      );
    }

    // 2. SPECIFIC CATEGORY SELECTED VIEW WITH TOP 10 PAGINATION
    if (selectedCategory !== 'all') {
      const currentCatInfo = CATEGORIES.find(c => c.id === selectedCategory);
      return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Categories</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    {getCategoryIcon(selectedCategory)}
                    <span>{currentCatInfo?.name}</span>
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-600/20 text-rose-400 font-semibold border border-rose-500/30">
                    Page {currentPage} of {totalPages}
                  </span>
                  {isMonthlyArchive && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Curated Edition
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentCatInfo?.description} &bull; Top 10 stories per page &bull; Latest news first
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Monthly Fast Store */}
              <button
                onClick={() => {
                  const nextState = !isMonthlyArchive;
                  setIsMonthlyArchive(nextState);
                  loadCategoryArticles(selectedCategory, selectedCountry, 1, nextState);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 cursor-pointer ${
                  isMonthlyArchive
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle verified curated edition of stories"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isMonthlyArchive ? 'Curated Edition' : 'Instant Feed'}</span>
              </button>

              <button
                onClick={() => loadCategoryArticles(selectedCategory, selectedCountry, currentPage, isMonthlyArchive)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Refresh Category"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Top Pagination Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Showing <strong>10 stories</strong> for Page {currentPage} &bull; Total {totalResults} articles available</span>
            </span>
            <span className="text-slate-500">10 articles per page</span>
          </div>

          {/* Leading Top Headline for this page */}
          {categoryArticles[0] && (
            <ArticleCard
              article={categoryArticles[0]}
              onSelect={setActiveArticle}
              onBookmarkToggle={refreshBookmarks}
              variant="featured"
              categoryLabel={currentCatInfo?.name}
              rankNumber={(currentPage - 1) * 10 + 1}
            />
          )}

          {/* Grid of the remaining 9 articles on this page (each with Rank #2 to #10) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoryArticles.slice(1).map((article, idx) => (
              <ArticleCard
                key={`${article.url}-${idx}`}
                article={article}
                onSelect={setActiveArticle}
                onBookmarkToggle={refreshBookmarks}
                variant="standard"
                categoryLabel={currentCatInfo?.name}
                rankNumber={(currentPage - 1) * 10 + idx + 2}
              />
            ))}
          </div>

          {/* Interactive Pagination Controls (Prev, Page 1, 2, 3..., Next) */}
          <div className="pt-4 space-y-4">
            {/* Category Page Google AdSense Placement */}
            <GoogleAdBanner format="horizontal" slot="1029384756" label="Sponsored Stories" />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              pageSize={10}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      );
    }

    // 3. HOME PAGE: "in home we will show all category minimum news"
    return (
      <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Curated News Edition Banner */}
        <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Curated Edition Active</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  {monthlyMetadata?.month || 'September 2026'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {monthlyMetadata?.totalArticles || '126+'} Verified Stories
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-300 border border-rose-500/30 font-semibold">
                  Latest News First
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant access to comprehensive coverage and verified reports across all categories with Top 10 pagination.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => setIsTop10Overview(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white text-xs font-semibold shadow-md hover:scale-102 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Top 10 News on One Page</span>
            </button>
          </div>
        </section>

        {/* Top Hero Featured Article */}
        {featuredArticle && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                Top Headline of the Hour
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAudioBriefingOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Listen Briefing</span>
                </button>
                <span className="text-xs text-slate-400">
                  Country: <strong className="text-slate-200 uppercase">{selectedCountry}</strong>
                </span>
              </div>
            </div>
            <ArticleCard
              article={featuredArticle}
              onSelect={setActiveArticle}
              onBookmarkToggle={refreshBookmarks}
              variant="featured"
              categoryLabel="Top Story"
              rankNumber={1}
            />
          </section>
        )}

        {/* Dedicated Today's News Section (Multi-Device Responsive Grid & Background 5h Sync) */}
        {todayArticles.length > 0 && (
          <TodaysNewsSection
            articles={todayArticles}
            onSelectArticle={setActiveArticle}
            onBookmarkToggle={refreshBookmarks}
            isSyncing={isSyncing}
            onManualSync={() => triggerSync('manual_user')}
            totalStoreCount={monthlyMetadata?.totalArticles || 240}
          />
        )}

        {/* All Categories Sections (Showing Top 10 Stories per category on Home page) */}
        <div className="space-y-12">
          {CATEGORIES.map((category, idx) => {
            const articlesForCategory = categoriesOverview
              ? categoriesOverview[category.id] || []
              : [];

            return (
              <React.Fragment key={category.id}>
                <CategorySection
                  category={category}
                  articles={articlesForCategory}
                  onSelectArticle={setActiveArticle}
                  onViewAllCategory={(catId) => {
                    setSelectedCategory(catId);
                    setCurrentPage(1);
                  }}
                />
                {/* Google AdSense In-Feed Ad Unit placed after the 2nd category */}
                {idx === 1 && (
                  <div className="my-8">
                    <GoogleAdBanner format="horizontal" slot="5647382910" label="Sponsored Stories" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Offline Toast */}
      <OfflineIndicator />

      {/* Main Navbar with Top 10 News and Fast Month JSON buttons */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setIsTop10Overview(false);
          setIsMonthlyArchive(false);
        }}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        isAndroidView={isAndroidView}
        onToggleAndroidView={() => setIsAndroidView(!isAndroidView)}
        bookmarkCount={bookmarks.length}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenAudioBriefing={() => setIsAudioBriefingOpen(true)}
        onOpenDeveloperProfile={() => setIsDeveloperProfileOpen(true)}
        onOpenMagazineHub={(cat) => {
          setMagazineTargetCategory(cat || 'all');
          setIsMagazineHubOpen(true);
        }}
        onOpenMagazineSubscribe={(cat) => {
          setMagazineTargetCategory(cat || 'all');
          setIsMagazineSubscribeOpen(true);
        }}
        onOpenDeals={() => setIsDealsModalOpen(true)}
        onOpenAutomationSchedule={() => setIsAutomationModalOpen(true)}
        isMonthlyArchive={isMonthlyArchive}
        onToggleMonthlyArchive={() => {
          const next = !isMonthlyArchive;
          setIsMonthlyArchive(next);
          if (selectedCategory !== 'all') {
            loadCategoryArticles(selectedCategory, selectedCountry, 1, next);
          }
        }}
        isTop10Overview={isTop10Overview}
        onToggleTop10Overview={() => {
          setIsTop10Overview(!isTop10Overview);
          setSelectedCategory('all');
        }}
      />

      {/* Real-time Market Indices & Local Weather Bar */}
      <MarketBar countryCode={selectedCountry} />

      {/* Breaking News Marquee Ticker */}
      <NewsTicker
        articles={tickerArticles}
        onSelect={setActiveArticle}
      />

      {/* 5-Hour Inbuilt Background News Sync Status Bar (Latest News First) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-3">
        <NewsSyncBadge
          syncStatus={syncStatus}
          isSyncing={isSyncing}
          onManualSync={() => triggerSync('manual_user')}
          isAndroidView={isAndroidView}
        />
      </div>

      {/* Google AdSense Top Leaderboard Banner */}
      {!isAndroidView && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <GoogleAdBanner format="horizontal" slot="1029384756" label="Sponsored Banner" />
        </div>
      )}

      {/* Categorical Technical Magazines Showcase Banner */}
      {!isAndroidView && !activeArticle && selectedCategory === 'all' && !searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4">
          <MagazineBanner
            onOpenHub={(cat) => {
              setMagazineTargetCategory(cat || 'all');
              setIsMagazineHubOpen(true);
            }}
            onOpenSubscribe={(cat) => {
              setMagazineTargetCategory(cat || 'all');
              setIsMagazineSubscribeOpen(true);
            }}
          />
        </div>
      )}

      {/* Dual Layout: Web View vs Android Simulated Device */}
      <main className="flex-1 pb-16">
        {isAndroidView ? (
          <AndroidFrame
            activeNavTab={androidNavTab}
            onNavTabChange={setAndroidNavTab}
            bookmarkCount={bookmarks.length}
          >
            {renderMainContent()}
          </AndroidFrame>
        ) : (
          <>
            {renderMainContent()}
            {!activeArticle && selectedCategory === 'all' && !searchQuery && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                <AffiliateDealsHub />
              </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <DeveloperProfileSection 
                onOpenModal={() => setIsDeveloperProfileOpen(true)} 
                onOpenBulkEmail={() => setIsBulkEmailOpen(true)}
              />
            </div>
          </>
        )}
      </main>

      {/* News Reader Modal with Full Description, iFrame, AI Brief & Translation */}
      <NewsReaderModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
        onBookmarkChange={refreshBookmarks}
        isAndroidView={isAndroidView}
        onNextArticle={handleNextArticle}
        onPreviousArticle={handlePreviousArticle}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />

      {/* Audio Briefing / Daily Podcast Floating Bar */}
      <AudioBriefingBar
        articles={tickerArticles}
        isOpen={isAudioBriefingOpen}
        onClose={() => setIsAudioBriefingOpen(false)}
        onSelectArticle={setActiveArticle}
      />

      {/* Android & React JS Architecture and Source Code Modal */}
      <AndroidCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Bookmarks Drawer Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onSelectArticle={setActiveArticle}
        onClearAll={() => {
          localStorage.removeItem('pulsenews_bookmarks_v1');
          setBookmarks([]);
        }}
        onBookmarkToggle={refreshBookmarks}
      />

      {/* Google AdSense Configuration & Monetization Modal */}
      <AdSenseModal
        isOpen={isAdSenseOpen}
        onClose={() => setIsAdSenseOpen(false)}
      />

      {/* Download Code to Laptop Modal */}
      <DownloadLaptopModal
        isOpen={isDownloadLaptopOpen}
        onClose={() => setIsDownloadLaptopOpen(false)}
      />

      {/* Categorical Technical Magazines Interactive Hub Modal */}
      <MagazineHubModal
        isOpen={isMagazineHubOpen}
        onClose={() => setIsMagazineHubOpen(false)}
        initialCategory={magazineTargetCategory}
        onOpenSubscribe={(cat, period) => {
          setMagazineTargetCategory(cat || 'all');
          if (period) setMagazineTargetPeriod(period);
          setIsMagazineSubscribeOpen(true);
        }}
      />

      {/* Magazine Subscription Form Modal */}
      <MagazineSubscribeModal
        isOpen={isMagazineSubscribeOpen}
        onClose={() => setIsMagazineSubscribeOpen(false)}
        preselectedCategory={magazineTargetCategory}
        preselectedPeriod={magazineTargetPeriod}
        onOpenMagazineHub={(cat) => {
          setMagazineTargetCategory(cat || 'all');
          setIsMagazineHubOpen(true);
        }}
      />

      {/* Lead Developer Profile & Suggestions Modal */}
      <DeveloperProfileModal
        isOpen={isDeveloperProfileOpen}
        onClose={() => setIsDeveloperProfileOpen(false)}
        onOpenBulkEmail={() => setIsBulkEmailOpen(true)}
      />

      {/* Bulk Email Management & Gmail SMTP Dispatcher Modal */}
      <BulkEmailModal
        isOpen={isBulkEmailOpen}
        onClose={() => setIsBulkEmailOpen(false)}
      />

      {/* Amazon & Flipkart High Discount Affiliate Deals Modal */}
      {isDealsModalOpen && (
        <AffiliateDealsHub
          isModal
          onClose={() => setIsDealsModalOpen(false)}
        />
      )}

      {/* Automated Schedules & 7 AM/PM Magazine Dispatch Modal */}
      <AutomationScheduleModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
      />

      {/* 5-Hour Silent Background Update Floating Toast */}
      {syncToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md bg-slate-900/95 border border-emerald-500/50 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-emerald-300">Background 5-Hour News Sync</p>
            <p className="text-slate-300 mt-0.5">{syncToastMessage}</p>
          </div>
          <button 
            onClick={() => setSyncToastMessage(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer */}
      {!isAndroidView && (
        <footer className="bg-slate-950 border-t border-slate-900 py-10 mt-16 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">PulseNews</span>
              <span>&bull;</span>
              <span>Technical Magazines</span>
              <span>&bull;</span>
              <span>Top 10 News &amp; Pagination</span>
              <span>&bull;</span>
              <span>Lead Developer: Amol Kharat</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button 
                onClick={() => setIsDeveloperProfileOpen(true)}
                className="hover:text-rose-400 transition cursor-pointer flex items-center gap-1 font-semibold text-rose-400"
              >
                <User className="w-3.5 h-3.5" />
                <span>Developer Profile &amp; Suggestions</span>
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => {
                  setMagazineTargetCategory('all');
                  setIsMagazineHubOpen(true);
                }}
                className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1 font-semibold text-amber-400"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Technical Magazines</span>
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => {
                  setMagazineTargetCategory('all');
                  setIsMagazineSubscribeOpen(true);
                }}
                className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1 font-semibold text-emerald-400"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Subscribe (Daily/Weekly/Monthly)</span>
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setIsAudioBriefingOpen(true)}
                className="hover:text-slate-300 transition cursor-pointer flex items-center gap-1"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Audio Podcast</span>
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setIsAutomationModalOpen(true)}
                className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1 font-semibold text-emerald-400"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Automations (7 AM/PM &amp; 5h Sync)</span>
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setIsAndroidView(true)}
                className="hover:text-rose-400 transition cursor-pointer"
              >
                Android App View
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setIsBookmarksOpen(true)}
                className="hover:text-rose-400 transition cursor-pointer"
              >
                Saved Articles ({bookmarks.length})
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
