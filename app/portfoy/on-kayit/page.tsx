import Link from 'next/link';
import { requireManager } from '@/lib/auth';
import { q } from '@/lib/db';
import { dt } from '@/lib/format';
import { LeadPill } from '@/components/LeadSteps';
import { PageTitle } from '@/components/Shell';
export default async function Leads() {
  const u = await requireManager(); const l = await q('SELECT id, name, company, facility, location, status, updated_at FROM leads WHERE manager_id = $1 ORDER BY updated_at DESC', [u.id]);
  return (<><PageTitle title="Ön kayıtlarım" /><div className="toolbar"><Link className="btn btn-ink btn-sm" href="/portfoy/on-kayit/yeni">Yeni ön kayıt</Link></div>
    <section className="card">{l.length ? <div className="tw"><table className="tb"><thead><tr><th scope="col">Danışan adayı</th><th scope="col">Tesis</th><th scope="col">Durum</th><th scope="col">Son işlem</th></tr></thead>
      <tbody>{l.map((x) => <tr key={x.id}><td><Link href={`/portfoy/on-kayit/${x.id}`}>{x.name}</Link>{x.company && <small>{x.company}</small>}</td><td>{x.facility}<small>{x.location}</small></td><td><LeadPill s={x.status} /></td><td>{dt(x.updated_at)}</td></tr>)}</tbody></table></div> : <p className="muted">Henüz ön kayıt yok.</p>}</section></>);
}
