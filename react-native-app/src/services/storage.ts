import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '../types';

const BOOKMARKS_KEY = '@pulsenews_bookmarks_v1';

export async function getBookmarks(): Promise<Article[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to get bookmarks:', err);
    return [];
  }
}

export async function toggleBookmark(article: Article): Promise<boolean> {
  try {
    const current = await getBookmarks();
    const exists = current.some(a => a.url === article.url);
    let updated: Article[];

    if (exists) {
      updated = current.filter(a => a.url !== article.url);
    } else {
      updated = [{ ...article, isBookmarked: true }, ...current];
    }

    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return !exists;
  } catch (err) {
    console.error('Failed to toggle bookmark:', err);
    return false;
  }
}

export async function isBookmarked(url: string): Promise<boolean> {
  const all = await getBookmarks();
  return all.some(a => a.url === url);
}
