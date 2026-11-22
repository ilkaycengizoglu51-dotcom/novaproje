import { q } from '@/lib/db';
import { AkademiCard, CertList } from '@/components/Certs';
import { PageTitle } from '@/components/Shell';
const F: [string, string][] = [['hepsi', 'Tümü'], ['inceleniyor', 'İncelenecek'], ['onaylandi', 'Onaylı'], ['reddedildi', 'İade']];
export default async function AdminCerts({ searchParams }: { searchParams: { d?: string } }) {
  const f = F.some(([k]) => k === searchParams.d) ? searchParams.d! : 'hepsi';
  const all = await q(`SELECT c.id, c.title, c.issuer, to_char(c.issued_at,'YYYY-MM-DD') AS issued_at, c.hours, c.file_id, c.status, c.reason, c.created_at, u.name AS client_name, m.name AS manager_name
    FROM certificates c JOIN users u ON u.id = c.client_id LEFT JOIN users m ON m.id = u.manager_id ORDER BY CASE c.status WHEN 'inceleniyor' THEN 0 ELSE 1 END, c.created_at DESC`);
  const list = all.filter((c) => f === 'hepsi' || c.status === f), n = (s: string) => all.filter((c) => c.status === s).length;
  return (<>
    <PageTitle title="Sertifikalar" />
    <dl className="kpis"><div className="kpi dark"><dt>İncelenecek</dt><dd>{n('inceleniyor')}</dd></div><div className="kpi"><dt>Onaylı</dt><dd>{n('onaylandi')}</dd></div><div className="kpi"><dt>İade</dt><dd>{n('reddedildi')}</dd></div><div className="kpi"><dt>Toplam</dt><dd>{all.length}</dd></div></dl>
    <section className="card"><div className="card-head"><h2>Danışan sertifikaları</h2><nav className="toolbar" aria-label="Duruma göre filtrele">{F.map(([k, v]) => <a key={k} className="chipb" aria-current={f === k ? 'page' : undefined} href={`?d=${k}`}>{v}</a>)}</nav></div><CertList list={list} admin /></section>
    <AkademiCard compact />
  </>);
}
