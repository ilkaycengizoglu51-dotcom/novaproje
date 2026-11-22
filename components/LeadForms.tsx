'use client';
import { useFormState } from 'react-dom';
import { addClientDoc, addLeadInfo, createLead, type LeadState } from '@/app/actions/manager';
import { reviewLead, saveResource, type LeadState as AState, type ResState } from '@/app/actions/admin';
import { Submit } from './client-bits';
import { Creds } from './ClientForms';

const TYPES = ['Hayvancılık tesisleri', 'Kanatlı tesisleri', 'Sera ve hidroponik', 'Safran ve kapalı ortam', 'Soğuk zincir ve paketleme', 'Hidrolik ve sulama', 'Mikro bitki yetiştiriciliği', 'TKDK / IPARD III dosyaları', 'Yatırım danışmanlığı', 'Diğer'];
const Msg = ({ st }: { st: { error?: string; ok?: string } }) => <>{st.error && <div className="alert err wide" role="alert">{st.error}</div>}{st.ok && <div className="alert ok wide" role="status">{st.ok}</div>}</>;
const FileIn = ({ id, label = 'Belgeler', hint = 'PDF, JPG, PNG veya WebP; dosya başına en fazla 10 MB.' }: { id: string; label?: string; hint?: string }) => <div className="field wide"><label htmlFor={id}>{label} <span className="opt">(isteğe bağlı)</span></label><input id={id} name="files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" /><span className="hint">{hint}</span></div>;

