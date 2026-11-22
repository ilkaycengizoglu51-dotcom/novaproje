import { q } from '@/lib/db';
import { PACKAGES, packagesFor, pctOf } from '@/lib/training';
import { PkgCard } from './Training';
/** Package previews + each client's progress on their own packages. managerId limits to that manager's clients. */
export default async function TrainingAdmin({ base, managerId }: { base: string; managerId?: number }) {
  const cl = await q(`SELECT u.id, u.name, COALESCE(array_agg(p.type) FILTER (WHERE p.type IS NOT NULL), '{}') AS types FROM users u LEFT JOIN projects p ON p.client_id = u.id
    WHERE u.role = 'client' AND u.active ${managerId ? 'AND u.manager_id = $1' : ''} GROUP BY u.id ORDER BY u.name`, managerId ? [managerId] : []);
  const pr = cl.length ? await q('SELECT user_id, item FROM training_progress WHERE user_id = ANY($1::int[])', [cl.map((c) => c.id)]) : [];
  return (<>
    <section className="card"><h2>Eğitim paketleri</h2><p className="muted">Danışanlara projelerinin tesis tipine göre otomatik atanır: herkese “Projeniz adım adım” ve “Hibe ve destek” paketleri, ayrıca sektör paketi.</p>
      <div className="tpk-grid">{PACKAGES.map((p) => <PkgCard key={p.key} p={p} href={`${base}/${p.key}`} />)}</div></section>
    <section className="card"><h2>Danışanların ilerlemesi</h2>{cl.length ? <div className="tw"><table className="tb"><thead><tr><th scope="col">Danışan</th><th scope="col">Atanan paketler</th></tr></thead>
      <tbody>{cl.map((c) => { const done = new Set(pr.filter((x) => x.user_id === c.id).map((x) => x.item)); return (
        <tr key={c.id}><td>{c.name}</td><td><div className="tv-mini">{packagesFor(c.types).map((p) => { const v = pctOf(p, done); return <span key={p.key} className={v === 100 ? 'ok' : ''}>{p.title}<em>%{v}</em></span>; })}</div></td></tr>); })}</tbody></table></div> : <p className="muted">Henüz danışan yok.</p>}</section>
  </>);
}
