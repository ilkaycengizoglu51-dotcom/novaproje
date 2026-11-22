import Link from 'next/link';
import { requireClient } from '@/lib/auth';
import { q } from '@/lib/db';
import { date } from '@/lib/format';
import { CPill, Icon } from '@/components/ui';
import { PageTitle } from '@/components/Shell';
export default async function Contracts() {
  const u = await requireClient();
  const l = await q(`SELECT c.id, c.title, c.status, c.version, c.sent_at, p.name AS project FROM contracts c JOIN projects p ON p.id = c.project_id WHERE c.client_id = $1 AND c.status <> 'taslak' ORDER BY c.sent_at DESC NULLS LAST`, [u.id]);
  return <><PageTitle title="Sözleşmeler" />{l.length ? <ul className="doc-list">{l.map((c) => <li key={c.id} className="doc-row"><span className="doc-ic" aria-hidden="true"><Icon n="file" /></span><div className="doc-main"><b>{c.title}</b><small>{c.project} · Sürüm {c.version} · Gönderim {date(c.sent_at && new Date(c.sent_at).toISOString())}</small></div><CPill s={c.status} /><Link className={`btn ${c.status === 'gonderildi' ? 'btn-ink' : 'btn-ghost2'} btn-sm`} href={`/panel/sozlesmeler/${c.id}`}>{c.status === 'gonderildi' ? 'İncele ve imzala' : 'Görüntüle'}</Link></li>)}</ul> : <section className="card"><p className="muted">Size iletilmiş bir sözleşme bulunmuyor.</p></section>}</>;
}
