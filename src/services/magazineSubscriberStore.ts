import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MagazineSubscriber } from '../types/magazine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'magazine_subscribers.json');

const INITIAL_SUBSCRIBERS: MagazineSubscriber[] = [
  {
    id: 'sub-1',
    name: 'Sarah Jenkins, MD',
    email: 's.jenkins@stanfordmed.org',
    profession: 'Medical Doctor / Physician',
    categories: ['health', 'science'],
    frequency: 'weekly',
    format: 'digital',
    subscribedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'sub-2',
    name: 'David Vance, MBA',
    email: 'dvance@vanceholdings.com',
    profession: 'Business Executive / Founder',
    categories: ['business', 'technology'],
    frequency: 'weekly',
    format: 'pdf',
    subscribedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'sub-3',
    name: 'Alexander Chen',
    email: 'alex.chen@archsystems.io',
    profession: 'Systems Architect / Tech Lead',
    categories: ['technology', 'science'],
    frequency: 'daily',
    format: 'executive_summary',
    subscribedAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'sub-4',
    name: 'Coach Marcus Bell',
    email: 'marcus@performancebiomechanics.com',
    profession: 'Athletic Coach / Sports Scientist',
    categories: ['sports', 'health'],
    frequency: 'monthly',
    format: 'digital',
    subscribedAt: new Date(Date.now() - 86400000 * 12).toISOString()
  }
];

export function initializeSubscribersStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(INITIAL_SUBSCRIBERS, null, 2), 'utf-8');
      console.log('[MagazineStore] Initialized magazine_subscribers.json with initial cohort');
    }
  } catch (err) {
    console.error('[MagazineStore] Failed to initialize store:', err);
  }
}

export function getSubscribers(): MagazineSubscriber[] {
  try {
    initializeSubscribersStore();
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const content = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[MagazineStore] Failed to read subscribers:', err);
  }
  return INITIAL_SUBSCRIBERS;
}

export function addSubscriber(sub: Omit<MagazineSubscriber, 'id' | 'subscribedAt'>): { subscriber: MagazineSubscriber; isNew: boolean } {
  try {
    initializeSubscribersStore();
    const current = getSubscribers();
    const normalizedEmail = sub.email.trim().toLowerCase();
    
    // Check if already subscribed
    const existingIndex = current.findIndex(s => s.email.trim().toLowerCase() === normalizedEmail);
    if (existingIndex !== -1) {
      // Update preferences
      current[existingIndex] = {
        ...current[existingIndex],
        name: sub.name.trim(),
        profession: sub.profession,
        categories: sub.categories,
        frequency: sub.frequency,
        format: sub.format,
        youtubeSubscribed: sub.youtubeSubscribed !== undefined ? sub.youtubeSubscribed : current[existingIndex].youtubeSubscribed
      };
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(current, null, 2), 'utf-8');
      return { subscriber: current[existingIndex], isNew: false };
    }

    const newSubscriber: MagazineSubscriber = {
      id: 'sub-' + Date.now(),
      name: sub.name.trim(),
      email: normalizedEmail,
      profession: sub.profession,
      categories: sub.categories,
      frequency: sub.frequency,
      format: sub.format,
      youtubeSubscribed: !!sub.youtubeSubscribed,
      subscribedAt: new Date().toISOString()
    };

    current.unshift(newSubscriber);
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(current, null, 2), 'utf-8');
    return { subscriber: newSubscriber, isNew: true };
  } catch (err) {
    console.error('[MagazineStore] Failed to add subscriber:', err);
    throw err;
  }
}

export function getSubscriberStats() {
  const subs = getSubscribers();
  const categoryCounts: Record<string, number> = {};
  const frequencyCounts: Record<string, number> = { daily: 0, weekly: 0, monthly: 0 };
  let youtubeSubscribedCount = 0;

  subs.forEach(s => {
    s.categories.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    if (s.frequency) {
      frequencyCounts[s.frequency] = (frequencyCounts[s.frequency] || 0) + 1;
    }
    if (s.youtubeSubscribed) {
      youtubeSubscribedCount++;
    }
  });

  return {
    totalSubscribers: subs.length,
    youtubeSubscribedCount,
    categoryCounts,
    frequencyCounts,
    lastSubscribedAt: subs[0]?.subscribedAt || null
  };
}
