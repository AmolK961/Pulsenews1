import { CategoryInfo, NewsCategory } from '../types/news';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'general',
    name: 'Top Stories',
    icon: 'Flame',
    description: 'Breaking global headlines, major policy updates, and world developments',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: 'Cpu',
    description: 'AI breakthroughs, hardware launches, cybersecurity, and future computing',
    color: 'from-sky-500 to-blue-600',
  },
  {
    id: 'business',
    name: 'Business & Markets',
    icon: 'TrendingUp',
    description: 'Financial markets, global trade, corporate venture, and economics',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: 'Trophy',
    description: 'Live scores, championship tournaments, transfers, and athlete milestones',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    description: 'Cinema, music culture, streaming series, celebrity spotlights, and arts',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'science',
    name: 'Science & Cosmos',
    icon: 'Atom',
    description: 'Space missions, physics, genomics, climate data, and deep sea exploration',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: 'HeartPulse',
    description: 'Medical clinical trials, longevity research, mental wellness, and nutrition',
    color: 'from-teal-500 to-cyan-600',
  }
];

export const COUNTRIES = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
];

export function formatTimeAgo(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}
