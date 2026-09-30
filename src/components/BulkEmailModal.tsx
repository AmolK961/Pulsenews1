import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Users, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Check, 
  Copy,
  Server,
  KeyRound,
  FileText
} from 'lucide-react';

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ isOpen, onClose }) => {
  const [smtpStatus, setSmtpStatus] = useState<{
    configured: boolean;
    host: string;
    port: string;
    user: string;
    from: string;
    tls: boolean;
  }>({
    configured: true,
    host: 'smtp.gmail.com',
    port: '587',
    user: 'amolkharat222222@gmail.com',
    from: 'PulseNews <amolkharat222222@gmail.com>',
    tls: true
  });

  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string; hint?: string } | null>(null);
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [customUserInput, setCustomUserInput] = useState('amolkharat222222@gmail.com');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);

  // Test email state
  const [testEmailAddress, setTestEmailAddress] = useState('amolkharat817@gmail.com');
  const [testingSend, setTestingSend] = useState(false);
  const [testSendResult, setTestSendResult] = useState<{ success: boolean; message: string; hint?: string } | null>(null);

  // Email form state
  const [targetAudience, setTargetAudience] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'custom'>('all');
  const [customEmails, setCustomEmails] = useState('');
  const [subject, setSubject] = useState('PulseNews Technical Digest & Market Briefing');
  const [messageBody, setMessageBody] = useState(
`Hello,

Here is your latest technical briefing from PulseNews.

Key Highlights:
1. Macro Capital Allocation & Enterprise Strategy
2. High-Performance Distributed Systems & Cloud Microservices
3. Clinical Advances & Surgical Oncology Protocols

Read the complete digital issues and watch our new video breakdown on YouTube with Content Ninja.

Best regards,
Amol Kharat
Lead Software Architect & Editorial Director`
  );

  const [sending, setSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  // Quick templates
  const TEMPLATES = [
    {
      label: '📰 New Magazine Release',
      subject: 'New Issue Published: Technical Journals for Business, Tech & Medicine',
      body: `Hello Subscriber,\n\nOur latest magazine issues are live:\n- Daily Edition (30 Verified News)\n- Weekly Digest (Top 60 Rated Stories)\n- Monthly Compendium (200 News Master Journal)\n\nEach edition includes a full Cover Page and indexed Table of Contents specifying exact article pages.\n\nRead your copy on the PulseNews Portal.\n\nWarm regards,\nPulseNews Editorial Team`
    },
    {
      label: '⚡ Content Ninja YouTube Partner',
      subject: 'New Technical Masterclass on YouTube: Content Ninja',
      body: `Hello Tech Community,\n\nWe just dropped a deep-dive architecture masterclass on the Content Ninja YouTube Channel covering reactive state management, offline-first caching, and Native Kotlin Android pipelines.\n\nCheck out the video and subscribe for weekly technical releases!\n\nBest,\nAmol Kharat`
    },
    {
      label: '🚨 Breaking News Alert',
      subject: 'Urgent Market Bulletin: Key Policy & Financial Shifts',
      body: `Immediate Dispatch:\n\nMajor global developments have emerged across international financial corridors and technology infrastructure.\n\nVisit PulseNews now for live continuous updates, AI takeaways, and executive summaries.\n\nPulseNews Global Desk`
    }
  ];

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSubject(tpl.subject);
    setMessageBody(tpl.body);
  };

  const handleTestSmtp = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const payload: any = {};
      if (customPasswordInput.trim()) {
        payload.password = customPasswordInput.trim();
      }

      const res = await fetch('/api/email/verify-smtp', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setVerifyResult({
        success: data.status === 'ok' || data.success,
        message: data.message || 'SMTP verified successfully!',
        hint: data.hint
      });
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: err.message || 'Verification connection failed'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSendTestEmail = async (target: string) => {
    setTestingSend(true);
    setTestSendResult(null);
    try {
      const res = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target })
      });
      const data = await res.json();
      setTestSendResult({
        success: data.status === 'ok',
        message: data.message || (data.status === 'ok' ? 'Test email dispatched successfully' : 'Test dispatch failed'),
        hint: data.hint
      });
    } catch (err: any) {
      setTestSendResult({
        success: false,
        message: err.message || 'Failed to dispatch test email'
      });
    } finally {
      setTestingSend(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!customPasswordInput.trim()) return;
    setSavingCredentials(true);
    setVerifyResult(null);
    try {
      const res = await fetch('/api/email/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: customUserInput.trim(),
          password: customPasswordInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setSmtpStatus(prev => ({ ...prev, user: data.user }));
        setVerifyResult({
          success: true,
          message: data.message || 'Credentials updated and verified successfully!'
        });
      } else {
        setVerifyResult({
          success: false,
          message: data.message || 'Failed to verify new credentials',
          hint: data.hint
        });
      }
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: err.message || 'Network error while saving credentials'
      });
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !messageBody.trim()) return;

    setSending(true);
    setDispatchResult(null);

    try {
      const formattedHtml = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#090d16;color:#f8fafc;padding:32px 16px;">
          <div style="max-width:600px;margin:0 auto;background:#0f172a;border-radius:16px;border:1px solid #1e293b;padding:32px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <div style="border-bottom:1px solid #1e293b;padding-bottom:16px;margin-bottom:20px;">
              <h1 style="color:#ffffff;font-size:22px;margin:0 0 4px 0;">PulseNews Dispatches</h1>
              <p style="color:#e11d48;font-size:12px;font-weight:bold;margin:0;text-transform:uppercase;">Official Editorial Broadcast</p>
            </div>
            <div style="font-size:14px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">
${messageBody}
            </div>
            <div style="border-top:1px solid #1e293b;padding-top:16px;margin-top:24px;text-align:center;font-size:11px;color:#64748b;">
              <p style="margin:0 0 4px 0;">Sent via PulseNews Gmail SMTP (amolkharat222222@gmail.com)</p>
              <p style="margin:0;">You are receiving this broadcast as a verified PulseNews subscriber.</p>
            </div>
          </div>
        </div>
      `;

      let payload: any = {
        subject,
        html: formattedHtml,
        text: messageBody
      };

      if (targetAudience === 'custom') {
        payload.customRecipients = customEmails.split(',').map(e => e.trim()).filter(Boolean);
      } else if (targetAudience !== 'all') {
        payload.frequencyFilter = targetAudience;
      }

      const res = await fetch('/api/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to dispatch bulk email');
      }

      setDispatchResult({
        success: true,
        message: data.message || 'Bulk email broadcast sent successfully!',
        data: data.data
      });
    } catch (err: any) {
      setDispatchResult({
        success: false,
        message: err.message || 'Bulk email dispatch failed'
      });
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-indigo-500/20 to-amber-500/20 text-white border border-rose-500/30">
              <Mail className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>SMTP Bulk Email Dispatcher</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Gmail TLS (587) Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connected to <strong>amolkharat222222@gmail.com</strong> for sending bulk newsletters &amp; magazine releases
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40 space-y-6">
          
          {/* SMTP Credentials Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Current SMTP Configuration
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestSmtp}
                  disabled={verifying}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
                  <span>{verifying ? 'Testing SMTP...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Host</span>
                <span className="font-mono font-semibold text-slate-200">smtp.gmail.com</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Port &amp; Security</span>
                <span className="font-mono font-semibold text-slate-200">587 (STARTTLS)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 col-span-2">
                <span className="text-[10px] text-slate-500 block">Sender User</span>
                <span className="font-mono font-semibold text-rose-400 truncate block">amolkharat222222@gmail.com</span>
              </div>
            </div>

            {verifyResult && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                verifyResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2 font-semibold">
                  {verifyResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{verifyResult.message}</span>
                </div>
                {verifyResult.hint && (
                  <p className="text-[11px] text-slate-300 pl-6 leading-relaxed">
                    💡 <strong>Tip:</strong> {verifyResult.hint}
                  </p>
                )}
              </div>
            )}

            {/* Instant Test Email Box */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-rose-400" />
                <span>Send Instant Test Email</span>
              </span>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="amolkharat817@gmail.com"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleSendTestEmail(testEmailAddress)}
                  disabled={testingSend || !testEmailAddress.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Send className={`w-3.5 h-3.5 ${testingSend ? 'animate-pulse' : ''}`} />
                  <span>{testingSend ? 'Sending Test...' : 'Send Test Email'}</span>
                </button>
              </div>

              {testSendResult && (
                <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                  testSendResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {testSendResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    <span>{testSendResult.message}</span>
                  </div>
                  {testSendResult.hint && (
                    <p className="text-[11px] text-slate-300 pl-6 leading-relaxed">
                      💡 {testSendResult.hint}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Password Test Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowPasswordInput(!showPasswordInput)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{showPasswordInput ? '▲ Hide Gmail App Password Setup' : '▼ Update / Fix Gmail App Password (BadCredentials Help)'}</span>
              </button>

              {showPasswordInput && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">
                      How to generate a working Google App Password:
                    </span>
                    <ol className="text-[11px] text-slate-400 list-decimal list-inside space-y-1">
                      <li>Go to your Google Account Security: <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-amber-400 underline">myaccount.google.com/security</a></li>
                      <li>Ensure <strong>2-Step Verification</strong> is switched <strong>ON</strong>.</li>
                      <li>Open <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-amber-400 underline">myaccount.google.com/apppasswords</a>.</li>
                      <li>Under &quot;App name&quot;, type <code>PulseNews</code> and click <strong>Create</strong>.</li>
                      <li>Copy the generated 16-character code (e.g. <code>xxxx xxxx xxxx xxxx</code>) and paste below.</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Sender Gmail Account</label>
                      <input
                        type="email"
                        value={customUserInput}
                        onChange={(e) => setCustomUserInput(e.target.value)}
                        placeholder="amolkharat222222@gmail.com"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">16-Character App Password</label>
                      <input
                        type="text"
                        value={customPasswordInput}
                        onChange={(e) => setCustomPasswordInput(e.target.value)}
                        placeholder="e.g. abcd efgh ijkl mnop"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleTestSmtp}
                      disabled={verifying}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      {verifying ? 'Testing...' : 'Test Without Saving'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCredentials}
                      disabled={savingCredentials || !customPasswordInput.trim()}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      {savingCredentials ? 'Verifying & Saving...' : 'Verify & Save to PulseNews'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Preset Templates */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              1-Click Message Templates
            </span>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Email Composer Form */}
          <form onSubmit={handleSendBulk} className="space-y-4">
            {/* Target Audience */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Target Recipients *</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 'all', label: 'All Subscribers' },
                  { id: 'daily', label: 'Daily (30 News)' },
                  { id: 'weekly', label: 'Weekly (Top 60)' },
                  { id: 'monthly', label: 'Monthly (200 News)' },
                  { id: 'custom', label: 'Custom List' }
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setTargetAudience(aud.id as any)}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition cursor-pointer ${
                      targetAudience === aud.id
                        ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {aud.label}
                  </button>
                ))}
              </div>

              {targetAudience === 'custom' && (
                <input
                  type="text"
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  placeholder="Enter comma-separated emails (e.g. reader1@domain.com, reader2@domain.com)..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 mt-2"
                />
              )}
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Email Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. PulseNews Special Edition"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Message Content (Formatted automatically into executive HTML email) *
              </label>
              <textarea
                rows={7}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono leading-relaxed"
              />
            </div>

            {/* Dispatch Result Status */}
            {dispatchResult && (
              <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
                dispatchResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {dispatchResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{dispatchResult.message}</span>
                </div>
                {dispatchResult.data && (
                  <p className="text-[11px] text-slate-400">
                    Delivered via Gmail SMTP to {dispatchResult.data.totalSent} recipient(s).
                  </p>
                )}
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rate-limited to prevent Gmail spam flags</span>
              </span>

              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Dispatching Bulk Emails...' : 'Send Bulk Broadcast'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
