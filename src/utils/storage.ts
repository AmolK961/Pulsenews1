import { Article, BookmarkArticle } from '../types/news';

const BOOKMARKS_KEY = 'pulsenews_bookmarks_v1';
const RECENT_READS_KEY = 'pulsenews_recent_reads_v1';

export function getBookmarks(): BookmarkArticle[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse bookmarks:', e);
    return [];
  }
}

export function saveBookmark(article: Article): BookmarkArticle[] {
  try {
    const bookmarks = getBookmarks();
    if (bookmarks.some(b => b.url === article.url)) {
      return bookmarks;
    }
    const updated: BookmarkArticle[] = [
      { ...article, savedAt: Date.now() },
      ...bookmarks
    ];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save bookmark:', e);
    return getBookmarks();
  }
}

export function removeBookmark(url: string): BookmarkArticle[] {
  try {
    const bookmarks = getBookmarks();
    const updated = bookmarks.filter(b => b.url !== url);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to remove bookmark:', e);
    return getBookmarks();
  }
}

export function isArticleBookmarked(url: string): boolean {
  try {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.url === url);
  } catch {
    return false;
  }
}

export function saveRecentRead(article: Article): void {
  try {
    const raw = localStorage.getItem(RECENT_READS_KEY);
    const list: Article[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(a => a.url !== article.url);
    const updated = [article, ...filtered].slice(0, 30);
    localStorage.setItem(RECENT_READS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recent read:', e);
  }
}

export function getRecentReads(): Article[] {
  try {
    const raw = localStorage.getItem(RECENT_READS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
