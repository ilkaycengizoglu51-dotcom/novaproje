'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addMedia } from '@/app/actions/media';

/** Shrinks photos in the browser (max 1920 px, WebP) before upload, so phone photos stay small. */
async function shrink(f: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return f;
  try {
    const bmp = await createImageBitmap(f); const k = Math.min(1, 1920 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    const b: Blob | null = await new Promise((r) => c.toBlob(r, 'image/webp', 0.82));
    return b && b.size < f.size ? new File([b], f.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' }) : f;
  } catch { return f; }
}
export default function MediaUpload({ pid, milestones, hasManager }: { pid: number; milestones: { id: number; title: string }[]; hasManager: boolean }) {
  const [files, setFiles] = useState<File[]>([]), [busy, setBusy] = useState(''), [msg, setMsg] = useState<{ error?: string; ok?: string }>({}), [over, setOver] = useState(false);
  const form = useRef<HTMLFormElement>(null), router = useRouter();
  const pick = (l: FileList | null) => setFiles([...(l || [])].filter((f) => f.type.startsWith('image/')).slice(0, 20));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!files.length) return setMsg({ error: 'Görsel seçin.' });
    setMsg({}); const fd = new FormData(form.current!); fd.delete('files');
    for (let i = 0; i < files.length; i++) { setBusy(`Hazırlanıyor ${i + 1} / ${files.length}`); fd.append('files', await shrink(files[i])); }
    setBusy('Yükleniyor…');
    try { const r = await addMedia(fd); setMsg(r); if (r.ok) { setFiles([]); form.current?.reset(); router.refresh(); } } catch { setMsg({ error: 'Yükleme başarısız; dosyalar çok büyük olabilir.' }); }
    setBusy('');
  }
  return (
    <form ref={form} className="af" onSubmit={submit} noValidate>
      <input type="hidden" name="project" value={pid} />
      <label className={`drop wide ${over ? 'over' : ''}`} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files); }}>
        <input type="file" name="files" className="sr" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => pick(e.target.files)} />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-8 8" /></svg>
        <span>{files.length ? <b>{files.length} görsel seçildi</b> : <><b>Görselleri seçin</b> veya sürükleyin · JPG, PNG, WebP (en fazla 20)</>}</span>
      </label>
      {files.length > 0 && <div className="mu-prev wide">{files.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" />)}</div>}
      <div className="field"><label htmlFor="mu-m">Aşama</label><select id="mu-m" name="milestone" defaultValue=""><option value="">Genel</option>{milestones.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
      <div className="field"><label htmlFor="mu-d">Çekim tarihi <span className="opt">(isteğe bağlı)</span></label><input id="mu-d" name="taken_at" type="date" /></div>
      <div className="field wide"><label htmlFor="mu-c">Açıklama <span className="opt">(isteğe bağlı)</span></label><input id="mu-c" name="caption" placeholder="Örn. Temel betonu döküldü" /></div>
      <fieldset className="field wide mu-share"><legend>Kimlerle paylaşılsın?</legend>
        <label className="chk"><input type="checkbox" name="show_client" defaultChecked /> Danışana göster</label>
        <label className="chk"><input type="checkbox" name="show_manager" defaultChecked={hasManager} disabled={!hasManager} /> Danışanın portföy yöneticisine göster{!hasManager && <span className="muted"> (bu danışanın portföy yöneticisi yok)</span>}</label>
      </fieldset>
      {msg.error && <div className="alert err wide" role="alert">{msg.error}</div>}{msg.ok && <div className="alert ok wide" role="status">{msg.ok}</div>}
      <div className="wide"><button type="submit" className="btn btn-ink" disabled={!!busy}>{busy || 'Görselleri yükle'}</button></div>
    </form>
  );
}
