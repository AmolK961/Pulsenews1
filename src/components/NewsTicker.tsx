import React from 'react';
import { Article } from '../types/news';
import { Zap } from 'lucide-react';

interface NewsTickerProps {
  articles: Article[];
  onSelect: (article: Article) => void;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ articles, onSelect }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="w-full bg-slate-900/90 border-y border-slate-800/80 overflow-hidden flex items-center h-10 select-none">
      {/* Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shrink-0 z-10 shadow-md">
        <Zap className="w-3.5 h-3.5 fill-white animate-pulse" />
        <span>Breaking</span>
      </div>

      {/* Ticker marquee items */}
      <div className="flex-1 overflow-x-hidden relative flex items-center">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee px-4 hover:[animation-play-state:paused]">
          {articles.concat(articles).map((item, idx) => (
            <button
              key={`${item.url}-${idx}`}
              onClick={() => onSelect(item)}
              className="text-xs text-slate-300 hover:text-rose-400 font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="font-semibold text-slate-200">[{item.source.name}]</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
