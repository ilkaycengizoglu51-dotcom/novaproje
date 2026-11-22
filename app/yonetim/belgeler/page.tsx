import { q } from '@/lib/db';
import { allProjects } from '@/lib/data';
import DocCard from '@/components/DocCard';
import { DocRequestForm } from '@/components/AdminForms';
import { PageTitle } from '@/components/Shell';
const F: [string, string][] = [['hepsi', 'Tümü'], ['yuklendi', 'İncelenecek'], ['bekliyor', 'Bekleyen'], ['reddedildi', 'İade'], ['onaylandi', 'Onaylı']];
export default async function Docs({ searchParams }: { searchParams: { d?: string } }) {
  const f = F.some(([k]) => k === searchParams.d) ? searchParams.d! : 'hepsi';
  const [all, ps] = await Promise.all([q(`SELECT r.*, to_char(r.due_date,'YYYY-MM-DD') AS due_date, p.name AS project_name, CASE WHEN u.role = 'contractor' THEN u.name || ' (taşeron)' ELSE u.name END AS client_name FROM doc_requests r JOIN projects p ON p.id = r.project_id JOIN users u ON u.id = r.client_id ORDER BY r.created_at DESC`), allProjects()]);
  const list = all.filter((r) => f === 'hepsi' || r.status === f), cnt = (s: string) => all.filter((r) => r.status === s).length;
  const files = list.length ? await q(`SELECT d.request_id, f.id, f.name, f.size, f.created_at FROM doc_files d JOIN files f ON f.id = d.file_id WHERE d.request_id = ANY($1::int[]) ORDER BY f.created_at`, [list.map((r) => r.id)]) : [];
  return (
    <><PageTitle title="Belgeler" />
      <dl className="kpis"><div className="kpi dark"><dt>İncelenmeyi bekleyen</dt><dd>{cnt('yuklendi')}</dd></div><div className="kpi"><dt>Yükleme bekleyen</dt><dd>{cnt('bekliyor')}</dd></div><div className="kpi"><dt>İade edilen</dt><dd>{cnt('reddedildi')}</dd></div><div className="kpi"><dt>Onaylanan</dt><dd>{cnt('onaylandi')}</dd></div></dl>
      <DocRequestForm projects={ps} />
      <section className="card"><div className="card-head"><h2>Talepler</h2><nav className="toolbar" aria-label="Duruma göre filtrele">{F.map(([k, v]) => <a key={k} className="chipb" aria-current={f === k ? "page" : undefined} href={`?d=${k}`}>{v}</a>)}</nav></div>
        {list.length ? <ul className="req-list">{list.map((r) => <DocCard key={r.id} r={r} files={files.filter((x) => x.request_id === r.id)} admin />)}</ul> : <p className="muted">Bu filtrede talep yok.</p>}</section>
    </>
  );
}
