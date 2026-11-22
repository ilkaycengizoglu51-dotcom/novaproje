/** Optional e-mail notifications through Resend's HTTP API. Without RESEND_API_KEY nothing is sent. */
export async function sendMail(to: string | null | undefined, subject: string, text: string) {
  if (!to) return;
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.info('[e-posta devre dışı]', to, subject); return; }
  try {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.MAIL_FROM || 'NOVAPROJE <bildirim@novaproje.com>', to: [to], subject, text }) });
    if (!r.ok) console.error('[e-posta]', r.status, await r.text());
  } catch (e) { console.error('[e-posta]', e); }
}
export const siteUrl = () => (process.env.SITE_URL || '').replace(/\/$/, '');
export const adminMail = () => process.env.ADMIN_NOTIFY_EMAIL || null;
