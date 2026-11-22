'use client';
import { useEffect, useState } from 'react';
import { setMedia } from '@/app/actions/media';
type M = { id: number; file_id: string; caption?: string; taken_at?: string; created_at: string; ms_title?: string; show_client?: boolean; show_manager?: boolean };
const fd = (s?: string) => (s ? new Date(s.slice(0, 10) + 'T00:00:00Z').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '');
export default function Gallery({ items, admin, empty = 'Henüz paylaşılan görsel yok.' }: { items: M[]; admin?: boolean; empty?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => { if (open === null) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowRight') setOpen((o) => (o! + 1) % items.length); if (e.key === 'ArrowLeft') setOpen((o) => (o! - 1 + items.length) % items.length); };
    addEventListener('keydown', k); document.documentElement.style.overflow = 'hidden'; return () => { removeEventListener('keydown', k); document.documentElement.style.overflow = ''; }; }, [open, items.length]);
  if (!items.length) return <p className="muted">{empty}</p>;
  const cur = open !== null ? items[open] : null;
  return (<>
    <ul className="gal">{items.map((m, i) => (
      <li key={m.id} className="gal-i">
        <button type="button" className="gal-b" onClick={() => setOpen(i)} aria-label={`Büyüt: ${m.caption || m.ms_title || 'görsel'}`}>
          <img src={`/api/dosya/${m.file_id}`} alt={m.caption || ''} loading="lazy" />
          <span className="gal-cap">{m.ms_title && <small>{m.ms_title}</small>}{m.caption && <b>{m.caption}</b>}<em>{fd(m.taken_at || m.created_at)}</em></span>
        </button>
        {admin && <div className="gal-adm">
          <form action={setMedia}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="client" /><button type="submit" className={`gal-t ${m.show_client ? 'on' : ''}`} title="Danışana görünürlük">Danışan {m.show_client ? '✓' : '✕'}</button></form>
          <form action={setMedia}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="manager" /><button type="submit" className={`gal-t ${m.show_manager ? 'on' : ''}`} title="Portföy yöneticisine görünürlük">Portföy {m.show_manager ? '✓' : '✕'}</button></form>
          <form action={setMedia} onSubmit={(e) => { if (!confirm('Bu görsel silinsin mi?')) e.preventDefault(); }}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="delete" /><button type="submit" className="gal-t del">Sil</button></form>
        </div>}
      </li>))}</ul>
    {cur && <div className="gbox" role="dialog" aria-modal="true" aria-label="Görsel" onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
      <img key={cur.id} src={`/api/dosya/${cur.file_id}`} alt={cur.caption || ''} />
      <div className="gbox-bar"><div>{cur.ms_title && <small>{cur.ms_title}</small>}<b>{cur.caption || 'Aşama görseli'}</b><em>{fd(cur.taken_at || cur.created_at)}</em></div>
        <div className="gbox-nav"><button type="button" aria-label="Önceki" onClick={() => setOpen((open! - 1 + items.length) % items.length)}>‹</button><span>{open! + 1} / {items.length}</span><button type="button" aria-label="Sonraki" onClick={() => setOpen((open! + 1) % items.length)}>›</button><button type="button" className="gbox-x" onClick={() => setOpen(null)}>Kapat</button></div></div>
    </div>}
  </>);
}
