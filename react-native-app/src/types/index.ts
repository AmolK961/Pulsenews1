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
  isBookmarked?: boolean;
}

export interface FullArticleData {
  status: string;
  url: string;
  title?: string;
  leadParagraph?: string;
  paragraphs?: string[];
  readingTimeMinutes?: number;
  wordCount?: number;
  extractedViaFallback?: boolean;
}

export interface AppUpdateStatus {
  isChecking: boolean;
  isUpdateAvailable: boolean;
  isDownloading: boolean;
  manifest?: any;
  error?: string | null;
}
