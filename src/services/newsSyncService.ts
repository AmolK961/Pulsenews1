import { Article } from '../types/news';

export const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const STORAGE_KEY_LAST_SYNC = 'pulsenews_last_sync_timestamp';
const STORAGE_KEY_CACHED_ARTICLES = 'pulsenews_cached_articles_v2';

export interface SyncStatus {
  lastSyncTime: number; // Unix timestamp ms
  nextSyncTime: number; // Unix timestamp ms
  timeUntilNextSyncMs: number;
  isSyncing: boolean;
  totalCached: number;
  newestArticleTitle?: string;
  newestArticleTime?: string;
}

// Get last sync timestamp
export function getLastSyncTime(): number {
  if (typeof window === 'undefined') return Date.now();
  const val = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
  return val ? parseInt(val, 10) : 0;
}

// Check if 5 hours have passed
export function isSyncDue(): boolean {
  const lastSync = getLastSyncTime();
  return (Date.now() - lastSync) >= FIVE_HOURS_MS;
}

// Sort articles so newest timestamp is strictly first
export function sortArticlesLatestFirst(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const timeA = new Date(a.publishedAt || 0).getTime();
    const timeB = new Date(b.publishedAt || 0).getTime();
    return timeB - timeA;
  });
}

// Fetch fresh news from server JSON store and update local storage
export async function performInbuiltNewsSync(source: 'react_5h_timer' | 'android_5h_timer' | 'manual_user' = 'react_5h_timer'): Promise<{
  success: boolean;
  articles: Article[];
  syncedAt: number;
  message: string;
}> {
  try {
    console.log(`[NewsSyncService] Running 5-hour news sync (Source: ${source})...`);

    // Call server sync endpoint
    const res = await fetch('/api/news/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triggeredBy: source === 'android_5h_timer' ? 'android_workmanager_5h' : 'client_react_5h' })
    });

    let articles: Article[] = [];

    if (res.ok) {
      const data = await res.json();
      if (data.articles && Array.isArray(data.articles)) {
        articles = data.articles;
      }
    }

    // If server returned articles or fallback to fetching /api/news
    if (articles.length === 0) {
      const newsRes = await fetch('/api/news?category=all&pageSize=40');
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        if (newsData.articles) {
          articles = newsData.articles;
        }
      }
    }

    // Always sort descending: latest news first
    const sorted = sortArticlesLatestFirst(articles);
    const now = Date.now();

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, now.toString());
      if (sorted.length > 0) {
        localStorage.setItem(STORAGE_KEY_CACHED_ARTICLES, JSON.stringify(sorted.slice(0, 80)));
      }
    }

    return {
      success: true,
      articles: sorted,
      syncedAt: now,
      message: `Successfully synchronized ${sorted.length} stories. Latest news shown first.`
    };
  } catch (err: any) {
    console.warn('[NewsSyncService] Sync encountered network error, reading local cache:', err);
    const cached = getLocalCachedArticles();
    return {
      success: false,
      articles: cached,
      syncedAt: getLastSyncTime(),
      message: err.message || 'Failed to fetch news from server'
    };
  }
}

// Read cached articles from localStorage
export function getLocalCachedArticles(): Article[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CACHED_ARTICLES);
    if (raw) {
      const parsed = JSON.parse(raw);
      return sortArticlesLatestFirst(parsed);
    }
  } catch {}
  return [];
}

// Get current sync status summary
export function getCurrentSyncStatus(): SyncStatus {
  const lastSync = getLastSyncTime();
  const nextSync = lastSync ? lastSync + FIVE_HOURS_MS : Date.now();
  const timeUntil = Math.max(0, nextSync - Date.now());
  const cached = getLocalCachedArticles();

  return {
    lastSyncTime: lastSync,
    nextSyncTime: nextSync,
    timeUntilNextSyncMs: timeUntil,
    isSyncing: false,
    totalCached: cached.length,
    newestArticleTitle: cached[0]?.title,
    newestArticleTime: cached[0]?.publishedAt
  };
}
