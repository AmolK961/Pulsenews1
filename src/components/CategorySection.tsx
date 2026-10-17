import React, { useState } from 'react';
import { Article, CategoryInfo } from '../types/news';
import { ArticleCard } from './ArticleCard';
import { ArrowRight, Flame, Cpu, TrendingUp, Trophy, Film, Atom, HeartPulse, ChevronRight, Layers } from 'lucide-react';

interface CategorySectionProps {
  category: CategoryInfo;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onViewAllCategory: (categoryId: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  articles,
  onSelectArticle,
  onViewAllCategory
}) => {
  if (!articles || articles.length === 0) return null;

  // Render proper icon
  const getIcon = () => {
    switch (category.id) {
      case 'general': return <Flame className="w-5 h-5 text-rose-500" />;
      case 'technology': return <Cpu className="w-5 h-5 text-sky-400" />;
      case 'business': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'sports': return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'entertainment': return <Film className="w-5 h-5 text-purple-400" />;
      case 'science': return <Atom className="w-5 h-5 text-indigo-400" />;
      case 'health': return <HeartPulse className="w-5 h-5 text-teal-400" />;
      default: return <Flame className="w-5 h-5 text-rose-500" />;
    }
  };

  const top10Articles = articles.slice(0, 10);
  const primaryArticle = top10Articles[0];
  const secondaryArticles = top10Articles.slice(1, 4); // 3 items
  const remainingArticles = top10Articles.slice(4, 10); // 6 items

  return (
    <section className="space-y-4 p-4 sm:p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-lg">
      {/* Category Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {category.name}
              </h2>
              {/* <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
                Top 10 Stories
              </span> */}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {category.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => onViewAllCategory(category.id)}
          className="group flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition py-1.5 px-3 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer"
        >
          <span>Paginated View &rarr;</span>
        </button>
      </div>

      {/* Main Top 10 News Layout */}
      <div className="space-y-4">
        {/* Top Tier: 1 Big Hero Card + 3 Side Compact Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Hero Story */}
          <div className="lg:col-span-7">
            {primaryArticle && (
              <ArticleCard
                article={primaryArticle}
                onSelect={onSelectArticle}
                categoryLabel={category.name}
                variant="standard"
              />
            )}
          </div>

          {/* 3 Compact Stories */}
          <div className="lg:col-span-5 flex flex-col gap-3 justify-between">
            {secondaryArticles.map((article, idx) => (
              <ArticleCard
                key={`${article.url}-${idx}`}
                article={article}
                onSelect={onSelectArticle}
                variant="compact"
              />
            ))}
          </div>
        </div>

        {/* Lower Tier: Remaining 6 articles of Top 10 in responsive grid */}
        {remainingArticles.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>More Top Stories in {category.name} (5–10)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {remainingArticles.map((article, idx) => (
                <ArticleCard
                  key={`${article.url}-extra-${idx}`}
                  article={article}
                  onSelect={onSelectArticle}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar with quick paginated view button */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
        <span>Showing 10 of month&apos;s curated stories</span>
        <button
          onClick={() => onViewAllCategory(category.id)}
          className="text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View all with Page 1, 2, 3... Pagination</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
