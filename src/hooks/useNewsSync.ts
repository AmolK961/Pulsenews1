import { useState, useEffect, useCallback } from 'react';
import { 
  FIVE_HOURS_MS, 
  isSyncDue, 
  performInbuiltNewsSync, 
  getCurrentSyncStatus, 
  SyncStatus,
  sortArticlesLatestFirst
} from '../services/newsSyncService';
import { Article } from '../types/news';

export function useNewsSync(onNewsUpdated?: (articles: Article[]) => void) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getCurrentSyncStatus());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string>('');

  const triggerSync = useCallback(async (source: 'react_5h_timer' | 'android_5h_timer' | 'manual_user' = 'react_5h_timer') => {
    setIsSyncing(true);
    try {
      const res = await performInbuiltNewsSync(source);
      setSyncStatus(getCurrentSyncStatus());
      setLastSyncMessage(res.message);
      if (res.articles && res.articles.length > 0 && onNewsUpdated) {
        onNewsUpdated(sortArticlesLatestFirst(res.articles));
      }
    } catch (e: any) {
      console.warn('[useNewsSync] Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [onNewsUpdated]);

  useEffect(() => {
    // 1. Initial check: If 5 hours have passed or never synced, run sync immediately
    if (isSyncDue()) {
      triggerSync('react_5h_timer');
    }

    // 2. Inbuilt 5-hour interval timer (checks every 60 seconds whether 5 hours have elapsed)
    const interval = setInterval(() => {
      setSyncStatus(getCurrentSyncStatus());
      if (isSyncDue() && !isSyncing) {
        console.log('[useNewsSync] 5-hour interval reached! Executing inbuilt background news fetch...');
        triggerSync('react_5h_timer');
      }
    }, 60000); // Check every minute

    // 3. App visibility change: If user returns to tab after >5 hours, sync automatically
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setSyncStatus(getCurrentSyncStatus());
        if (isSyncDue() && !isSyncing) {
          triggerSync('react_5h_timer');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [triggerSync, isSyncing]);

  return {
    syncStatus,
    isSyncing,
    lastSyncMessage,
    triggerSync
  };
}
