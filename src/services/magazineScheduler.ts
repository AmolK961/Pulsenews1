import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { getSubscribers } from './magazineSubscriberStore.ts';
import { sendMagazineIssueEmail, sendEmail } from './emailService.ts';
import { MAGAZINE_ISSUES } from './magazineData.ts';
import { MagazineIssue } from '../types/magazine.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SCHEDULE_LOG_PATH = path.join(DATA_DIR, 'magazine_schedule_history.json');

export interface DispatchLogEntry {
  id: string;
  type: 'daily_morning' | 'daily_evening' | 'weekly_sunday' | 'monthly_last_day' | 'manual_test';
  scheduledTime: string;
  dispatchedAt: string;
  subscribersCount: number;
  successfulSends: number;
  failedSends: number;
  issueTitles: string[];
  status: 'completed' | 'partial' | 'failed';
  notes: string;
}

export interface SchedulerStatus {
  active: boolean;
  schedules: {
    dailyMorning: { cron: string; label: string; nextRunDescription: string };
    dailyEvening: { cron: string; label: string; nextRunDescription: string };
    weeklySunday: { cron: string; label: string; nextRunDescription: string };
    monthlyLastDay: { cron: string; label: string; nextRunDescription: string };
  };
  lastDispatch: DispatchLogEntry | null;
  historyCount: number;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDispatchHistory(): DispatchLogEntry[] {
  ensureDataDir();
  try {
    if (fs.existsSync(SCHEDULE_LOG_PATH)) {
      const raw = fs.readFileSync(SCHEDULE_LOG_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[MagazineScheduler] Error reading dispatch history:', err);
  }
  return [];
}

export function saveDispatchLog(entry: DispatchLogEntry): void {
  ensureDataDir();
  try {
    const history = readDispatchHistory();
    history.unshift(entry);
    // Keep last 100 entries
    const trimmed = history.slice(0, 100);
    fs.writeFileSync(SCHEDULE_LOG_PATH, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('[MagazineScheduler] Error saving dispatch log:', err);
  }
}

// Helper to find the best matching issues for a given period
function getIssuesForPeriod(period: 'daily' | 'weekly' | 'monthly'): MagazineIssue[] {
  const matching = MAGAZINE_ISSUES.filter(issue => issue.period === period);
  return matching.length > 0 ? matching : MAGAZINE_ISSUES.slice(0, 4);
}

// Core dispatch runner
export async function executeScheduledDispatch(
  type: 'daily_morning' | 'daily_evening' | 'weekly_sunday' | 'monthly_last_day' | 'manual_test',
  forcedPeriod?: 'daily' | 'weekly' | 'monthly'
): Promise<DispatchLogEntry> {
  const period: 'daily' | 'weekly' | 'monthly' = forcedPeriod || (
    type === 'daily_morning' || type === 'daily_evening' ? 'daily' :
    type === 'weekly_sunday' ? 'weekly' : 'monthly'
  );

  console.log(`[MagazineScheduler] Starting automated dispatch: ${type} (${period.toUpperCase()} edition)...`);

  const allSubscribers = getSubscribers();
  // Filter for matching frequency
  const targetSubscribers = allSubscribers.filter(sub => 
    sub.frequency === period || allSubscribers.length <= 5
  );

  const issues = getIssuesForPeriod(period);
  const primaryIssue = issues[0] || MAGAZINE_ISSUES[0];
  const issueTitles = issues.map(i => i.magazineName);

  let successCount = 0;
  let failCount = 0;

  for (const subscriber of targetSubscribers) {
    try {
      const res = await sendMagazineIssueEmail({
        to: subscriber.email,
        recipientName: subscriber.name,
        issue: primaryIssue
      });
      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      failCount++;
    }
  }

  // Also notify developer/admin inbox
  try {
    await sendEmail({
      to: 'amolkharat817@gmail.com',
      subject: `[PulseNews Automated Dispatch] ${period.toUpperCase()} Magazine Dispatched at 7 AM/PM`,
      html: `
        <div style="font-family:sans-serif;padding:24px;background:#090d16;color:#f8fafc;border-radius:12px;">
          <h2 style="color:#e11d48;margin:0 0 12px 0;">Automated Magazine Dispatch Executed</h2>
          <p style="font-size:14px;color:#cbd5e1;line-height:1.5;">
            Scheduled <strong>${type}</strong> completed successfully.
          </p>
          <div style="background:#1e293b;padding:12px;border-radius:8px;font-size:12px;color:#94a3b8;margin-top:16px;">
            Frequency: ${period.toUpperCase()}<br>
            Dispatched to: ${targetSubscribers.length} subscribers (${successCount} delivered, ${failCount} pending)<br>
            Timestamp: ${new Date().toISOString()}<br>
            Featured Issue: ${primaryIssue.magazineName}
          </div>
        </div>
      `
    });
  } catch {}

  const logEntry: DispatchLogEntry = {
    id: `dispatch-${Date.now()}`,
    type,
    scheduledTime: new Date().toISOString(),
    dispatchedAt: new Date().toISOString(),
    subscribersCount: targetSubscribers.length,
    successfulSends: successCount,
    failedSends: failCount,
    issueTitles,
    status: failCount === 0 ? 'completed' : 'partial',
    notes: `Automated dispatch for ${period} edition completed (${successCount} delivered via Free Plan/SMTP).`
  };

  saveDispatchLog(logEntry);
  console.log(`[MagazineScheduler] Dispatch ${type} finished: ${successCount} sent, ${failCount} failed.`);
  return logEntry;
}

// Initialize all required cron jobs
export function startMagazineScheduler(): void {
  console.log('[MagazineScheduler] Initializing automated schedules:');
  console.log(' - Daily Morning: 7:00 AM (07:00)');
  console.log(' - Daily Evening: 7:00 PM (19:00)');
  console.log(' - Weekly Sunday: 7:00 AM (07:00)');
  console.log(' - Monthly Last Day: 7:00 AM (07:00)');

  // 1. Daily Morning at 7:00 AM (0 7 * * *)
  cron.schedule('0 7 * * *', async () => {
    console.log('[MagazineScheduler] Triggering Daily Morning 7:00 AM dispatch...');
    await executeScheduledDispatch('daily_morning', 'daily');
  });

  // 2. Daily Evening at 7:00 PM (0 19 * * *)
  cron.schedule('0 19 * * *', async () => {
    console.log('[MagazineScheduler] Triggering Daily Evening 7:00 PM dispatch...');
    await executeScheduledDispatch('daily_evening', 'daily');
  });

  // 3. Weekly Sunday at 7:00 AM (0 7 * * 0)
  cron.schedule('0 7 * * 0', async () => {
    console.log('[MagazineScheduler] Triggering Weekly Sunday 7:00 AM dispatch...');
    await executeScheduledDispatch('weekly_sunday', 'weekly');
  });

  // 4. Monthly Last Day of Month at 7:00 AM
  // We run a check at 7:00 AM every day to see if today is the last day of the month
  cron.schedule('0 7 * * *', async () => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const isLastDayOfMonth = tomorrow.getDate() === 1;

    if (isLastDayOfMonth) {
      console.log('[MagazineScheduler] Today is the last day of the month! Triggering Monthly 7:00 AM dispatch...');
      await executeScheduledDispatch('monthly_last_day', 'monthly');
    }
  });

  console.log('[MagazineScheduler] All automated cron workers active.');
}

export function getSchedulerStatus(): SchedulerStatus {
  const history = readDispatchHistory();
  return {
    active: true,
    schedules: {
      dailyMorning: {
        cron: '0 7 * * *',
        label: 'Daily Morning Edition',
        nextRunDescription: 'Every morning at 7:00 AM'
      },
      dailyEvening: {
        cron: '0 19 * * *',
        label: 'Daily Evening Edition',
        nextRunDescription: 'Every evening at 7:00 PM'
      },
      weeklySunday: {
        cron: '0 7 * * 0',
        label: 'Weekly Sunday Digest',
        nextRunDescription: 'Every Sunday at 7:00 AM'
      },
      monthlyLastDay: {
        cron: '0 7 28-31 * * (last day condition)',
        label: 'Monthly Compendium',
        nextRunDescription: 'Last day of every month at 7:00 AM'
      }
    },
    lastDispatch: history[0] || null,
    historyCount: history.length
  };
}