export function LeadForm({ init = {} }: { init?: { konum?: string; parsel?: string; notlar?: string } }) {
  const [st, action] = useFormState<LeadState, FormData>(createLead, {});
  return (
    <form className="af" action={action} noValidate>
      <h3 className="wide fs-h">Danışan adayı</h3>
      <div className="field"><label htmlFor="ld-n">Ad soyad</label><input id="ld-n" name="name" autoComplete="off" /></div>
      <div className="field"><label htmlFor="ld-c">Firma <span className="opt">(isteğe bağlı)</span></label><input id="ld-c" name="company" /></div>
      <div className="field"><label htmlFor="ld-e">E-posta</label><input id="ld-e" name="email" type="email" /><span className="hint">Onaylanınca danışan hesabı bu adresle açılır.</span></div>
      <div className="field"><label htmlFor="ld-p">Telefon <span className="opt">(isteğe bağlı)</span></label><input id="ld-p" name="phone" type="tel" /></div>
      <h3 className="wide fs-h">Yatırım</h3>
      <div className="field"><label htmlFor="ld-f">Tesis tipi</label><select id="ld-f" name="facility" defaultValue="">{[<option key="x" value="" disabled>Seçin</option>, ...TYPES.map((t) => <option key={t}>{t}</option>)]}</select></div>
      <div className="field"><label htmlFor="ld-l">Konum</label><input id="ld-l" name="location" placeholder="İl / ilçe" defaultValue={init.konum} /></div>
      <div className="field"><label htmlFor="ld-a">Ada / parsel <span className="opt">(isteğe bağlı)</span></label><input id="ld-a" name="parcel" defaultValue={init.parsel} /></div>
      <div className="field"><label htmlFor="ld-k">Kapasite <span className="opt">(isteğe bağlı)</span></label><input id="ld-k" name="capacity" placeholder="Örn. 400 baş, 5 dönüm sera" /></div>
      <div className="field"><label htmlFor="ld-b">Tahmini bütçe <span className="opt">(isteğe bağlı)</span></label><input id="ld-b" name="budget" placeholder="Örn. 5–10 milyon TL" /></div>
      <div className="field wide"><label htmlFor="ld-o">Notlar <span className="opt">(isteğe bağlı)</span></label><textarea id="ld-o" name="notes" rows={4} placeholder="Danışanın beklentisi, hibe ilgisi, görüşme notları…" defaultValue={init.notlar} /></div>
      <FileIn id="ld-files" label="Ön belgeler" />
      <Msg st={st} />
      <div className="wide"><Submit pending="Gönderiliyor">Ön kaydı yöneticiye gönder</Submit></div>
    </form>
  );
}
export function LeadReply({ id }: { id: number }) {
  const [st, action] = useFormState<LeadState, FormData>(addLeadInfo, {});
  return (<form className="af" action={action} noValidate><input type="hidden" name="id" value={id} />
    <div className="field wide"><label htmlFor="lr-n">Not</label><textarea id="lr-n" name="note" rows={3} placeholder="İstenen bilgi veya açıklama" /></div><FileIn id="lr-f" label="Belge ekle" />
    <Msg st={st} /><div className="wide"><Submit className="btn btn-ink btn-sm" pending="Gönderiliyor">Gönder</Submit></div></form>);
}
export function ClientDocForm({ clients }: { clients: any[] }) {
  const [st, action] = useFormState<LeadState, FormData>(addClientDoc, {});
  return (<form className="af" action={action} noValidate>
    <div className="field"><label htmlFor="cd-c">Danışan</label><select id="cd-c" name="client">{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
    <div className="field"><label htmlFor="cd-t">Belge adı</label><input id="cd-t" name="title" placeholder="Örn. Tapu kaydı" list="cd-list" /><datalist id="cd-list">{['Tapu kaydı', 'Kimlik kartı (ön ve arka yüz)', 'Çiftçi Kayıt Sistemi (ÇKS) belgesi', 'Vergi levhası', 'İmar durumu belgesi', 'Vekâletname'].map((t) => <option key={t} value={t} />)}</datalist></div>
    <div className="field wide"><label htmlFor="cd-f">Dosyalar</label><input id="cd-f" name="files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" /><span className="hint">PDF, JPG, PNG veya WebP; dosya başına en fazla 10 MB.</span></div>
    <Msg st={st} /><div className="wide"><Submit pending="Yükleniyor">Danışan adına ekle</Submit></div></form>);
}
export function LeadReview({ l }: { l: any }) {
  const [st, action] = useFormState<AState, FormData>(reviewLead, {});
  const open = !['onaylandi', 'reddedildi'].includes(l.status);
  return (
    <section className="card"><h2>Karar</h2>
      {st.creds && <Creds c={st.creds} />}{st.error && <div className="alert err" role="alert">{st.error}</div>}{st.ok && !st.creds && <div className="alert ok" role="status">{st.ok}</div>}
      {open ? <>
        <form action={action} className="pf"><input type="hidden" name="id" value={l.id} /><input type="hidden" name="act" value="approve" />
          <h3 className="fs-h">Onayla ve danışan hesabı aç</h3>
          <div className="field"><label htmlFor="rv-e">Danışan e-postası</label><input id="rv-e" name="email" type="email" defaultValue={l.email || ''} /></div>
          <label className="chk"><input type="checkbox" name="project" defaultChecked /> Bilgilerden proje kaydı da oluştur</label>
          <div className="field"><label htmlFor="rv-a">Portföy yöneticisine not <span className="opt">(isteğe bağlı)</span></label><input id="rv-a" name="note" /></div>
          <div><Submit pending="Onaylanıyor" confirm="Ön kayıt onaylansın ve danışan hesabı açılsın mı?">Onayla, hesabı aç</Submit></div></form>
        <div className="two" style={{ marginTop: 10 }}>
          <form action={action} className="pf"><input type="hidden" name="id" value={l.id} /><input type="hidden" name="act" value="missing" /><div className="field"><label htmlFor="rv-m">Eksik bilgi / belge iste</label><textarea id="rv-m" name="note" rows={2} placeholder="Örn. Tapu fotokopisi ve ÇKS belgesi gerekli." /></div><div><Submit className="btn btn-ghost2 btn-sm">Eksik bilgi iste</Submit></div></form>
          <form action={action} className="pf"><input type="hidden" name="id" value={l.id} /><input type="hidden" name="act" value="reject" /><div className="field"><label htmlFor="rv-r">Reddetme nedeni <span className="opt">(isteğe bağlı)</span></label><textarea id="rv-r" name="note" rows={2} /></div><div><Submit className="btn btn-red btn-sm" confirm="Ön kayıt reddedilsin mi?">Reddet</Submit></div></form>
        </div>
        {l.status === 'gonderildi' && <form action={action} style={{ marginTop: 10 }}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="act" value="review" /><Submit className="btn-link">İncelemeye aldım olarak işaretle</Submit></form>}
      </> : <p className="muted">Bu ön kayıt kapandı.</p>}
    </section>
  );
}
export function ResourceForm() {
  const [st, action] = useFormState<ResState, FormData>(saveResource, {});
  return (<form className="af" action={action} noValidate>
    <div className="field"><label htmlFor="rs-k">Tür</label><select id="rs-k" name="kind" defaultValue="sunum"><option value="sunum">Sunum dosyası</option><option value="video">Proje videosu</option><option value="diger">Diğer doküman</option></select></div>
    <div className="field"><label htmlFor="rs-t">Başlık</label><input id="rs-t" name="title" placeholder="Örn. NOVAPROJE kurumsal sunum 2026" /></div>
    <div className="field wide"><label htmlFor="rs-d">Açıklama <span className="opt">(isteğe bağlı)</span></label><input id="rs-d" name="description" /></div>
    <div className="field"><label htmlFor="rs-f">Dosya</label><input id="rs-f" name="file" type="file" accept=".pdf,.pptx,.ppt,.mp4,.webm,.jpg,.jpeg,.png,.webp" /><span className="hint">PDF, PPTX, MP4 veya görsel; en fazla 12 MB.</span></div>
    <div className="field"><label htmlFor="rs-u">veya bağlantı</label><input id="rs-u" name="url" placeholder="https:// veya /videos/…" /></div>
    <Msg st={st} /><div className="wide"><Submit pending="Yükleniyor">Ekle</Submit></div></form>);
}
