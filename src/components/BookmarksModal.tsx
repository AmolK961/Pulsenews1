import React from 'react';
import { BookmarkArticle, Article } from '../types/news';
import { ArticleCard } from './ArticleCard';
import { Bookmark, X, Trash2, ArrowLeft } from 'lucide-react';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkArticle[];
  onSelectArticle: (article: Article) => void;
  onClearAll: () => void;
  onBookmarkToggle: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onSelectArticle,
  onClearAll,
  onBookmarkToggle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[88vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Saved Articles</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                {bookmarks.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {bookmarks.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-3 text-slate-500">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200">No saved stories yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Tap the bookmark icon on any news story to save it for offline reading and quick access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((article, idx) => (
                <ArticleCard
                  key={`${article.url}-${idx}`}
                  article={article}
                  onSelect={(item) => {
                    onClose();
                    onSelectArticle(item);
                  }}
                  onBookmarkToggle={onBookmarkToggle}
                  variant="compact"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
