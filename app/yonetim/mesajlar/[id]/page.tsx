import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one, q } from '@/lib/db';
import { initials } from '@/lib/format';
import { threadOf } from '@/lib/messages';
import Inbox from '@/components/Inbox';
import Chat from '@/components/Chat';
import { PageTitle } from '@/components/Shell';
export const dynamic = 'force-dynamic';
export default async function Thread({ params, searchParams }: { params: { id: string }; searchParams: { q?: string } }) {
  const cid = Number(params.id); const c = await one(`SELECT id, name, email FROM users WHERE id = $1 AND role = 'client'`, [cid]); if (!c) notFound();
  const [list, ps] = await Promise.all([threadOf(cid), q('SELECT id, name FROM projects WHERE client_id = $1', [cid])]);
  await q(`UPDATE messages SET read_at = now() WHERE client_id = $1 AND sender = 'client' AND read_at IS NULL`, [cid]);
  const head = <div className="chat-head"><span className="av" aria-hidden="true">{initials(c.name)}</span><div><b>{c.name}</b><small>{c.email} · {ps.length ? ps.map((p, i) => <span key={p.id}>{i ? ', ' : ''}<Link href={`/yonetim/projeler/${p.id}`}>{p.name}</Link></span>) : 'Proje yok'}</small></div></div>;
  return (<><PageTitle title="Mesajlar" /><div className="inbox has-sel"><Inbox sel={cid} term={(searchParams.q || '').trim()} /><div className="ib-chat"><Link className="crumb ib-back" href="/yonetim/mesajlar">‹ Tüm mesajlar</Link><Chat clientId={cid} role="admin" initial={JSON.parse(JSON.stringify(list))} head={head} /></div></div></>);
}
