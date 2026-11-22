import Link from 'next/link';
import { q } from '@/lib/db';
import { allProjects } from '@/lib/data';
import { Badge } from '@/components/ui';
import { PageTitle } from '@/components/Shell';
import ProjectFields from '@/components/ProjectFields';
import { Submit } from '@/components/client-bits';
import { createProject } from '@/app/actions/admin';
export default async function Projects() {
  const [ps, clients] = await Promise.all([allProjects(), q(`SELECT id, name, username FROM users WHERE role = 'client' AND active ORDER BY name`)]);
  return (
    <><PageTitle title="Projeler" />
      <section className="card"><h2>Projeler</h2>{ps.length ? <div className="tw"><table className="tb"><thead><tr><th scope="col">Proje</th><th scope="col">Danışan</th><th scope="col">Aşama</th><th scope="col" className="num">İlerleme</th></tr></thead>
        <tbody>{ps.map((p) => <tr key={p.id}><td><Link href={`/yonetim/projeler/${p.id}`}>{p.name}</Link><small>{p.type}</small></td><td>{p.client_name}</td><td><Badge s={p.status} /></td><td className="num">%{p.progress}</td></tr>)}</tbody></table></div> : <p className="muted">Henüz proje yok.</p>}</section>
      <section className="card"><h2>Yeni proje</h2>{clients.length ? <form className="af" action={createProject}><ProjectFields clients={clients} /><div className="wide"><Submit pending="Oluşturuluyor">Projeyi oluştur</Submit></div></form> : <p className="muted">Önce “Danışanlar” bölümünden bir danışan hesabı açın.</p>}</section>
    </>
  );
}
