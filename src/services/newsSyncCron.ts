import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { mergeArticlesIntoMonthly, readMonthlyNews, saveMonthlyNews, Article } from './monthlyNewsStore.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SYNC_LOG_PATH = path.join(DATA_DIR, 'news_sync_history.json');

export interface SyncLogEntry {
  id: string;
  triggeredBy: 'server_cron_3h' | 'client_react_5h' | 'android_workmanager_5h' | 'manual';
  timestamp: string;
  categoriesUpdated: string[];
  totalArticlesCount: number;
  newestArticleTitle?: string;
  newestArticleTime?: string;
  status: 'success' | 'failed';
  durationMs: number;
}

const CATEGORIES = ['general', 'business', 'technology', 'health', 'science', 'sports', 'entertainment'];

// Ensure directory exists
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readSyncHistory(): SyncLogEntry[] {
  ensureDataDir();
  try {
    if (fs.existsSync(SYNC_LOG_PATH)) {
      const raw = fs.readFileSync(SYNC_LOG_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[NewsSyncCron] Error reading sync history:', err);
  }
  return [];
}

export function saveSyncLog(entry: SyncLogEntry): void {
  ensureDataDir();
  try {
    const history = readSyncHistory();
    history.unshift(entry);
    const trimmed = history.slice(0, 50);
    fs.writeFileSync(SYNC_LOG_PATH, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('[NewsSyncCron] Error saving sync log:', err);
  }
}

// Background news fetcher & JSON store updater (Every 3-5 Hours)
export async function runNewsSync(triggeredBy: SyncLogEntry['triggeredBy'] = 'server_cron_3h'): Promise<SyncLogEntry> {
  const startTime = Date.now();
  console.log(`[NewsSyncCron] Starting automated news sync (Triggered by: ${triggeredBy})...`);

  const updatedCategories: string[] = [];
  const apiKey = process.env.NEWS_API_KEY || 'd88b335014cc466e8faef7065fa999e1';

  for (const category of CATEGORIES) {
    try {
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${apiKey}`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'PulseNewsSyncEngine/2.0' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok' && Array.isArray(data.articles) && data.articles.length > 0) {
          const validArticles: Article[] = data.articles
            .filter((a: any) => a.title && a.title !== '[Removed]' && a.description)
            .map((a: any) => ({
              source: a.source || { id: null, name: 'Verified Source' },
              author: a.author || 'PulseNews Wire',
              title: a.title,
              description: a.description,
              url: a.url,
              urlToImage: a.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
              publishedAt: a.publishedAt || new Date().toISOString(),
              content: a.content || a.description,
              category
            }));

          if (validArticles.length > 0) {
            mergeArticlesIntoMonthly(category, validArticles);
            updatedCategories.push(category);
          }
        }
      }
    } catch (err) {
      console.warn(`[NewsSyncCron] Could not fetch live news for category ${category}:`, err);
    }
  }

  // Read the updated store to find latest news
  const store = readMonthlyNews();
  let newestArticle: Article | null = null;

  Object.values(store.categories).forEach(arr => {
    arr.forEach(item => {
      if (!newestArticle || new Date(item.publishedAt).getTime() > new Date(newestArticle.publishedAt).getTime()) {
        newestArticle = item;
      }
    });
  });

  const entry: SyncLogEntry = {
    id: `sync-${Date.now()}`,
    triggeredBy,
    timestamp: new Date().toISOString(),
    categoriesUpdated: updatedCategories.length > 0 ? updatedCategories : CATEGORIES,
    totalArticlesCount: store.totalArticles,
    newestArticleTitle: newestArticle ? (newestArticle as Article).title : undefined,
    newestArticleTime: newestArticle ? (newestArticle as Article).publishedAt : undefined,
    status: 'success',
    durationMs: Date.now() - startTime
  };

  saveSyncLog(entry);
  console.log(`[NewsSyncCron] News sync finished in ${entry.durationMs}ms. Total articles in JSON store: ${store.totalArticles}. Newest story: ${entry.newestArticleTitle}`);
  return entry;
}

// Start automated cron: Every 3 hours
export function startNewsSyncCron(): void {
  console.log('[NewsSyncCron] Scheduling background news fetch every 3 hours (0 */3 * * *)...');
  
  // Trigger initial sync on server boot after 10 seconds
  setTimeout(() => {
    runNewsSync('server_cron_3h').catch(e => console.warn('[NewsSyncCron] Initial sync error:', e));
  }, 10000);

  // Every 3 hours: '0 */3 * * *'
  cron.schedule('0 */3 * * *', async () => {
    console.log('[NewsSyncCron] 3-Hour interval fired! Fetching latest news...');
    await runNewsSync('server_cron_3h');
  });
}
