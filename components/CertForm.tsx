'use client';
import { useEffect, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import { uploadCert, type CertState } from '@/app/actions/certs';
import { Submit } from './client-bits';

const SUGGEST = ['Hayvan Sağlığı ve Refahı', 'Bitki Koruma Ürünleri Kullanımı', 'Tarımda İş Sağlığı ve Güvenliği', 'İyi Tarım Uygulamaları', 'Modern Seracılık', 'Süt Sığırcılığı', 'Küçükbaş Hayvan Yetiştiriciliği', 'Arıcılık', 'Basınçlı Sulama Sistemleri'];
export default function CertForm({ clients }: { clients?: { id: number; name: string }[] }) {
  const [st, action] = useFormState<CertState, FormData>(uploadCert, {});
  const form = useRef<HTMLFormElement>(null), [fname, setFname] = useState('');
  useEffect(() => { if (st.ok) { form.current?.reset(); setFname(''); } }, [st.t]); // eslint-disable-line
  return (
    <form ref={form} className="af" action={action} noValidate>
      {clients && <div className="field wide"><label htmlFor="ce-c">Danışan</label><select id="ce-c" name="client">{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
      <div className="field wide"><label htmlFor="ce-t">Eğitim / sertifika adı</label><input id="ce-t" name="title" list="ce-list" placeholder="Örn. Tarımda İş Sağlığı ve Güvenliği" /><datalist id="ce-list">{SUGGEST.map((t) => <option key={t} value={t} />)}</datalist></div>
      <div className="field"><label htmlFor="ce-i">Veren kurum</label><input id="ce-i" name="issuer" defaultValue="Tarım Orman Akademisi" /></div>
      <div className="field"><label htmlFor="ce-d">Belge tarihi <span className="opt">(isteğe bağlı)</span></label><input id="ce-d" name="issued_at" type="date" /></div>
      <div className="field"><label htmlFor="ce-h">Süre <span className="opt">(saat, isteğe bağlı)</span></label><input id="ce-h" name="hours" inputMode="numeric" placeholder="Örn. 8" /></div>
      <div className="field wide">
        <span className="lbl">Sertifika dosyası</span>
        <label className={`drop ${fname ? 'over' : ''}`}>
          <input type="file" name="file" className="sr" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*" onChange={(e) => setFname(e.target.files?.[0]?.name || '')} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
          <span>{fname ? <b>{fname}</b> : <><b>Dosya seçin</b> · PDF veya fotoğraf, en fazla 10 MB</>}</span>
        </label>
      </div>
      {st.error && <div className="alert err wide" role="alert">{st.error}</div>}
      {st.ok && <div className="alert ok wide" role="status">{st.ok}</div>}
      <div className="wide"><Submit pending="Yükleniyor">Sertifikayı yükle</Submit></div>
    </form>
  );
}
