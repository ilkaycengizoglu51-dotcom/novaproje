import Link from 'next/link';
import { q } from '@/lib/db';
import { adminCounts, allInstallments, summary } from '@/lib/data';
import { dt, money, todayISO } from '@/lib/format';
import { PayTable } from '@/components/ui';
import { PageTitle } from '@/components/Shell';
export default async function AdminHome() {
  const [cl, pr, inst, c, msgs, act] = await Promise.all([
    q(`SELECT count(*) FILTER (WHERE active)::int AS a, count(*)::int AS t FROM users WHERE role = 'client'`),
    q(`SELECT count(*) FILTER (WHERE status <> 'tamamlandi')::int AS a, count(*)::int AS t FROM projects`),
    allInstallments(), adminCounts(),
    q(`SELECT m.client_id, m.body, m.created_at, m.read_at, u.name FROM messages m JOIN users u ON u.id = m.client_id WHERE m.sender = 'client' ORDER BY m.created_at DESC LIMIT 5`),
    q('SELECT at, who, what FROM activity ORDER BY at DESC LIMIT 8'),
  ]);
  const s = summary(inst), t = todayISO(), soon = inst.filter((i) => !i.paid_at && (Date.parse(i.due_date) - Date.parse(t)) / 864e5 <= 30);
  return (
    <>
      <PageTitle title="Genel bakış" />
      <dl className="kpis">
        <div className={`kpi ${c.msgs ? 'new-k' : ''}`}><dt>Okunmamış mesaj</dt><dd>{c.msgs}</dd><small><Link href="/yonetim/mesajlar">Gelen kutusu</Link></small></div>
        <div className="kpi dark"><dt>Aktif danışan</dt><dd>{cl[0].a}</dd><small>Toplam {cl[0].t} hesap · {pr[0].a} süren proje</small></div>
        <div className="kpi"><dt>Tahsil edilen</dt><dd>{money(s.paid)}</dd><small>Plan toplamı {money(s.total)}</small></div>
        <div className={`kpi ${s.od ? 'alert-k' : ''}`}><dt>Geciken</dt><dd>{money(s.odA)}</dd><small>{s.od} taksit</small></div>
      </dl>
      {(c.contracts || c.docs || c.quotes || c.leads || c.certs) > 0 && <section className="card todo"><h2>Sizi bekleyen işler</h2><ul className="todo-list">
        {c.leads > 0 && <li><span><b>{c.leads} ön kayıt</b> onayınızı bekliyor</span><Link className="btn btn-ink btn-sm" href="/yonetim/on-kayitlar">İncele</Link></li>}
        {c.contracts > 0 && <li><span><b>{c.contracts} sözleşme</b> karşı imza veya revizyon bekliyor</span><Link className="btn btn-ink btn-sm" href="/yonetim/sozlesmeler">Aç</Link></li>}
        {c.certs > 0 && <li><span><b>{c.certs} sertifika</b> onay bekliyor</span><Link className="btn btn-ink btn-sm" href="/yonetim/sertifikalar">İncele</Link></li>}
        {c.docs > 0 && <li><span><b>{c.docs} belge</b> incelenmeyi bekliyor</span><Link className="btn btn-ink btn-sm" href="/yonetim/belgeler">İncele</Link></li>}
        {c.quotes > 0 && <li><span><b>{c.quotes} yeni teklif talebi</b> var</span><Link className="btn btn-ink btn-sm" href="/yonetim/teklifler">Gör</Link></li>}</ul></section>}
      <div className="grid2">
        <section className="card"><div className="card-head"><h2>Geciken ve yaklaşan ödemeler</h2><Link className="go" href="/yonetim/tahsilat">Tümü ›</Link></div>{soon.length ? <PayTable list={soon} showProject linkBase="/yonetim/projeler/" /> : <p className="muted">Önümüzdeki 30 günde vadesi gelen ödeme yok.</p>}</section>
        <div style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
          <section className="card"><div className="card-head"><h2>Son mesajlar</h2><Link className="go" href="/yonetim/mesajlar">Gelen kutusu ›</Link></div>{msgs.length ? <ul className="log">{msgs.map((m, i) => <li key={i}><time>{dt(m.created_at)}</time><span><Link href={`/yonetim/mesajlar/${m.client_id}`}><b>{m.name}</b></Link>{!m.read_at && <> <span className="pill d-bekliyor">Yeni</span></>} · {String(m.body).slice(0, 80)}</span></li>)}</ul> : <p className="muted">Danışanlardan henüz mesaj yok.</p>}</section>
          <section className="card"><div className="card-head"><h2>Son işlemler</h2><Link className="go" href="/yonetim/kayit">Tümü ›</Link></div><ul className="log">{act.map((a, i) => <li key={i}><time>{dt(a.at)}</time><span><b>{a.who}</b> · {a.what}</span></li>)}</ul></section>
        </div>
      </div>
    </>
  );
}
