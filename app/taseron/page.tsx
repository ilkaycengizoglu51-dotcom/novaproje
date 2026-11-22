import Link from 'next/link';
import { requireContractor } from '@/lib/auth';
import { q } from '@/lib/db';
import { DST, date } from '@/lib/format';
import { CPill, WPill } from '@/components/ui';
import { PageTitle } from '@/components/Shell';

export default async function ContractorHome() {
  const u = await requireContractor();
  const packs = await q(`SELECT w.id, w.trade, w.title, w.scope, w.status, to_char(w.start_date,'YYYY-MM-DD') AS start_date, to_char(w.due_date,'YYYY-MM-DD') AS due_date,
      p.name AS project, p.type, p.location FROM work_packages w JOIN projects p ON p.id = w.project_id
      WHERE w.contractor_id = $1 ORDER BY (w.status IN ('tamamlandi','iptal')), w.due_date NULLS LAST, w.created_at DESC`, [u.id]);
  const [cons, docs] = await Promise.all([
    q(`SELECT id, package_id, title, status FROM contracts WHERE client_id = $1 AND status <> 'taslak' ORDER BY created_at`, [u.id]),
    q(`SELECT package_id, status, count(*)::int AS n FROM doc_requests WHERE client_id = $1 GROUP BY package_id, status`, [u.id]),
  ]);
  const open = packs.filter((w) => ['atandi', 'devam'].includes(w.status)).length, sign = cons.filter((c) => c.status === 'gonderildi').length,
    todo = docs.filter((d) => ['bekliyor', 'reddedildi'].includes(d.status)).reduce((s, d) => s + d.n, 0);
  return (
    <><PageTitle title="İşlerim" />
      <p className="muted" style={{ maxWidth: '75ch' }}>NOVAPROJE tarafından size atanan işler aşağıda. Her işin sözleşmesini “Sözleşmeler” bölümünden imzalayabilir, istenen evrakı “Belgeler” bölümünden yükleyebilirsiniz.</p>
      <dl className="kpis"><div className="kpi dark"><dt>Açık iş</dt><dd>{open}</dd></div><div className="kpi"><dt>İmzanızı bekleyen</dt><dd>{sign}</dd></div><div className="kpi"><dt>Yüklenecek belge</dt><dd>{todo}</dd></div><div className="kpi"><dt>Toplam iş</dt><dd>{packs.length}</dd></div></dl>
      {packs.length ? <ul className="wp-list">{packs.map((w) => {
        const cs = cons.filter((c) => c.package_id === w.id), ds = docs.filter((d) => d.package_id === w.id && d.status !== 'onaylandi');
        return (
          <li key={w.id} className="wp">
            <div className="wp-head"><div><span className="wp-trade">{w.trade}</span><h3>{w.title}</h3></div><WPill s={w.status} /></div>
            <div className="wp-meta"><span>Proje: <b>{w.project}</b></span><span>Tür: <b>{w.type}</b></span>{w.location && <span>Konum: <b>{w.location}</b></span>}{(w.start_date || w.due_date) && <span>Süre: <b>{w.start_date ? date(w.start_date) : '—'} → {w.due_date ? date(w.due_date) : '—'}</b></span>}</div>
            {w.scope ? <><span className="wp-trade" style={{ color: 'var(--mute)' }}>Üstleneceğiniz iş</span><p className="wp-scope">{w.scope}</p></> : <p className="muted" style={{ margin: 0 }}>İşin ayrıntılı kapsamı sözleşmenizde yer alacak.</p>}
            {(cs.length > 0 || ds.length > 0) && <div className="wp-todo">
              {cs.map((c) => <Link key={c.id} href={`/taseron/sozlesmeler/${c.id}`} className={`btn ${c.status === 'gonderildi' ? 'btn-ink' : 'btn-ghost2'} btn-sm`}>{c.status === 'gonderildi' ? 'Sözleşmeyi incele ve imzala' : 'Sözleşme'} · <CPill s={c.status} signed="İmzaladınız" /></Link>)}
              {ds.map((d) => <Link key={d.status} href="/taseron/belgeler" className="btn btn-ghost2 btn-sm">{d.n} belge · {DST[d.status]}</Link>)}
            </div>}
          </li>);
      })}</ul> : <section className="card"><p className="muted">Size henüz atanmış bir iş yok. NOVAPROJE bir iş atadığında burada görünecek ve e-postayla bilgilendirileceksiniz.</p></section>}
    </>
  );
}
