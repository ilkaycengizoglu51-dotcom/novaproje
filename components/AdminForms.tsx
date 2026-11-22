'use client';
import { useFormState } from 'react-dom';
import { requestDocs, saveAutoreply, saveContract, savePartner, type CState, type DocState, type PartState, type SetState } from '@/app/actions/admin';
import { Submit } from './client-bits';
const DOC_PRESETS = ['Tapu kaydı', 'Kimlik kartı (ön ve arka yüz)', 'Çiftçi Kayıt Sistemi (ÇKS) belgesi', 'İşletme tescil belgesi', 'Vergi levhası', 'İmar durumu belgesi', 'Zemin etüdü raporu', 'Vekâletname', 'Hissedar muvafakatnamesi', 'Mevcut yapı fotoğrafları'];
const CATS = ['İnşaat ve taahhüt', 'GES ve enerji depolama', 'Çelik konstrüksiyon', 'Sera ve topraksız tarım', 'Hayvancılık ekipmanları', 'Soğutma ve iklimlendirme', 'Sulama ve hidrolik', 'Zemin etüdü ve harita'];

export function ContractEditor({ c }: { c: any }) {
  const [st, action] = useFormState<CState, FormData>(saveContract, {});
  return (
    <section className="card"><h2>{c.status === 'revizyon' ? 'Sözleşmeyi revize et' : 'Taslağı düzenle'}</h2>
      {st.error && <div className="alert err" role="alert">{st.error}</div>}{st.ok && <div className="alert ok" role="status">{st.ok}</div>}
      <form className="pf" action={action} noValidate><input type="hidden" name="id" value={c.id} />
        <div className="field"><label htmlFor="ec-t">Sözleşme adı</label><input id="ec-t" name="title" defaultValue={c.title} /></div>
        <div className="field"><label htmlFor="ec-b">Sözleşme metni</label><textarea id="ec-b" name="body" rows={18} className="mono" defaultValue={c.body} /></div>
        <div className="field"><label htmlFor="ec-f">Ek dosya <span className="opt">(isteğe bağlı, PDF veya görsel, en fazla 10 MB)</span></label><input id="ec-f" name="attach" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /></div>
        <p className="hint">Şablon genel bir başlangıç metnidir; kullanmadan önce hukuk danışmanınıza kontrol ettirmeniz önerilir.</p>
        <div className="toolbar"><Submit className="btn btn-ghost2" name="go" value="save" pending="Kaydediliyor">Taslağı kaydet</Submit><Submit name="go" value="send" pending="Gönderiliyor" confirm="Sözleşme danışana imza için gönderilsin mi?">{c.status === 'revizyon' ? 'Revize edip yeniden gönder' : 'Danışana imza için gönder'}</Submit></div>
      </form></section>
  );
}
export function DocRequestForm({ projects }: { projects: any[] }) {
  const [st, action] = useFormState<DocState, FormData>(requestDocs, {});
  return (
    <section className="card"><h2>Danışandan belge iste</h2>{st.error && <div className="alert err" role="alert">{st.error}</div>}{st.ok && <div className="alert ok" role="status">{st.ok}</div>}
      {projects.length ? <form className="af" action={action} noValidate>
        <div className="field"><label htmlFor="dr-p">Proje</label><select id="dr-p" name="project">{projects.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.client_name}</option>)}</select></div>
        <div className="field"><label htmlFor="dr-d">Son tarih <span className="opt">(isteğe bağlı)</span></label><input id="dr-d" name="due" type="date" /></div>
        <fieldset className="field wide presets"><legend>Standart belgeler</legend>{DOC_PRESETS.map((t, i) => <label key={t} className="chk"><input type="checkbox" name="pre" value={t} defaultChecked={i < 2} /> {t}</label>)}</fieldset>
        <div className="field wide"><label htmlFor="dr-c">Başka belge <span className="opt">(her satıra bir belge)</span></label><textarea id="dr-c" name="custom" rows={2} placeholder="Örn. Elektrik abonelik sözleşmesi" /></div>
        <div className="field wide"><label htmlFor="dr-n">Danışana not <span className="opt">(isteğe bağlı)</span></label><input id="dr-n" name="note" placeholder="Örn. Belgeler güncel tarihli olmalı." /></div>
        <label className="chk wide"><input type="checkbox" name="required" defaultChecked /> Zorunlu belge olarak işaretle</label>
        <div className="wide"><Submit pending="Gönderiliyor">Belge talebini gönder</Submit></div></form> : <p className="muted">Önce bir proje oluşturun.</p>}</section>
  );
}
export function AutoreplyForm({ v }: { v: any }) {
  const [st, action] = useFormState<SetState, FormData>(saveAutoreply, {});
  return (
    <details className="card autoset"><summary><span>⚡ Otomatik yanıt</span><span className={`pill ${v.enabled ? 'c-tamamlandi' : ''}`}>{v.enabled ? 'Açık' : 'Kapalı'}</span></summary>
      <form className="pf" action={action}>{st.ok && <div className="alert ok" role="status">{st.ok}</div>}
        <label className="chk"><input type="checkbox" name="enabled" defaultChecked={v.enabled} /> Danışan mesaj attığında otomatik yanıt gönder (4 saatte en fazla bir kez)</label>
        <div className="field"><label htmlFor="ar-in">Mesai saatlerinde (Pzt–Cum 09:00–18:00)</label><textarea id="ar-in" name="inHours" rows={3} defaultValue={v.inHours} /></div>
        <div className="field"><label htmlFor="ar-off">Mesai dışında</label><textarea id="ar-off" name="offHours" rows={3} defaultValue={v.offHours} /></div>
        <label className="chk"><input type="checkbox" name="welcome" defaultChecked={v.welcome} /> Yeni danışan hesabı açılınca hoş geldiniz mesajı gönder</label>
        <p className="hint">{'{ad}'} yazdığınız yere danışanın adı gelir. Mesajın konusuna göre kısa bir yönlendirme cümlesi otomatik eklenir.</p>
        <div><Submit className="btn btn-ink btn-sm">Kaydet</Submit></div></form></details>
  );
}
export function PartnerForm({ p }: { p?: any }) {
  const [st, action] = useFormState<PartState, FormData>(savePartner, {});
  return (
    <form className="af" action={action} noValidate>{p && <input type="hidden" name="id" value={p.id} />}
      {st.error && <div className="alert err wide" role="alert">{st.error}</div>}{st.ok && <div className="alert ok wide" role="status">{st.ok}</div>}
      <div className="field"><label htmlFor={`pn-${p?.id || 0}`}>Firma adı</label><input id={`pn-${p?.id || 0}`} name="name" defaultValue={p?.name} /></div>
      <div className="field"><label htmlFor={`pc-${p?.id || 0}`}>Kategori</label><select id={`pc-${p?.id || 0}`} name="category" defaultValue={p?.category || CATS[0]}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor={`ps-${p?.id || 0}`}>Şehir <span className="opt">(isteğe bağlı)</span></label><input id={`ps-${p?.id || 0}`} name="city" defaultValue={p?.city || ''} /></div>
      <div className="field"><label htmlFor={`pu-${p?.id || 0}`}>Web sitesi <span className="opt">(isteğe bağlı)</span></label><input id={`pu-${p?.id || 0}`} name="url" inputMode="url" placeholder="https://" defaultValue={p?.url || ''} /></div>
      <div className="field wide"><label htmlFor={`pd-${p?.id || 0}`}>Kısa açıklama <span className="opt">(isteğe bağlı)</span></label><textarea id={`pd-${p?.id || 0}`} name="description" rows={2} defaultValue={p?.description || ''} /></div>
      <div className="field wide"><label htmlFor={`pl-${p?.id || 0}`}>Logo <span className="opt">(PNG, JPG, SVG veya WebP; en fazla 2 MB)</span></label><input id={`pl-${p?.id || 0}`} name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />{p?.logo_id && <label className="chk"><input type="checkbox" name="dellogo" /> Mevcut logoyu kaldır</label>}</div>
      <div className="wide"><Submit className="btn btn-ink btn-sm" pending="Kaydediliyor">{p ? 'Kaydet' : 'Firmayı ekle'}</Submit></div>
    </form>
  );
}
