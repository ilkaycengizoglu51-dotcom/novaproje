import { requireManager } from '@/lib/auth';
import { q } from '@/lib/db';
import { STATUS } from '@/lib/format';
import DocCard from '@/components/DocCard';
import { ClientDocForm } from '@/components/LeadForms';
import { PageTitle } from '@/components/Shell';
import { CertList } from '@/components/Certs';
import CertForm from '@/components/CertForm';
import Gallery from '@/components/Gallery';
import { mediaForManager } from '@/lib/media';
const ORDER = ['reddedildi', 'bekliyor', 'yuklendi', 'onaylandi'];
export default async function MyClients() {
  const u = await requireManager();
  const clients = await q(`SELECT c.id, c.name, c.email, (SELECT json_agg(json_build_object('name', p.name, 'status', p.status, 'progress', p.progress)) FROM projects p WHERE p.client_id = c.id) AS projects FROM users c WHERE c.manager_id = $1 AND c.role = 'client' ORDER BY c.name`, [u.id]);
  const reqs = clients.length ? await q(`SELECT r.*, to_char(r.due_date,'YYYY-MM-DD') AS due_date, p.name AS project_name, c.name AS client_name FROM doc_requests r JOIN projects p ON p.id = r.project_id JOIN users c ON c.id = r.client_id WHERE r.client_id = ANY($1::int[]) ORDER BY r.created_at`, [clients.map((c) => c.id)]) : [];
  reqs.sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));
  const certs = clients.length ? await q(`SELECT c.id, c.title, c.issuer, to_char(c.issued_at,'YYYY-MM-DD') AS issued_at, c.hours, c.file_id, c.status, c.reason, c.created_at, u.name AS client_name FROM certificates c JOIN users u ON u.id = c.client_id WHERE c.client_id = ANY($1::int[]) ORDER BY c.created_at DESC`, [clients.map((c) => c.id)]) : [];
  const media = await mediaForManager(u.id);
  const files = reqs.length ? await q(`SELECT d.request_id, f.id, f.name, f.size, f.created_at FROM doc_files d JOIN files f ON f.id = d.file_id WHERE d.request_id = ANY($1::int[])`, [reqs.map((r) => r.id)]) : [];
  return (<><PageTitle title="Danışanlarım" />
    {!clients.length ? <section className="card"><p className="muted">Onaylanmış danışanınız yok. Ön kayıtlarınız onaylandığında danışanlar burada görünür.</p></section> : <>
      <section className="card"><h2>Danışanlar</h2><div className="tw"><table className="tb"><thead><tr><th scope="col">Danışan</th><th scope="col">Proje</th><th scope="col">Bekleyen belge</th></tr></thead>
        <tbody>{clients.map((c) => <tr key={c.id}><td>{c.name}<small>{c.email}</small></td><td>{(c.projects || []).map((p: any, i: number) => <div key={i}>{p.name}<small>{STATUS[p.status]} · %{p.progress}</small></div>)}{!c.projects && '—'}</td><td>{reqs.filter((r) => r.client_id === c.id && ['bekliyor', 'reddedildi'].includes(r.status)).length}</td></tr>)}</tbody></table></div></section>
      <section className="card"><div className="card-head"><h2>Proje aşama görselleri</h2><span className="muted">{media.length} görsel</span></div><p className="muted">NOVAPROJE’nin sizinle paylaştığı, danışanlarınızın projelerinden görseller.</p><Gallery items={JSON.parse(JSON.stringify(media.map((m) => ({ ...m, ms_title: [m.client_name, m.ms_title].filter(Boolean).join(' · ') }))))} empty="Henüz sizinle paylaşılan görsel yok." /></section>
      <section className="card"><h2>Danışan adına belge ekle</h2><p className="muted">Eklediğiniz belgeler danışanın dosyasına girer ve NOVAPROJE tarafından incelenir.</p><ClientDocForm clients={clients} /></section>
      <section className="card"><h2>İstenen belgeler</h2><p className="muted">Yöneticinin danışanlarınızdan istediği belgeleri danışan adına buradan yükleyebilirsiniz.</p>
        {reqs.length ? <ul className="req-list">{reqs.map((r) => <DocCard key={r.id} r={r} files={files.filter((f) => f.request_id === r.id)} manager />)}</ul> : <p className="muted">Bekleyen belge talebi yok.</p>}</section>
      <section className="card"><h2>Eğitim sertifikaları</h2><p className="muted">Danışanlarınızın Tarım Orman Akademisi (<a href="https://akademi.tarimorman.gov.tr/" target="_blank" rel="noopener noreferrer">akademi.tarimorman.gov.tr</a>) ve diğer eğitim belgelerini danışan adına yükleyebilirsiniz.</p><CertForm clients={clients} /><div style={{ marginTop: 18 }}><CertList list={certs} /></div></section></>}
  </>);
}
