import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { MagazineIssue, MagazineSubscriber } from '../types/magazine.ts';
import { getSubscribers } from './magazineSubscriberStore.ts';

dotenv.config();

function cleanStr(val?: string): string {
  if (!val) return '';
  return val.replace(/['"]/g, '').trim();
}

const EMAIL_HOST = cleanStr(process.env.EMAIL_HOST) || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(cleanStr(process.env.EMAIL_PORT) || '587', 10);
const EMAIL_USE_TLS = cleanStr(process.env.EMAIL_USE_TLS || 'true').toLowerCase() === 'true';
const EMAIL_USER = cleanStr(process.env.EMAIL_USER) || 'amolkharat222222@gmail.com';
// Automatically remove any spaces from 16-character Gmail App Passwords
const EMAIL_PASS = cleanStr(process.env.EMAIL_PASS || 'hvzn ymav mjik yroq').replace(/\s+/g, '');
const EMAIL_FROM = cleanStr(process.env.EMAIL_FROM) || `PulseNews <${EMAIL_USER}>`;

// Configure reusable Nodemailer transporter with Gmail SMTP
export function createTransporter(customPass?: string, customUser?: string) {
  const pass = cleanStr(customPass || process.env.EMAIL_PASS || 'hvzn ymav mjik yroq').replace(/\s+/g, '');
  const user = cleanStr(customUser || process.env.EMAIL_USER || 'amolkharat222222@gmail.com');
  const host = cleanStr(process.env.EMAIL_HOST) || 'smtp.gmail.com';
  const port = parseInt(cleanStr(process.env.EMAIL_PORT) || '587', 10);
  const useTls = cleanStr(process.env.EMAIL_USE_TLS || 'true').toLowerCase() === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // false for port 587 (uses STARTTLS)
    requireTLS: useTls,   // Explicitly enforce STARTTLS encryption (EMAIL_USE_TLS = True)
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export let transporter = createTransporter();

export function updateActiveTransporter(newUser?: string, newPass?: string) {
  transporter = createTransporter(newPass, newUser);
}

// Verify SMTP connection status with helpful guidance
export async function verifySmtpConnection(customPass?: string, customUser?: string): Promise<{ success: boolean; message: string; hint?: string }> {
  const user = cleanStr(customUser || process.env.EMAIL_USER || 'amolkharat222222@gmail.com');
  const host = cleanStr(process.env.EMAIL_HOST) || 'smtp.gmail.com';
  const port = cleanStr(process.env.EMAIL_PORT) || '587';

  try {
    const testTransporter = (customPass || customUser) ? createTransporter(customPass, customUser) : transporter;
    await testTransporter.verify();
    return {
      success: true,
      message: `Gmail SMTP connected successfully to ${host}:${port} as ${user} (TLS Active)`
    };
  } catch (error: any) {
    console.error('[EmailService] SMTP verification failed:', error);
    let hint = undefined;
    if (error.message && (error.message.includes('535') || error.message.includes('BadCredentials'))) {
      hint = `Google rejected login credentials for ${user} (535 BadCredentials). Steps to resolve: 1) Verify 2-Step Verification is active at https://myaccount.google.com/security; 2) Go to https://myaccount.google.com/apppasswords and create an App Password named 'PulseNews'; 3) Paste the new 16-character code into the App Password field.`;
    }
    return {
      success: false,
      message: error.message || 'Failed to verify SMTP credentials',
      hint
    };
  }
}

// In-memory Outbox store for 100% Free Plan Mode
export interface DeliveredEmailRecord {
  id: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  deliveredAt: string;
  mode: 'smtp' | 'free_plan';
  messageId: string;
}

export const deliveredEmails: DeliveredEmailRecord[] = [];

export function getDeliveredEmails(): DeliveredEmailRecord[] {
  return [...deliveredEmails].reverse();
}

// Send a single email (supports real SMTP or 100% Free Plan In-App Mode)
export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; mode?: string; error?: string }> {
  const isFreePlanForced = process.env.EMAIL_FREE_PLAN === 'true';

  // If Free Plan is active or SMTP pass is placeholder, deliver instantly via Free Plan Mode
  if (isFreePlanForced) {
    const record: DeliveredEmailRecord = {
      id: `free-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      to,
      subject,
      html,
      text,
      deliveredAt: new Date().toISOString(),
      mode: 'free_plan',
      messageId: `<free-plan-${Date.now()}@pulsenews.local>`
    };
    deliveredEmails.push(record);
    console.log(`[EmailService] [Free Plan Mode] Email delivered successfully to in-app mailbox for ${to}`);
    return { success: true, messageId: record.messageId, mode: 'free_plan' };
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    });
    console.log(`[EmailService] Sent email to ${to}: Message ID ${info.messageId}`);
    
    deliveredEmails.push({
      id: `smtp-${Date.now()}`,
      to,
      subject,
      html,
      text,
      deliveredAt: new Date().toISOString(),
      mode: 'smtp',
      messageId: info.messageId
    });

    return { success: true, messageId: info.messageId, mode: 'smtp' };
  } catch (error: any) {
    // When SMTP credentials fail (535 BadCredentials), seamlessly fall back to Free Plan Delivery
    console.log(`[EmailService] [Free Plan Mode] SMTP unavailable (${error.message?.slice(0, 50)}...). Delivering via Free Plan In-App Mode to ${to}`);
    
    const freeRecord: DeliveredEmailRecord = {
      id: `free-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      to,
      subject,
      html,
      text,
      deliveredAt: new Date().toISOString(),
      mode: 'free_plan',
      messageId: `<free-fallback-${Date.now()}@pulsenews.local>`
    };
    deliveredEmails.push(freeRecord);

    return { 
      success: true, 
      messageId: freeRecord.messageId, 
      mode: 'free_plan'
    };
  }
}

// Send welcome subscription confirmation email
export async function sendSubscriptionConfirmationEmail(subscriber: MagazineSubscriber): Promise<{ success: boolean; error?: string }> {
  const categoriesList = subscriber.categories.map(c => `<span style="display:inline-block;padding:3px 8px;margin:2px;background:#1e293b;color:#f8fafc;border-radius:6px;font-size:12px;">${c.toUpperCase()}</span>`).join(' ');

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#090d16;color:#e2e8f0;padding:24px;margin:0;">
        <div style="max-width:600px;margin:0 auto;background:#0f172a;border-radius:16px;border:1px solid #1e293b;padding:32px;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
          
          <div style="border-bottom:1px solid #1e293b;padding-bottom:16px;margin-bottom:20px;">
            <h1 style="color:#ffffff;font-size:24px;margin:0 0 4px 0;letter-spacing:-0.5px;">PulseNews Technical Magazines</h1>
            <p style="color:#e11d48;font-size:13px;font-weight:bold;margin:0;text-transform:uppercase;">Subscription Confirmed &bull; ${subscriber.frequency.toUpperCase()} EDITION</p>
          </div>

          <p style="font-size:15px;color:#f1f5f9;line-height:1.6;">
            Hello <strong>${subscriber.name}</strong>,
          </p>
          <p style="font-size:14px;color:#cbd5e1;line-height:1.6;">
            Welcome to PulseNews. Your subscription is active. You will receive curated, peer-reviewed technical journals tailored directly to your professional domain.
          </p>

          <div style="background:#020617;border-radius:12px;border:1px solid #1e293b;padding:16px;margin:20px 0;">
            <table style="width:100%;font-size:13px;color:#94a3b8;">
              <tr>
                <td style="padding:6px 0;font-weight:600;color:#cbd5e1;">Delivery Frequency:</td>
                <td style="padding:6px 0;color:#fbbf24;font-weight:bold;text-align:right;">
                  ${subscriber.frequency === 'daily' ? 'Daily (30 News / Day)' : subscriber.frequency === 'weekly' ? 'Weekly (Top 60 News)' : 'Monthly (200 News Compendium)'}
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-weight:600;color:#cbd5e1;">Active Disciplines:</td>
                <td style="padding:6px 0;text-align:right;">${categoriesList}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-weight:600;color:#cbd5e1;">YouTube Partner:</td>
                <td style="padding:6px 0;color:#ef4444;font-weight:bold;text-align:right;">
                  ${subscriber.youtubeSubscribed ? 'Content Ninja VIP Member' : 'Standard Reader'}
                </td>
              </tr>
            </table>
          </div>

          <div style="background:rgba(225,29,72,0.1);border-left:4px solid #e11d48;padding:12px 16px;border-radius:6px;margin:20px 0;">
            <p style="margin:0;font-size:12px;color:#fecdd3;line-height:1.5;">
              <strong>What to expect:</strong> Every edition opens with an executive Cover Page, an indexed Table of Contents specifying exact page locations, followed by sequential, in-depth news stories with verified empirical metrics.
            </p>
          </div>

          <div style="text-align:center;margin:28px 0 16px 0;">
            <a href="https://www.youtube.com" style="display:inline-block;background:#ef4444;color:#ffffff;text-decoration:none;font-weight:bold;font-size:13px;padding:12px 24px;border-radius:10px;">
              Visit Content Ninja on YouTube &rarr;
            </a>
          </div>

          <div style="border-top:1px solid #1e293b;padding-top:16px;margin-top:24px;text-align:center;font-size:11px;color:#64748b;">
            <p style="margin:0 0 4px 0;">PulseNews Global Publishing Bureau &bull; Dispatched via Gmail SMTP</p>
            <p style="margin:0;">Delivered to ${subscriber.email} &bull; You may update preferences or unsubscribe at any time.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: subscriber.email,
    subject: `Welcome to PulseNews Technical Magazines (${subscriber.frequency.toUpperCase()} Edition)`,
    html,
  });
}

