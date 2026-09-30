export interface ArticleSource {
  id: string | null;
  name: string;
}

export interface Article {
  source: ArticleSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  category?: string;
}

export type NewsCategory = 
  | 'general'
  | 'technology'
  | 'business'
  | 'entertainment'
  | 'sports'
  | 'science'
  | 'health';

export interface CategoryInfo {
  id: NewsCategory;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface NewsApiResponse {
  status: 'ok' | 'error';
  totalResults: number;
  totalPages?: number;
  page?: number;
  pageSize?: number;
  articles: Article[];
  message?: string;
  source?: string;
  month?: string;
}

export type CategoriesOverview = Record<NewsCategory, Article[]>;

export interface BookmarkArticle extends Article {
  savedAt: number;
}
