import { requireClient } from '@/lib/auth';
import { q } from '@/lib/db';
import DocCard from '@/components/DocCard';
import { PageTitle } from '@/components/Shell';
const ORDER = ['reddedildi', 'bekliyor', 'yuklendi', 'onaylandi'];
export default async function Docs() {
  const u = await requireClient();
  const l = await q(`SELECT r.*, to_char(r.due_date,'YYYY-MM-DD') AS due_date, p.name AS project_name FROM doc_requests r JOIN projects p ON p.id = r.project_id WHERE r.client_id = $1 ORDER BY r.created_at`, [u.id]);
  l.sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));
  const files = l.length ? await q(`SELECT d.request_id, f.id, f.name, f.size, f.created_at FROM doc_files d JOIN files f ON f.id = d.file_id WHERE d.request_id = ANY($1::int[]) ORDER BY f.created_at`, [l.map((r) => r.id)]) : [];
  const done = l.filter((r) => r.status === 'onaylandi').length;
  return (
    <><PageTitle title="Belgelerim" />
      {l.length ? <>
        <section className="card"><div className="card-head"><h2>İstenen belgeler</h2><span className="muted">{done} / {l.length} onaylandı</span></div><div className="prog-track" aria-hidden="true"><span style={{ width: `${Math.round((done / l.length) * 100)}%` }} /></div>
          <p className="muted" style={{ fontSize: 14 }}>PDF, JPG, PNG veya WebP; dosya başına en fazla 10 MB. Dosyayı ilgili kutuya sürükleyip bırakabilir ya da seçebilirsiniz.</p></section>
        <ul className="req-list">{l.map((r) => <DocCard key={r.id} r={r} files={files.filter((f) => f.request_id === r.id)} />)}</ul></>
        : <section className="card"><p className="muted">Sizden istenen bir belge bulunmuyor.</p></section>}
    </>
  );
}