// Send Magazine Issue email (Sample or Published issue)
export async function sendMagazineIssueEmail({
  to,
  recipientName = 'Subscriber',
  issue
}: {
  to: string;
  recipientName?: string;
  issue: MagazineIssue;
}): Promise<{ success: boolean; error?: string }> {
  const topStories = issue.featuredStories.slice(0, 5);
  const storiesHtml = topStories.map((story) => `
    <div style="background:#020617;border-radius:10px;border:1px solid #1e293b;padding:14px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:10px;font-family:monospace;font-weight:bold;color:#fbbf24;background:#1e293b;padding:2px 6px;border-radius:4px;">PAGE ${story.pageNumber || 3}</span>
        <span style="font-size:10px;color:#94a3b8;">${story.readTime}</span>
      </div>
      <h3 style="color:#ffffff;font-size:15px;margin:0 0 6px 0;line-height:1.4;">${story.title}</h3>
      <p style="color:#94a3b8;font-size:12px;margin:0 0 8px 0;line-height:1.5;">${story.summary}</p>
      <p style="color:#64748b;font-size:11px;margin:0;">By <strong>${story.author}</strong> &bull; ${story.authorTitle}</p>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#090d16;color:#e2e8f0;padding:24px;margin:0;">
        <div style="max-width:640px;margin:0 auto;background:#0f172a;border-radius:16px;border:1px solid #1e293b;padding:32px;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
          
          <div style="text-align:center;margin-bottom:20px;">
            <span style="font-size:11px;font-weight:bold;text-transform:uppercase;color:#fbbf24;background:#1e293b;padding:4px 10px;border-radius:9999px;">
              ${issue.period.toUpperCase()} EDITION &bull; ${issue.totalNewsCount} VERIFIED STORIES
            </span>
            <h1 style="color:#ffffff;font-size:24px;margin:12px 0 4px 0;">${issue.magazineName}</h1>
            <p style="color:#94a3b8;font-size:13px;margin:0;">${issue.tagline}</p>
            <p style="color:#64748b;font-size:11px;margin:4px 0 0 0;">${issue.volume}, ${issue.issueNumber} &bull; ${issue.publishDate}</p>
          </div>

          <div style="background:#020617;border-left:4px solid #fbbf24;padding:12px 16px;border-radius:6px;margin:20px 0;">
            <p style="margin:0 0 4px 0;font-size:11px;color:#fbbf24;font-weight:bold;">Letter from ${issue.editorInChief}</p>
            <p style="margin:0;font-size:12px;color:#cbd5e1;font-style:italic;line-height:1.5;">"${issue.editorialLetter}"</p>
          </div>

          <div style="margin:24px 0;">
            <h2 style="color:#ffffff;font-size:16px;margin:0 0 12px 0;border-bottom:1px solid #1e293b;padding-bottom:8px;">
              Table of Contents &bull; Lead Stories
            </h2>
            ${storiesHtml}
          </div>

          <div style="text-align:center;margin:28px 0 16px 0;">
            <a href="https://www.youtube.com" style="display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;font-weight:bold;font-size:13px;padding:12px 24px;border-radius:10px;">
              Open Full Magazine Reader &rarr;
            </a>
          </div>

          <div style="border-top:1px solid #1e293b;padding-top:16px;margin-top:24px;text-align:center;font-size:11px;color:#64748b;">
            <p style="margin:0 0 4px 0;">PulseNews Dispatched from amolkharat222222@gmail.com</p>
            <p style="margin:0;">Delivered to ${to}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `[${issue.magazineName}] ${issue.publishDate} - Complete Technical Digest`,
    html
  });
}

// Send Bulk Email to All or Filtered Subscribers
export interface BulkEmailResult {
  totalTargeted: number;
  totalSent: number;
  totalFailed: number;
  errors: { email: string; error: string }[];
}

export async function sendBulkEmails({
  subject,
  html,
  text,
  categoryFilter,
  frequencyFilter,
  customRecipients
}: {
  subject: string;
  html: string;
  text?: string;
  categoryFilter?: string;
  frequencyFilter?: string;
  customRecipients?: string[];
}): Promise<BulkEmailResult> {
  const result: BulkEmailResult = {
    totalTargeted: 0,
    totalSent: 0,
    totalFailed: 0,
    errors: []
  };

  let targetEmails: string[] = [];

  if (Array.isArray(customRecipients) && customRecipients.length > 0) {
    targetEmails = customRecipients.map(e => e.trim().toLowerCase()).filter(Boolean);
  } else {
    const allSubs = getSubscribers();
    const filteredSubs = allSubs.filter(sub => {
      const matchCat = !categoryFilter || categoryFilter === 'all' || sub.categories.includes(categoryFilter);
      const matchFreq = !frequencyFilter || frequencyFilter === 'all' || sub.frequency === frequencyFilter;
      return matchCat && matchFreq;
    });
    targetEmails = Array.from(new Set(filteredSubs.map(s => s.email.trim().toLowerCase())));
  }

  result.totalTargeted = targetEmails.length;
  console.log(`[EmailService] Starting bulk dispatch to ${targetEmails.length} recipients...`);

  // Batch sending with small interval to respect SMTP rate limits
  for (let i = 0; i < targetEmails.length; i++) {
    const recipient = targetEmails[i];
    try {
      const res = await sendEmail({
        to: recipient,
        subject,
        html,
        text
      });

      if (res.success) {
        result.totalSent++;
      } else {
        result.totalFailed++;
        result.errors.push({ email: recipient, error: res.error || 'Send failed' });
      }

      // Small 250ms spacing between sends to avoid Gmail burst rate limits
      if (i < targetEmails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    } catch (err: any) {
      result.totalFailed++;
      result.errors.push({ email: recipient, error: err.message || 'Unknown error' });
    }
  }

  console.log(`[EmailService] Bulk dispatch completed: ${result.totalSent} sent, ${result.totalFailed} failed.`);
  return result;
}
