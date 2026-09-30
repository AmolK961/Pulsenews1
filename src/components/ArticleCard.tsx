import React from 'react';
import { Article } from '../types/news';
import { formatTimeAgo } from '../utils/categories';
import { Clock, Bookmark, BookmarkCheck, ExternalLink, ArrowUpRight } from 'lucide-react';
import { isArticleBookmarked, saveBookmark, removeBookmark } from '../utils/storage';

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  onBookmarkToggle?: () => void;
  variant?: 'featured' | 'standard' | 'compact' | 'minimal';
  categoryLabel?: string;
  categoryColor?: string;
  rankNumber?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSelect,
  onBookmarkToggle,
  variant = 'standard',
  categoryLabel,
  categoryColor = 'from-slate-600 to-slate-800',
  rankNumber
}) => {
  const [bookmarked, setBookmarked] = React.useState(false);

  React.useEffect(() => {
    setBookmarked(isArticleBookmarked(article.url));
  }, [article.url]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarked) {
      removeBookmark(article.url);
      setBookmarked(false);
    } else {
      saveBookmark(article);
      setBookmarked(true);
    }
    if (onBookmarkToggle) onBookmarkToggle();
  };

  // Fallback image based on title hash or category
  const fallbackImg = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
  const imageUrl = article.urlToImage || fallbackImg;

  if (variant === 'featured') {
    return (
      <div
        onClick={() => onSelect(article)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800/80 shadow-2xl transition-all duration-300 hover:border-rose-500/50 hover:shadow-rose-950/20"
      >
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-slate-950">
          <img
            src={imageUrl}
            alt={article.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImg;
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {rankNumber !== undefined && (
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-500 text-slate-950 shadow-lg tracking-wider">
                  #{rankNumber}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-lg tracking-wide uppercase">
                Top Story
              </span>
            </div>
            <button
              onClick={handleBookmarkClick}
              aria-label="Bookmark"
              className="p-2 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-200 hover:text-amber-400 hover:bg-slate-900 transition"
            >
              {bookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          {/* Bottom Content inside Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
            <div className="flex items-center gap-3 text-xs font-medium text-slate-300 mb-2">
              <span className="text-rose-400 font-semibold">{article.source.name}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeAgo(article.publishedAt)}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-rose-300 transition line-clamp-2 sm:line-clamp-3 leading-tight">
              {article.title}
            </h1>

            {article.description && (
              <p className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-3xl leading-relaxed hidden xs:block">
                {article.description}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-rose-400 group-hover:text-rose-300">
              <span>Read Full Story & View iFrame</span>
              <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onSelect(article)}
        className="group flex gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700 cursor-pointer transition-all duration-200"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-slate-950 relative">
          {rankNumber !== undefined && (
            <span className={`absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded-md text-[10px] font-black shadow-md ${
              rankNumber === 1 
                ? 'bg-amber-400 text-slate-950' 
                : rankNumber === 2 
                  ? 'bg-slate-200 text-slate-950' 
                  : rankNumber === 3 
                    ? 'bg-amber-700 text-white' 
                    : 'bg-slate-950/90 text-slate-300 border border-slate-700'
            }`}>
              #{rankNumber}
            </span>
          )}
          <img
            src={imageUrl}
            alt={article.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImg;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
              <span className="text-rose-400 font-medium truncate">{article.source.name}</span>
              <span>&bull;</span>
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-rose-400 transition line-clamp-2 leading-snug">
              {article.title}
            </h3>
          </div>

          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span className="text-slate-500 hover:text-slate-300">Click to read</span>
            <button
              onClick={handleBookmarkClick}
              className="p-1 rounded text-slate-400 hover:text-amber-400"
            >
              {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard Card
  return (
    <div
      onClick={() => onSelect(article)}
      className="group relative flex flex-col rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <img
          src={imageUrl}
          alt={article.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImg;
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Category & Rank badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {rankNumber !== undefined && (
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-black shadow-md ${
              rankNumber === 1 
                ? 'bg-amber-400 text-slate-950' 
                : rankNumber === 2 
                  ? 'bg-slate-200 text-slate-950' 
                  : rankNumber === 3 
                    ? 'bg-amber-700 text-white' 
                    : 'bg-slate-950/90 text-slate-300 border border-slate-700'
            }`}>
              #{rankNumber}
            </span>
          )}
          {categoryLabel && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-white border border-slate-700 uppercase tracking-wider">
              {categoryLabel}
            </span>
          )}
        </div>

        <button
          onClick={handleBookmarkClick}
          aria-label="Bookmark"
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-300 hover:text-amber-400 hover:bg-slate-900 transition"
        >
          {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="text-rose-400 font-semibold truncate max-w-[130px]">{article.source.name}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(article.publishedAt)}
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-100 group-hover:text-rose-300 transition line-clamp-2 leading-snug">
            {article.title}
          </h3>

          {article.description && (
            <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {article.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs">
          <span className="text-rose-400 font-medium inline-flex items-center gap-1 group-hover:underline">
            Read Story & iFrame
            <ArrowUpRight className="w-3 h-3" />
          </span>
          <span className="text-[11px] text-slate-500">
            {article.author ? `By ${article.author.split(',')[0].slice(0, 18)}` : 'PulseNews'}
          </span>
        </div>
      </div>
    </div>
  );
};
