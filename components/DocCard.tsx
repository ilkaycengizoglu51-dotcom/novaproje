import { DPill, Icon } from './ui';
import UploadZone from './UploadZone';
import { Submit } from './client-bits';
import { date, dt, fsize, todayISO } from '@/lib/format';
import { removeDocFile } from '@/app/actions/client';
import { reviewDoc } from '@/app/actions/admin';

export default function DocCard({ r, files, admin, manager }: { r: any; files: any[]; admin?: boolean; manager?: boolean }) {
  const canUp = !admin && r.status !== 'onaylandi', late = r.due_date && r.due_date < todayISO() && (r.status === 'bekliyor' || r.status === 'reddedildi');
  return (
    <li className={`req card ${r.status}`}>
      <div className="card-head"><div><b className="req-t">{r.title}</b>{r.required && <span className="req-must">Zorunlu</span>}
        <small className="muted" style={{ display: 'block' }}>{r.project_name}{(admin || manager) && r.client_name ? ' · ' + r.client_name : ''}{r.due_date ? ` · Son tarih ${date(r.due_date)}` : ''}{late && <> · <span className="late">Gecikti</span></>}</small></div><DPill s={r.status} /></div>
      {r.note && <p className="req-note">{r.note}</p>}
      {r.status === 'reddedildi' && r.reason && <div className="alert err"><b>İade nedeni:</b> {r.reason}</div>}
      {files.length > 0 && <ul className="files">{files.map((f) => (
        <li key={f.id}><Icon n="file" /><span className="fn">{f.name}</span><small>{fsize(f.size)} · {dt(f.created_at)}</small><a className="lb" href={`/api/dosya/${f.id}`} target="_blank" rel="noopener">Görüntüle</a>
          {canUp && !manager && <form action={removeDocFile} className="inline-form"><input type="hidden" name="request" value={r.id} /><input type="hidden" name="file" value={f.id} /><Submit className="btn-link red" confirm="Bu dosya kaldırılsın mı?">Kaldır</Submit></form>}</li>))}</ul>}
      {canUp && <UploadZone id={r.id} />}
      {admin && <div className="toolbar">
        {r.status === 'yuklendi' && <><form action={reviewDoc} className="inline-form"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="act" value="ok" /><Submit className="btn btn-ink btn-sm">Onayla</Submit></form>
          <details><summary className="btn btn-red btn-sm" style={{ listStyle: 'none' }}>İade et</summary><form action={reviewDoc} className="pf" style={{ marginTop: 8 }}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="act" value="no" /><div className="field"><label htmlFor={`rs-${r.id}`}>İade nedeni (danışan görecek)</label><input id={`rs-${r.id}`} name="reason" defaultValue="Belge okunaklı değil, lütfen yeniden yükleyin." /></div><div><Submit className="btn btn-red btn-sm">İade et ve bildir</Submit></div></form></details></>}
        {r.status === 'onaylandi' && <form action={reviewDoc} className="inline-form"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="act" value="reopen" /><Submit className="btn-link">Onayı geri al</Submit></form>}
        <form action={reviewDoc} className="inline-form"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="act" value="delete" /><Submit className="btn-link red" confirm={`“${r.title}” talebi ve dosyaları silinsin mi?`}>Talebi sil</Submit></form>
      </div>}
    </li>
  );
}
