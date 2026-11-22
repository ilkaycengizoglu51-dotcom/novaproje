import Link from 'next/link';
import { q } from '@/lib/db';
import { hm, initials } from '@/lib/format';
export default async function Inbox({ sel, term }: { sel?: number; term: string }) {
  const rows = await q(`SELECT u.id, u.name, u.username, m.body, m.sender, m.created_at,
      (SELECT count(*)::int FROM messages x WHERE x.client_id = u.id AND x.sender = 'client' AND x.read_at IS NULL) AS unread
    FROM users u LEFT JOIN LATERAL (SELECT body, sender, created_at FROM messages WHERE client_id = u.id AND created_at <= now() ORDER BY id DESC LIMIT 1) m ON TRUE
    WHERE u.role = 'client' AND ($1 = '' OR u.name ILIKE '%'||$1||'%' OR u.username ILIKE '%'||$1||'%') ORDER BY m.created_at DESC NULLS LAST, u.name`, [term]);
  const today = new Date().toDateString();
  return (
    <aside className="ib-list card">
      <form className="toolbar" role="search"><label className="sr" htmlFor="mq">Danışan ara</label><input id="mq" name="q" type="search" placeholder="Danışan ara" defaultValue={term} /></form>
      <ul>{rows.map((r) => (
        <li key={r.id}><Link href={`/yonetim/mesajlar/${r.id}`} className={`ib-item ${r.id === sel ? 'on' : ''}`} aria-current={r.id === sel ? 'true' : undefined}>
          <span className="av" aria-hidden="true">{initials(r.name)}</span>
          <span className="ib-t"><b>{r.name}</b><small>{r.body ? (r.sender === 'admin' ? 'Siz: ' : '') + String(r.body).slice(0, 60) : 'Henüz mesaj yok'}</small></span>
          <span className="ib-r">{r.created_at && <time>{new Date(r.created_at).toDateString() === today ? hm(r.created_at) : new Date(r.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</time>}{r.unread > 0 && <span className="nb">{r.unread}</span>}</span>
        </Link></li>))}{!rows.length && <li className="muted" style={{ padding: 12 }}>Danışan bulunamadı.</li>}</ul>
    </aside>
  );
}
