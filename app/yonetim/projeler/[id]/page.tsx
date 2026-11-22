import Link from 'next/link';
import { notFound } from 'next/navigation';
import { q } from '@/lib/db';
import { installments, milestones, project, updates } from '@/lib/data';
import { MS, date } from '@/lib/format';
import { Badge, CPill, DPill, Kpis, PayTable, WPill } from '@/components/ui';
import { PageTitle } from '@/components/Shell';
import ProjectFields from '@/components/ProjectFields';
import PlanForms from '@/components/PlanForms';
import { Submit } from '@/components/client-bits';
import MediaUpload from '@/components/MediaUpload';
import Gallery from '@/components/Gallery';
import { mediaOfProject } from '@/lib/media';
import { setProgress, addMilestone, addUpdate, createContract, deleteInstallment, deleteMilestone, deleteProject, deleteUpdate, setMilestone, togglePaid, updateProject } from '@/app/actions/admin';

export default async function AdminProject({ params }: { params: { id: string } }) {
  const p = await project(Number(params.id)); if (!p) notFound();
  const [ms, ups, inst, clients, cs, ds] = await Promise.all([milestones(p.id), updates(p.id), installments(p.id), q(`SELECT id, name, username FROM users WHERE role = 'client' ORDER BY name`),
    q('SELECT id, title, status, version FROM contracts WHERE project_id = $1 ORDER BY created_at DESC', [p.id]), q('SELECT id, title, status FROM doc_requests WHERE project_id = $1 ORDER BY created_at', [p.id])]);
  const [media, mgr, wps] = await Promise.all([mediaOfProject(p.id, 'admin'), q('SELECT manager_id FROM users WHERE id = $1', [p.client_id]), q(`SELECT w.id, w.trade, w.title, w.status, u.name, u.company FROM work_packages w JOIN users u ON u.id = w.contractor_id WHERE w.project_id = $1 ORDER BY w.created_at`, [p.id])]);
  const suggested = ms.length ? Math.round((ms.filter((m) => m.status === 'tamam').length + ms.filter((m) => m.status === 'devam').length * 0.5) / ms.length * 100) : null;
  const H = ({ children, ...r }: any) => <input type="hidden" {...r} />;
  return (
    <>
      <PageTitle title={p.name} crumb={{ href: '/yonetim/projeler', label: 'Projeler' }} />
      <div className="toolbar"><Badge s={p.status} /><span className="muted">Danışan: {p.client_name}</span><Link className="btn btn-ghost2 btn-sm" href={`/yonetim/mesajlar/${p.client_id}`}>Danışana yaz</Link></div>
      <section className="card"><h2>Proje bilgileri</h2><form className="af" action={updateProject}><H name="id" value={p.id} /><ProjectFields p={p} clients={clients} /><div className="wide"><Submit pending="Kaydediliyor">Kaydet</Submit></div></form></section>
      <div className="grid2">
        <section className="card"><h2>İş programı</h2>{!ms.length && <p className="muted">Aşama ekleyerek danışana iş programını gösterin.</p>}
          {suggested !== null && suggested !== p.progress && <form action={setProgress} className="sugg"><input type="hidden" name="id" value={p.id} /><input type="hidden" name="progress" value={suggested} /><span>İş programına göre önerilen ilerleme <b>%{suggested}</b> (şu an %{p.progress})</span><Submit className="btn btn-ghost2 btn-sm">Uygula</Submit></form>}
          <ul className="elist">{ms.map((m) => <li key={m.id}><div><b>{m.title}</b><p className="muted" style={{ fontSize: 13 }}>{MS[m.status]}{m.due_date ? ' · Hedef: ' + date(m.due_date) : ''}</p></div>
            <div className="toolbar">{['bekliyor', 'devam', 'tamam'].map((st) => <form key={st} action={setMilestone} className="inline-form"><H name="id" value={m.id} /><H name="status" value={st} /><button type="submit" className="chipb" aria-pressed={m.status === st}>{MS[st]}</button></form>)}
              <form action={deleteMilestone} className="inline-form"><H name="id" value={m.id} /><Submit className="btn-link red" confirm="Bu aşama silinsin mi?">Sil</Submit></form></div></li>)}</ul>
          <form className="af" action={addMilestone}><H name="project" value={p.id} /><div className="field"><label htmlFor="ms-t">Yeni aşama</label><input id="ms-t" name="title" placeholder="Örn. Yapı ruhsatı alındı" required /></div><div className="field"><label htmlFor="ms-d">Hedef tarih</label><input id="ms-d" name="due" type="date" /></div><div className="wide"><Submit className="btn btn-ghost2 btn-sm">Aşama ekle</Submit></div></form></section>
        <section className="card"><h2>Güncelleme paylaş</h2><p className="hint">Danışan panelinde görünür ve e-postayla bildirilir.</p>
          <form className="af" action={addUpdate}><H name="project" value={p.id} /><div className="field wide"><label htmlFor="up-t">Başlık</label><input id="up-t" name="title" required placeholder="Örn. Temel betonu döküldü" /></div><div className="field wide"><label htmlFor="up-b">Açıklama</label><textarea id="up-b" name="body" rows={3} required /></div><div className="wide"><Submit className="btn btn-ink btn-sm" pending="Paylaşılıyor">Danışanla paylaş</Submit></div></form>
          <ul className="elist">{ups.map((u) => <li key={u.id}><div><b>{u.title}</b><p className="muted" style={{ fontSize: 13 }}>{date(new Date(u.created_at).toISOString())} · {u.body}</p></div><form action={deleteUpdate} className="inline-form"><H name="id" value={u.id} /><Submit className="btn-link red" confirm="Bu güncelleme silinsin mi?">Sil</Submit></form></li>)}</ul></section>
      </div>
      <section className="card" id="taseron"><div className="card-head"><h2>Taşeron işleri</h2><Link className="btn btn-ghost2 btn-sm" href="/yonetim/taseronlar">Taşeronları yönet</Link></div>
        {wps.length ? <ul className="doc-list">{wps.map((w) => <li key={w.id} className="doc-row"><div className="doc-main"><b>{w.title}</b><small>{w.trade} · {w.company || w.name}</small></div><WPill s={w.status} /></li>)}</ul> : <p className="muted">Bu projede taşerona atanmış iş yok.</p>}</section>
      <section className="card" id="gorseller"><div className="card-head"><h2>Aşama görselleri</h2><span className="muted">{media.length} görsel</span></div>
        <p className="muted">Sahadan fotoğrafları veya 3D görselleri aşamaya bağlayarak yükleyin; danışana ve portföy yöneticisine gösterip göstermemeyi seçin.</p>
        <MediaUpload pid={p.id} milestones={ms.map((m) => ({ id: m.id, title: m.title }))} hasManager={!!mgr[0]?.manager_id} />
        <div style={{ marginTop: 20 }}><Gallery items={JSON.parse(JSON.stringify(media))} admin empty="Bu projeye henüz görsel yüklenmedi." /></div></section>
      <section className="card"><h2>Ödeme planı</h2><Kpis list={inst} />
        <PayTable list={inst} actions={(i) => <><form action={togglePaid} className="inline-form"><H name="id" value={i.id} /><Submit className="btn-link">{i.paid_at ? 'Ödenmedi yap' : 'Ödendi işaretle'}</Submit></form><form action={deleteInstallment} className="inline-form"><H name="id" value={i.id} /><Submit className="btn-link red" confirm={`${i.no}. taksit silinsin mi?`}>Sil</Submit></form></>} />
        <PlanForms pid={p.id} /></section>
      <div className="grid2">
        <section className="card"><div className="card-head"><h2>Sözleşmeler</h2><form action={createContract} className="inline-form"><H name="project" value={p.id} /><Submit className="btn btn-ink btn-sm">Şablondan sözleşme oluştur</Submit></form></div>
          {cs.length ? <ul className="elist">{cs.map((c) => <li key={c.id}><Link href={`/yonetim/sozlesmeler/${c.id}`}>{c.title} · Sürüm {c.version}</Link><CPill s={c.status} /></li>)}</ul> : <p className="muted">Bu projede sözleşme yok.</p>}</section>
        <section className="card"><div className="card-head"><h2>Belgeler</h2><Link className="go" href="/yonetim/belgeler">Belge iste ›</Link></div>
          {ds.length ? <ul className="elist">{ds.map((d) => <li key={d.id}><span>{d.title}</span><DPill s={d.status} /></li>)}</ul> : <p className="muted">Bu projede belge talebi yok.</p>}</section>
      </div>
      <section className="card" style={{ borderColor: '#f3b8ae' }}><h2>Projeyi sil</h2><p className="muted">İş programı, güncellemeler, ödeme planı, sözleşmeler ve belgeler de kalıcı olarak silinir.</p><form action={deleteProject}><H name="id" value={p.id} /><Submit className="btn btn-red btn-sm" confirm={`"${p.name}" projesi kalıcı olarak silinsin mi?`}>Projeyi sil</Submit></form></section>
    </>
  );
}
