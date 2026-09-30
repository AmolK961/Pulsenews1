export type MagazinePeriod = 'daily' | 'weekly' | 'monthly';

export interface MagazineStory {
  id: string;
  pageNumber?: number;
  title: string;
  author: string;
  authorTitle: string;
  readTime: string;
  badge: string;
  category?: string;
  source?: string;
  publishedAt?: string;
  imageUrl?: string;
  summary: string;
  keyMetrics?: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }[];
  contentParagraphs: string[];
  takeaways: string[];
}

export interface MagazineIssue {
  id: string;
  categoryId: 'business' | 'health' | 'technology' | 'sports' | 'science' | 'entertainment' | 'general';
  categoryTitle: string;
  magazineName: string;
  tagline: string;
  targetAudience: string;
  audienceBadge: string;
  period: MagazinePeriod;
  volume: string;
  issueNumber: string;
  publishDate: string;
  coverImage: string;
  editorInChief: string;
  editorialLetter: string;
  totalNewsCount: number;
  featuredStories: MagazineStory[];
  keyStats: { label: string; stat: string; change?: string }[];
}

export interface MagazineSubscriber {
  id: string;
  name: string;
  email: string;
  profession: string;
  categories: string[];
  frequency: MagazinePeriod;
  format: 'digital' | 'pdf' | 'executive_summary';
  youtubeSubscribed?: boolean;
  subscribedAt: string;
}
