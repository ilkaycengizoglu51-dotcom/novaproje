import Link from 'next/link';
import { q } from '@/lib/db';
import { DST, WST, date, dt } from '@/lib/format';
import { allProjects } from '@/lib/data';
import { CPill, WPill } from '@/components/ui';
import { PageTitle } from '@/components/Shell';
import { Submit } from '@/components/client-bits';
import { NewClientForm, ResetButton } from '@/components/ClientForms';
import { PackageDocsForm, PackageForm } from '@/components/ContractorForms';
import { packageContract, setPackage, toggleClient } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';
export default async function Contractors() {
  const [subs, packs, ps, taken] = await Promise.all([
    q(`SELECT u.*, (SELECT count(*)::int FROM work_packages w WHERE w.contractor_id = u.id AND w.status IN ('atandi','devam')) AS open,
       (SELECT count(*)::int FROM work_packages w WHERE w.contractor_id = u.id) AS total FROM users u WHERE role = 'contractor' ORDER BY u.created_at DESC`),
    q(`SELECT w.*, to_char(w.start_date,'YYYY-MM-DD') AS start_date, to_char(w.due_date,'YYYY-MM-DD') AS due_date, p.name AS project, u.name AS cname, u.company
       FROM work_packages w JOIN projects p ON p.id = w.project_id JOIN users u ON u.id = w.contractor_id ORDER BY (w.status IN ('tamamlandi','iptal')), w.created_at DESC`),
    allProjects(), q('SELECT username FROM users'),
  ]);
  const ids = packs.map((w) => w.id);
  const [cons, docs] = ids.length ? await Promise.all([
    q(`SELECT id, package_id, title, status FROM contracts WHERE package_id = ANY($1::int[]) ORDER BY created_at`, [ids]),
    q(`SELECT package_id, status, count(*)::int AS n FROM doc_requests WHERE package_id = ANY($1::int[]) GROUP BY package_id, status`, [ids]),
  ]) : [[], []];
  const active = subs.filter((s) => s.active);
  const kpi = { open: packs.filter((w) => ['atandi', 'devam'].includes(w.status)).length, sign: cons.filter((c) => ['gonderildi', 'imzalandi'].includes(c.status)).length, docs: docs.filter((d) => d.status === 'yuklendi').reduce((s, d) => s + d.n, 0) };
  const H = (p: any) => <input type="hidden" {...p} />;
  const projOpts = ps.map((p) => ({ id: p.id, name: p.name, sub: p.client_name })), subOpts = active.map((s) => ({ id: s.id, name: s.name, sub: s.company }));
  return (
    <><PageTitle title="Taşeronlar" />
      <p className="muted" style={{ maxWidth: '80ch' }}>Şantiye, elektrik, tesisat gibi işleri taşeronlara buradan atayın. Taşeron yalnızca kendisine atanan projeyi ve üstleneceği işi görür; iş sözleşmesini imzalar ve istenen belgeleri yükler. Danışanların kişisel bilgilerini, ödemelerini ve diğer işleri göremez.</p>
      <dl className="kpis"><div className="kpi dark"><dt>Açık iş</dt><dd>{kpi.open}</dd></div><div className="kpi"><dt>Aktif taşeron</dt><dd>{active.length}</dd></div><div className="kpi"><dt>İmzası süren sözleşme</dt><dd>{kpi.sign}</dd></div><div className="kpi"><dt>İncelenecek belge</dt><dd>{kpi.docs}</dd></div></dl>

      <section className="card"><div className="card-head"><h2>İş atamaları</h2><span className="muted">{packs.length} iş</span></div>
        {packs.length ? <ul className="wp-list">{packs.map((w) => {
          const cs = cons.filter((c) => c.package_id === w.id), ds = docs.filter((d) => d.package_id === w.id);
          return (
            <li key={w.id} className="wp">
              <div className="wp-head"><div><span className="wp-trade">{w.trade}</span><h3>{w.title}</h3></div><WPill s={w.status} /></div>
              <div className="wp-meta"><span>Proje: <Link href={`/yonetim/projeler/${w.project_id}`}><b>{w.project}</b></Link></span><span>Taşeron: <b>{w.company ? `${w.company} · ${w.cname}` : w.cname}</b></span>{(w.start_date || w.due_date) && <span>Süre: <b>{w.start_date ? date(w.start_date) : '—'} → {w.due_date ? date(w.due_date) : '—'}</b></span>}</div>
              {w.scope && <p className="wp-scope">{w.scope}</p>}
              <div className="wp-todo">
                {cs.map((c) => <Link key={c.id} href={`/yonetim/sozlesmeler/${c.id}`} className="chipb">Sözleşme: <CPill s={c.status} signed="Taşeron imzaladı" /></Link>)}
                {ds.map((d) => <Link key={d.status} href="/yonetim/belgeler" className="chipb">{d.n} belge · {DST[d.status]}</Link>)}
                {!cs.length && !ds.length && <span className="muted" style={{ fontSize: 14 }}>Henüz sözleşme veya belge talebi yok.</span>}
              </div>
              <div className="wp-forms">
                <div className="toolbar">
                  <form action={packageContract} className="inline-form"><H name="id" value={w.id} /><Submit className="btn btn-ink btn-sm" pending="Hazırlanıyor">Sözleşme hazırla</Submit></form>
                  <form action={setPackage} className="inline-form"><H name="id" value={w.id} /><label className="sr" htmlFor={`ws-${w.id}`}>Durum</label><select id={`ws-${w.id}`} name="act" defaultValue={w.status} className="sel-sm">{Object.entries(WST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select> <Submit className="btn btn-ghost2 btn-sm">Durumu kaydet</Submit></form>
                  <form action={setPackage} className="inline-form"><H name="id" value={w.id} /><H name="act" value="delete" /><Submit className="btn-link red" confirm={`“${w.title}” işi silinsin mi? Bağlı belge talepleri silinir, imzalanmamış sözleşmeler iptal edilir.`}>İşi sil</Submit></form>
                </div>
                <details><summary>Taşerondan belge iste</summary><PackageDocsForm id={w.id} /></details>
                <details><summary>İşi düzenle</summary>{subOpts.length ? <PackageForm projects={projOpts} contractors={subOpts.some((s) => s.id === w.contractor_id) ? subOpts : [...subOpts, { id: w.contractor_id, name: w.cname, sub: w.company }]} w={w} /> : null}</details>
              </div>
            </li>);
        })}</ul> : <p className="muted">Henüz atanmış iş yok. Aşağıdan ilk işi atayın.</p>}
      </section>

      <section className="card"><h2>Yeni iş ata</h2>
        {!ps.length ? <p className="muted">Önce bir proje oluşturun.</p> : !subOpts.length ? <p className="muted">Önce aşağıdan bir taşeron hesabı açın.</p> : <PackageForm projects={projOpts} contractors={subOpts} />}
      </section>

      <section className="card"><h2>Taşeron hesapları</h2>{subs.length ? <div className="tw"><table className="tb"><thead><tr><th scope="col">Taşeron</th><th scope="col">Kullanıcı adı</th><th scope="col" className="num">Açık iş</th><th scope="col">Son giriş</th><th scope="col"><span className="sr">İşlemler</span></th></tr></thead>
        <tbody>{subs.map((u) => <tr key={u.id} className={u.active ? '' : 'off'}><td>{u.company || u.name}<small>{u.company ? `${u.name} · ` : ''}{u.email}</small></td><td><code>{u.username}</code></td><td className="num">{u.open}<small>toplam {u.total}</small></td><td>{u.last_login_at ? dt(u.last_login_at) : 'Henüz giriş yapmadı'}{u.must_change_password && <small>Geçici şifre</small>}</td>
          <td><div className="acts"><ResetButton id={u.id} name={u.name} /><form action={toggleClient} className="inline-form"><H name="id" value={u.id} /><Submit className={`btn-link ${u.active ? 'red' : ''}`} confirm={u.active ? `${u.name} hesabı kapatılsın mı?` : undefined}>{u.active ? 'Hesabı kapat' : 'Hesabı aç'}</Submit></form></div></td></tr>)}</tbody></table></div> : <p className="muted">Henüz taşeron hesabı yok.</p>}</section>
      <NewClientForm taken={taken.map((r) => r.username)} role="contractor" />
    </>
  );
}
