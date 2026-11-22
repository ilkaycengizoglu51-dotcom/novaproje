import { q } from '@/lib/db';
import { fsize } from '@/lib/format';
import { Icon } from './ui';
import { LeadPill, LeadSteps, Timeline } from './LeadSteps';
export default async function LeadDetail({ l }: { l: any }) {
  const [ev, files] = await Promise.all([q('SELECT at, who, what FROM lead_events WHERE lead_id = $1 ORDER BY at', [l.id]), q('SELECT f.id, f.name, f.size FROM lead_files lf JOIN files f ON f.id = lf.file_id WHERE lf.lead_id = $1 ORDER BY f.created_at', [l.id])]);
  const row = (k: string, v: any) => v ? <div><dt>{k}</dt><dd>{v}</dd></div> : null;
  return (<>
    <div className="toolbar"><LeadPill s={l.status} />{l.mname && <span className="muted">Portföy yöneticisi: {l.mname}</span>}</div>
    <LeadSteps status={l.status} />
    {l.status === 'eksik' && l.admin_note && <div className="alert info"><b>Yöneticiden istenen:</b> {l.admin_note}</div>}
    {l.status === 'reddedildi' && l.admin_note && <div className="alert err"><b>Neden:</b> {l.admin_note}</div>}
    {l.status === 'onaylandi' && <div className="alert ok">Onaylandı; danışan hesabı açıldı.{l.admin_note ? ' Not: ' + l.admin_note : ''}</div>}
    <div className="grid2">
      <section className="card"><h2>Bilgiler</h2><dl className="meta3" style={{ gridTemplateColumns: '1fr 1fr' }}>{row('Ad soyad', l.name)}{row('Firma', l.company)}{row('E-posta', l.email)}{row('Telefon', l.phone)}{row('Tesis tipi', l.facility)}{row('Konum', l.location)}{row('Ada / parsel', l.parcel)}{row('Kapasite', l.capacity)}{row('Tahmini bütçe', l.budget)}</dl>{l.notes && <p className="req-note" style={{ whiteSpace: 'pre-wrap' }}>{l.notes}</p>}</section>
      <div style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
        <section className="card"><h2>Belgeler</h2>{files.length ? <ul className="files">{files.map((f) => <li key={f.id}><Icon n="file" /><span className="fn">{f.name}</span><small>{fsize(f.size)}</small><a className="lb" href={`/api/dosya/${f.id}`} target="_blank" rel="noopener">Görüntüle</a></li>)}</ul> : <p className="muted">Belge eklenmedi.</p>}</section>
        <section className="card"><h2>Süreç</h2><Timeline ev={ev} /></section>
      </div>
    </div>
  </>);
}
