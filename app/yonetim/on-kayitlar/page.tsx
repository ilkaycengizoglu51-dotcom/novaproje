import Link from 'next/link';
import { q } from '@/lib/db';
import { dt } from '@/lib/format';
import { LeadPill } from '@/components/LeadSteps';
import { PageTitle } from '@/components/Shell';
export default async function AdminLeads() {
  const l = await q(`SELECT l.id, l.name, l.company, l.facility, l.location, l.status, l.updated_at, m.name AS mname FROM leads l JOIN users m ON m.id = l.manager_id
    ORDER BY CASE l.status WHEN 'gonderildi' THEN 0 WHEN 'inceleniyor' THEN 1 WHEN 'eksik' THEN 2 ELSE 3 END, l.updated_at DESC`);
  return (<><PageTitle title="Ön kayıtlar" /><section className="card"><h2>Portföy yöneticilerinden gelen ön kayıtlar</h2>
    {l.length ? <div className="tw"><table className="tb"><thead><tr><th scope="col">Danışan adayı</th><th scope="col">Tesis</th><th scope="col">Portföy yöneticisi</th><th scope="col">Durum</th><th scope="col">Son işlem</th></tr></thead>
      <tbody>{l.map((x) => <tr key={x.id}><td><Link href={`/yonetim/on-kayitlar/${x.id}`}>{x.name}</Link>{x.company && <small>{x.company}</small>}</td><td>{x.facility}<small>{x.location}</small></td><td>{x.mname}</td><td><LeadPill s={x.status} /></td><td>{dt(x.updated_at)}</td></tr>)}</tbody></table></div> : <p className="muted">Henüz ön kayıt yok.</p>}</section></>);
}
