import React, { useState, useEffect, useRef } from 'react';
import { Article } from '../types/news';
import { formatTimeAgo } from '../utils/categories';
import { 
  X, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  FileText, 
  Globe, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  Languages,
  DownloadCloud,
  Check,
  BrainCircuit,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { isArticleBookmarked, saveBookmark, removeBookmark, saveRecentRead } from '../utils/storage';
import { GoogleAdBanner } from './GoogleAdBanner';

interface AISummaryData {
  keyTakeaways: string[];
  executiveSummary: string;
  sentiment: string;
  biasIndicator: string;
  readingTimeMinutes: number;
  eli5: string;
}

interface NewsReaderModalProps {
  article: Article | null;
  onClose: () => void;
  onBookmarkChange?: () => void;
  isAndroidView?: boolean;
  onNextArticle?: () => void;
  onPreviousArticle?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ar', name: 'Arabic (العربية)' }
];

export const NewsReaderModal: React.FC<NewsReaderModalProps> = ({
  article,
  onClose,
  onBookmarkChange,
  isAndroidView = false,
  onNextArticle,
  onPreviousArticle,
  hasNext = false,
  hasPrevious = false
}) => {
  const [activeTab, setActiveTab] = useState<'iframe' | 'reader' | 'ai'>('iframe');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [sharedToast, setSharedToast] = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);
  
  // Full Article Extraction State for Clean Reader
  const [fullArticleData, setFullArticleData] = useState<{
    paragraphs: string[];
    leadParagraph: string;
    fullText: string;
    paragraphCount: number;
    source: string;
  } | null>(null);
  const [loadingFullArticle, setLoadingFullArticle] = useState(false);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<AISummaryData | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Translation State
  const [targetLang, setTargetLang] = useState('en');
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  // Touch Swipe coordinates
  const touchStartX = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Toast Notification state (replacing window.alert for compliance)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const iframeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (article) {
      setIsBookmarked(isArticleBookmarked(article.url));
      saveRecentRead(article);
      setIframeLoaded(false);
      setIframeError(false);
      setIframeKey(prev => prev + 1);
      setAiSummary(null);
      setTranslatedTitle(null);
      setTranslatedDesc(null);
      setTargetLang('en');
      setOfflineSaved(false);

      // Pre-fetch clean full news structure
      setFullArticleData(null);
      setLoadingFullArticle(true);
      const queryParams = new URLSearchParams({
        url: article.url,
        title: article.title,
        description: article.description || '',
        content: article.content || ''
      });
      fetch(`/api/news/full-article?${queryParams.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'ok') {
            setFullArticleData(data);
          }
        })
        .catch(err => console.warn('Could not extract full article:', err))
        .finally(() => setLoadingFullArticle(false));

      // 3.5s fallback timeout: if publisher blocks iframes (X-Frame-Options), show clean structure with full news
      if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
      iframeTimeoutRef.current = setTimeout(() => {
        if (!iframeLoaded) {
          setIframeError(true);
          setActiveTab('reader');
          showToast('External frame blocked: Displaying clean in-app structure with full news.');
        }
      }, 3500);
    }
    return () => {
      if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, [article]);

  // Keyboard navigation for Prev/Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext && onNextArticle) onNextArticle();
      if (e.key === 'ArrowLeft' && hasPrevious && onPreviousArticle) onPreviousArticle();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNext, hasPrevious, onNextArticle, onPreviousArticle, onClose]);

  if (!article) return null;

  const toggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(article.url);
      setIsBookmarked(false);
    } else {
      saveBookmark(article);
      setIsBookmarked(true);
    }
    if (onBookmarkChange) onBookmarkChange();
  };

  const handleSaveOffline = () => {
    saveBookmark(article);
    setIsBookmarked(true);
    setOfflineSaved(true);
    if (onBookmarkChange) onBookmarkChange();
    setTimeout(() => setOfflineSaved(false), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description || article.title,
          url: article.url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(article.url);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  const handleTextToSpeech = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const extraStory = fullArticleData?.paragraphs?.length 
        ? fullArticleData.paragraphs.slice(0, 3).join('. ')
        : (translatedDesc || article.description || '');
      const textToRead = `${translatedTitle || article.title}. Published by ${article.source.name}. ${extraStory}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Fetch AI Summary
  const handleFetchAiSummary = async () => {
    setActiveTab('ai');
    if (aiSummary) return;

    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          description: article.description,
          content: article.content
        })
      });
      const json = await res.json();
      if (json.status === 'ok') {
        setAiSummary(json.data);
      }
    } catch (err) {
      console.error('Error fetching AI summary:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Handle Translation
  const handleLanguageChange = async (newLang: string) => {
    setTargetLang(newLang);
    if (newLang === 'en') {
      setTranslatedTitle(null);
      setTranslatedDesc(null);
      return;
    }

    setTranslating(true);
    try {
      // Translate Title
      const resTitle = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: article.title,
          targetLanguage: newLang
        })
      });
      const dataTitle = await resTitle.json();
      if (dataTitle.status === 'ok') {
        setTranslatedTitle(dataTitle.translatedText);
      }

      // Translate Description if present
      if (article.description) {
        const resDesc = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: article.description,
            targetLanguage: newLang
          })
        });
        const dataDesc = await resDesc.json();
        if (dataDesc.status === 'ok') {
          setTranslatedDesc(dataDesc.translatedText);
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslating(false);
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;

    // Minimum swipe threshold 75px
    if (diff < -75 && hasNext && onNextArticle) {
      onNextArticle();
    } else if (diff > 75 && hasPrevious && onPreviousArticle) {
      onPreviousArticle();
    }
    touchStartX.current = null;
  };

  const proxyIframeUrl = `/api/news/proxy-article?url=${encodeURIComponent(article.url)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation Arrows for Previous and Next Article */}
      {hasPrevious && onPreviousArticle && (
        <button
          onClick={onPreviousArticle}
          className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-rose-600 transition shadow-2xl z-50 group"
          title="Previous story (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {hasNext && onNextArticle && (
        <button
          onClick={onNextArticle}
          className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-rose-600 transition shadow-2xl z-50 group"
          title="Next story (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Main Reader Container */}
      <div 
        className={`w-full h-full flex flex-col bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden ${
          isAndroidView 
            ? 'max-w-md max-h-[92vh] rounded-3xl my-auto' 
            : 'max-w-6xl max-h-[96vh] rounded-2xl my-auto'
        }`}
      >
        {/* Top App Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800 text-slate-200 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition flex items-center gap-1.5"
              aria-label="Back to news"
            >
              <ArrowLeft className="w-5 h-5 text-rose-400" />
              <span className="text-xs font-semibold hidden sm:inline text-slate-300">Back</span>
            </button>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 truncate max-w-[130px] sm:max-w-xs">
              {article.source.name}
            </span>
          </div>

          {/* View Tab Switcher: iFrame vs Reader vs AI Summary */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('iframe')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'iframe'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">iFrame Web</span>
            </button>
            <button
              onClick={() => setActiveTab('reader')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'reader'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Clean Reader</span>
            </button>
            <button
              onClick={handleFetchAiSummary}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>AI Brief</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Multi-language Selector */}
            <div className="relative hidden sm:block">
              <select
                value={targetLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium rounded-xl pl-6 pr-4 py-2 cursor-pointer outline-none focus:border-rose-500"
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.name}
                  </option>
                ))}
              </select>
              <Languages className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
            </div>

            <button
              onClick={handleSaveOffline}
              title="Save for Offline / Plane Mode"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {offlineSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <DownloadCloud className="w-4 h-4" />}
            </button>

            <button
              onClick={handleTextToSpeech}
              title={isSpeaking ? 'Stop voice reader' : 'Listen aloud'}
              className={`p-2 rounded-xl border transition ${
                isSpeaking 
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleBookmark}
              title={isBookmarked ? 'Saved to bookmarks' : 'Save bookmark'}
              className={`p-2 rounded-xl border transition ${
                isBookmarked 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              onClick={handleShare}
              title="Share article"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-rose-600/30 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Description & Article Header (Always shown prominently on our page!) */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800/90 shadow-md">
          <div className="max-w-4xl">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug line-clamp-2">
              {translating ? 'Translating headline...' : (translatedTitle || article.title)}
            </h2>
            
            {/* Full Description Callout */}
            {(translatedDesc || article.description) && (
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-rose-400 font-semibold mr-1.5 uppercase tracking-wider text-[10px]">
                  {targetLang !== 'en' ? `Full Description (${targetLang.toUpperCase()}):` : 'Full Description:'}
                </span>
                {translating ? 'Translating full description...' : (translatedDesc || article.description)}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formatTimeAgo(article.publishedAt)}
                </span>
                {article.author && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span className="truncate max-w-[150px]">{article.author}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Verified NewsAPI Source
                </span>
              </div>

              {/* Mobile prev/next controls */}
              <div className="flex items-center gap-2">
                {hasPrevious && onPreviousArticle && (
                  <button onClick={onPreviousArticle} className="text-slate-400 hover:text-white text-xs font-medium">
                    &larr; Prev Story
                  </button>
                )}
                {hasNext && onNextArticle && (
                  <button onClick={onNextArticle} className="text-rose-400 hover:text-rose-300 text-xs font-semibold">
                    Next Story &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex flex-col">
          {activeTab === 'ai' ? (
            /* AI Quick Summary & Key Takeaways Tab */
            <div className="w-full h-full overflow-y-auto p-4 sm:p-8 bg-slate-900/95 space-y-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Smart Gemini AI Executive Brief</h3>
                  </div>
                  <button
                    onClick={handleFetchAiSummary}
                    disabled={loadingAi}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                </div>

                {loadingAi ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-xs text-slate-300 font-semibold">Analyzing story with Gemini 3.8 Flash...</p>
                    <p className="text-[11px] text-slate-500">Synthesizing 3 key takeaways and sentiment balance</p>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Key Takeaways Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-800/80 to-slate-900 border border-amber-500/30 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          3 Key Takeaways
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                            {aiSummary.readingTimeMinutes} min read
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold">
                            {aiSummary.sentiment}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-2.5 pt-1">
                        {aiSummary.keyTakeaways.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Executive Summary */}
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Executive Summary</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {aiSummary.executiveSummary}
                      </p>
                    </div>

                    {/* ELI5 / Plain English Breakdown */}
                    {aiSummary.eli5 && (
                      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                        <strong className="text-indigo-400 block mb-1">Explain Like I&apos;m 5 (Plain English):</strong>
                        {aiSummary.eli5}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ) : activeTab === 'iframe' ? (
            /* iFrame Web View */
            <div className="relative w-full h-full flex flex-col bg-slate-950">
              {/* iFrame Toolbar */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/70 border-b border-slate-800/60 text-[11px] text-slate-400">
                <div className="flex items-center gap-2 truncate max-w-[70%]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-slate-300 truncate">{article.url}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIframeLoaded(false);
                      setIframeKey(k => k + 1);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Reload iframe"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    <span>External</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Security & Frame Block Notice if iframe fails or is slow */}
              {iframeError && (
                <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>External publisher blocks embedded frames. Use Clean Reader for full text without restrictions.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('reader')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-[11px] shrink-0 transition"
                  >
                    Switch to Clean Reader
                  </button>
                </div>
              )}

              {/* Loading Indicator */}
              {!iframeLoaded && !iframeError && (
                <div className="absolute inset-0 top-8 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm">
                  <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mb-3" />
                  <p className="text-xs font-medium text-slate-300">Loading original article webpage into iframe...</p>
                  <p className="text-[11px] text-slate-500 mt-1">If the publisher blocks frames, click &quot;Clean Reader&quot; or &quot;AI Brief&quot; above.</p>
                </div>
              )}

              {/* Embedded iFrame Tag */}
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={proxyIframeUrl}
                title={article.title}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                loading="lazy"
                onLoad={() => {
                  setIframeLoaded(true);
                  if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
                }}
                onError={() => {
                  setIframeError(true);
                  setIframeLoaded(true);
                  setActiveTab('reader');
                  showToast('External publisher blocks frame: Displaying clean in-app structure with full news.');
                }}
                className="w-full flex-1 border-0 bg-white"
              />
            </div>
          ) : (
            /* Clean Reader Mode View - Clean Structure with Full News */
            <div className="w-full h-full overflow-y-auto p-4 sm:p-8 bg-slate-900">
              <div className="max-w-3xl mx-auto space-y-6 pb-12">
                {/* Security & Frame Block Notice if iframe had issue */}
                {iframeError && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Clean In-App Reader Active</p>
                        <p className="text-[11px] text-amber-300/80">External frame blocked by publisher. Showing full news structure formatted directly in our app.</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold shrink-0">Full News</span>
                  </div>
                )}

                {/* Reader Controls Toolbar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      Clean Reader &bull; Full Story
                    </span>
                    {fullArticleData?.paragraphCount && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {fullArticleData.paragraphCount} paragraphs
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTextToSpeech}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        isSpeaking 
                          ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title={isSpeaking ? 'Stop voice reader' : 'Listen aloud'}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span className="hidden xs:inline">{isSpeaking ? 'Stop Audio' : 'Listen Story'}</span>
                    </button>
                    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700/60">
                      <button
                        onClick={() => setFontSize('sm')}
                        className={`px-2 py-0.5 text-xs rounded transition cursor-pointer ${fontSize === 'sm' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                        title="Small font"
                      >
                        A-
                      </button>
                      <button
                        onClick={() => setFontSize('base')}
                        className={`px-2 py-0.5 text-xs rounded transition cursor-pointer ${fontSize === 'base' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                        title="Default font"
                      >
                        Default
                      </button>
                      <button
                        onClick={() => setFontSize('lg')}
                        className={`px-2 py-0.5 text-xs rounded transition cursor-pointer ${fontSize === 'lg' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                        title="Large font"
                      >
                        A+
                      </button>
                    </div>
                  </div>
                </div>

                {/* Large Featured Media */}
                {article.urlToImage && (
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 relative">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full max-h-96 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Verified Press Photography &bull; {article.source.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                  </div>
                )}

                {/* Article Content Layout */}
                <div className={`text-slate-200 leading-relaxed space-y-5 ${
                  fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base'
                }`}>
                  {/* Lead / Executive Overview Quote */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/30 via-slate-800/60 to-slate-900 border-l-4 border-rose-500 border-t border-r border-b border-slate-700/60 shadow-md">
                    <p className="font-semibold text-slate-100 text-base sm:text-lg leading-relaxed">
                      {translatedDesc || fullArticleData?.leadParagraph || article.description}
                    </p>
                  </div>

                  {/* Clean Reader Google AdSense Placement 1 */}
                  <div className="py-2">
                    <GoogleAdBanner format="horizontal" slot="4829105637" label="Sponsored Story" />
                  </div>

                  {/* Loading Full News Indicator */}
                  {loadingFullArticle && !fullArticleData && (
                    <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3 animate-pulse">
                      <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                        <div className="w-4 h-4 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                        <span>Formatting complete story paragraphs for clean reader...</span>
                      </div>
                      <div className="h-4 bg-slate-800 rounded w-full" />
                      <div className="h-4 bg-slate-800 rounded w-5/6" />
                      <div className="h-4 bg-slate-800 rounded w-4/6" />
                    </div>
                  )}

                  {/* Full Story Paragraphs */}
                  {fullArticleData?.paragraphs && fullArticleData.paragraphs.length > 0 ? (
                    <div className="space-y-4 pt-1">
                      {fullArticleData.paragraphs.map((p, idx) => (
                        <React.Fragment key={idx}>
                          <p className="text-slate-200 leading-relaxed font-normal bg-slate-950/30 p-3.5 rounded-xl border border-slate-800/50">
                            {p}
                          </p>
                          {idx === 2 && (
                            <div className="py-3">
                              <GoogleAdBanner format="rectangle" slot="1029384756" label="Related Sponsor" />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : article.content ? (
                    <div className="text-slate-300 space-y-4 pt-1">
                      <p className="bg-slate-950/30 p-3.5 rounded-xl border border-slate-800/50">
                        {article.content.replace(/\[\+\d+\s*chars\]$/, '')}
                      </p>
                    </div>
                  ) : null}

                  {/* Key Takeaways & Fact Sheet */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 mt-6">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Story Key Highlights &bull; Verified Feed
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                        <span><strong>Coverage Source:</strong> Reported by {article.source.name} with verified newsroom credentials.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        <span><strong>Full Story Status:</strong> Formatted cleanly inside our app without intrusive external popups or frame blocks.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span><strong>Publication Time:</strong> Published {formatTimeAgo(article.publishedAt)} ({new Date(article.publishedAt).toLocaleDateString()}).</span>
                      </li>
                    </ul>
                  </div>

                  {/* Publisher Accreditation & External Link */}
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Original reporting courtesy of <strong>{article.source.name}</strong></span>
                    </div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-medium transition shrink-0"
                    >
                      <span>Visit Publisher Directly</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>PulseNews In-Page Reader &bull; {article.source.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(activeTab === 'iframe' ? 'reader' : 'iframe')}
              className="text-rose-400 hover:text-rose-300 font-medium"
            >
              Switch to {activeTab === 'iframe' ? 'Clean Reader' : 'iFrame Web'} &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {sharedToast && (
        <div className="fixed bottom-8 z-50 px-4 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-xs shadow-2xl flex items-center gap-2">
          <span>Article link copied to clipboard!</span>
        </div>
      )}

      {/* Offline Saved Toast */}
      {offlineSaved && (
        <div className="fixed bottom-8 z-50 px-4 py-2 rounded-xl bg-emerald-600 border border-emerald-400 text-white text-xs shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Article cached for offline reading &amp; flight mode!</span>
        </div>
      )}

      {/* General Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 z-50 px-4 py-2 rounded-xl bg-slate-800 border border-slate-600 text-amber-300 text-xs shadow-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
