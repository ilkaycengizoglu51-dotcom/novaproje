'use client';
import { useFormState } from 'react-dom';
import { requestPackageDocs, savePackage, type WState } from '@/app/actions/admin';
import { CONTRACTOR_DOCS, TRADES } from '@/lib/format';
import { Submit } from './client-bits';

type Opt = { id: number; name: string; sub?: string | null };
export function PackageForm({ projects, contractors, w }: { projects: Opt[]; contractors: Opt[]; w?: any }) {
  const [st, action] = useFormState<WState, FormData>(savePackage, {});
  const k = w ? `e${w.id}` : 'n';
  return (
    <form className="af" action={action} noValidate>
      {w && <input type="hidden" name="id" value={w.id} />}
      {st.error && <div className="alert err wide" role="alert">{st.error}</div>}
      {st.ok && <div className="alert ok wide" role="status">{st.ok}</div>}
      <div className="field"><label htmlFor={`wp-p-${k}`}>Proje</label><select id={`wp-p-${k}`} name="project" defaultValue={w?.project_id}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}{p.sub ? ` — ${p.sub}` : ''}</option>)}</select></div>
      <div className="field"><label htmlFor={`wp-c-${k}`}>Taşeron</label><select id={`wp-c-${k}`} name="contractor" defaultValue={w?.contractor_id}>{contractors.map((c) => <option key={c.id} value={c.id}>{c.sub ? `${c.sub} — ${c.name}` : c.name}</option>)}</select></div>
      <div className="field"><label htmlFor={`wp-t-${k}`}>İş kolu</label><select id={`wp-t-${k}`} name="trade" defaultValue={w?.trade || TRADES[0]}>{TRADES.map((t) => <option key={t}>{t}</option>)}</select></div>
      <div className="field"><label htmlFor={`wp-n-${k}`}>İşin adı</label><input id={`wp-n-${k}`} name="title" defaultValue={w?.title} placeholder="Ör. Ahır elektrik tesisatı" maxLength={160} /></div>
      <div className="field"><label htmlFor={`wp-s-${k}`}>Başlangıç <span className="opt">(isteğe bağlı)</span></label><input id={`wp-s-${k}`} name="start" type="date" defaultValue={w?.start_date || ''} /></div>
      <div className="field"><label htmlFor={`wp-d-${k}`}>Bitiş <span className="opt">(isteğe bağlı)</span></label><input id={`wp-d-${k}`} name="due" type="date" defaultValue={w?.due_date || ''} /></div>
      <div className="field wide"><label htmlFor={`wp-k-${k}`}>Üstleneceği iş (kapsam)</label><textarea id={`wp-k-${k}`} name="scope" rows={4} defaultValue={w?.scope || ''} placeholder={'Ör. Projeye uygun iç ve dış aydınlatma, priz ve pano tesisatı; kablo ve malzeme yükleniciden.\nTopraklama ölçümü ve test raporu teslim edilecek.'} /><span className="hint">Taşeron yalnızca bu işi ve ilgili projenin adını, türünü, konumunu görür; danışanın kişisel bilgilerini görmez.</span></div>
      <div className="wide"><Submit pending="Kaydediliyor">{w ? 'Değişiklikleri kaydet' : 'İşi ata ve bildir'}</Submit></div>
    </form>
  );
}

export function PackageDocsForm({ id }: { id: number }) {
  const [st, action] = useFormState<WState, FormData>(requestPackageDocs, {});
  return (
    <form className="af" action={action} noValidate>
      <input type="hidden" name="id" value={id} />
      {st.error && <div className="alert err wide" role="alert">{st.error}</div>}
      {st.ok && <div className="alert ok wide" role="status">{st.ok}</div>}
      <fieldset className="field wide presets"><legend>Standart taşeron belgeleri</legend>{CONTRACTOR_DOCS.map((t, i) => <label key={t} className="chk"><input type="checkbox" name="pre" value={t} defaultChecked={i < 4} /> {t}</label>)}</fieldset>
      <div className="field wide"><label htmlFor={`pd-c-${id}`}>Başka belge <span className="opt">(her satıra bir belge)</span></label><textarea id={`pd-c-${id}`} name="custom" rows={2} placeholder="Ör. Malzeme teknik föyleri" /></div>
      <div className="field"><label htmlFor={`pd-d-${id}`}>Son tarih <span className="opt">(isteğe bağlı)</span></label><input id={`pd-d-${id}`} name="due" type="date" /></div>
      <div className="field"><label htmlFor={`pd-n-${id}`}>Not <span className="opt">(isteğe bağlı)</span></label><input id={`pd-n-${id}`} name="note" placeholder="Ör. Belgeler güncel tarihli olmalı." /></div>
      <div className="wide"><Submit pending="Gönderiliyor">Belge talebini gönder</Submit></div>
    </form>
  );
}
