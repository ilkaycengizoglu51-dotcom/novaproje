import Link from 'next/link';
import { q } from '@/lib/db';
import { dt } from '@/lib/format';
import { allProjects } from '@/lib/data';
import { CPill } from '@/components/ui';
import { PageTitle } from '@/components/Shell';
import { Submit } from '@/components/client-bits';
import { createContract } from '@/app/actions/admin';
export default async function Contracts() {
  const [l, ps] = await Promise.all([q(`SELECT c.id, c.title, c.status, c.version, p.name AS project, CASE WHEN u.role = 'contractor' THEN u.name || ' (taşeron)' ELSE u.name END AS client, (SELECT max(at) FROM contract_audit a WHERE a.contract_id = c.id) AS last FROM contracts c JOIN projects p ON p.id = c.project_id JOIN users u ON u.id = c.client_id ORDER BY last DESC NULLS LAST`), allProjects()]);
  return (
    <><PageTitle title="Sözleşmeler" />
      <section className="card"><h2>Sözleşmeler</h2>{l.length ? <div className="tw"><table className="tb"><thead><tr><th scope="col">Sözleşme</th><th scope="col">Karşı taraf</th><th scope="col">Durum</th><th scope="col">Son işlem</th></tr></thead>
        <tbody>{l.map((c) => <tr key={c.id}><td><Link href={`/yonetim/sozlesmeler/${c.id}`}>{c.title}</Link><small>{c.project} · Sürüm {c.version}</small></td><td>{c.client}</td><td><CPill s={c.status} /></td><td>{dt(c.last)}</td></tr>)}</tbody></table></div> : <p className="muted">Henüz sözleşme yok.</p>}</section>
      <section className="card"><h2>Yeni sözleşme</h2><p className="muted">Taşeron sözleşmeleri <Link href="/yonetim/taseronlar">Taşeronlar</Link> sayfasındaki işten hazırlanır. Proje seçildiğinde danışan adı, konum, bedel ve taksit planı şablona otomatik işlenir; metni sonra düzenleyebilirsiniz.</p>
        {ps.length ? <form className="af" action={createContract}><div className="field"><label htmlFor="nc-pr">Proje</label><select id="nc-pr" name="project">{ps.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.client_name}</option>)}</select></div><div className="field"><label htmlFor="nc-tt">Sözleşme adı</label><input id="nc-tt" name="title" defaultValue="Proje hizmet sözleşmesi" /></div><div className="wide"><Submit pending="Oluşturuluyor">Şablondan taslak oluştur</Submit></div></form> : <p className="muted">Önce bir proje oluşturun.</p>}</section>
    </>
  );
}
