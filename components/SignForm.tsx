'use client';
import { useEffect, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { signContract, type SignState } from '@/app/actions/client';
import { Submit, confetti } from './client-bits';

export default function SignForm({ id, name, admin }: { id: number; name: string; admin?: boolean }) {
  const [st, action] = useFormState<SignState, FormData>(signContract, {});
  const cv = useRef<HTMLCanvasElement>(null), sigRef = useRef<HTMLInputElement>(null);
  const [dirty, setDirty] = useState(false), [read, setRead] = useState(!!admin);
  const router = useRouter();
  useEffect(() => { if (st.ok) { confetti(); router.refresh(); } }, [st, router]);
  useEffect(() => {
    if (admin) return; const paper = document.getElementById('paper'); if (!paper) return;
    const check = () => { if (paper.getBoundingClientRect().bottom <= innerHeight + 40) { setRead(true); removeEventListener('scroll', check); } };
    addEventListener('scroll', check, { passive: true }); check(); return () => removeEventListener('scroll', check);
  }, [admin]);
  useEffect(() => {
    const c = cv.current; if (!c) return; const r = c.getBoundingClientRect(), k = Math.min(2, devicePixelRatio || 1);
    c.width = Math.round(r.width * k); c.height = Math.round(r.height * k); const g = c.getContext('2d')!; g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#0b1a13'; g.lineWidth = 2.4;
    let draw = false, lx = 0, ly = 0; const pos = (e: PointerEvent) => { const b = c.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    const down = (e: PointerEvent) => { draw = true; c.setPointerCapture(e.pointerId); [lx, ly] = pos(e); g.beginPath(); g.arc(lx, ly, 1.1, 0, 7); g.fillStyle = '#0b1a13'; g.fill(); setDirty(true); };
    const move = (e: PointerEvent) => { if (!draw) return; const [x, y] = pos(e); g.beginPath(); g.moveTo(lx, ly); g.lineTo(x, y); g.stroke(); lx = x; ly = y; };
    const up = () => { draw = false; if (sigRef.current) sigRef.current.value = c.toDataURL('image/png'); };
    c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move); c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    return () => { c.removeEventListener('pointerdown', down); c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up); };
  }, []);
  const clear = () => { const c = cv.current; if (!c) return; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); setDirty(false); if (sigRef.current) sigRef.current.value = ''; };
  if (st.ok) return <div className="alert ok" role="status">{admin ? 'Sözleşme tamamlandı.' : 'Sözleşme imzalandı. NOVAPROJE’nin karşı imzasından sonra tamamlanacak.'}</div>;
  return (
    <section className={`card ${admin ? '' : 'sign-card'}`}><h2>{admin ? 'NOVAPROJE adına imzala' : 'Sözleşmeyi imzala'}</h2>
      {!admin && <p className="muted">{read ? 'Sözleşmeyi okudunuz. Aşağıdaki adımları tamamlayarak imzalayabilirsiniz.' : 'İmzalamak için önce sözleşmeyi sonuna kadar okuyun.'}</p>}
      <form className="pf" action={action} noValidate>
        <input type="hidden" name="id" value={id} /><input type="hidden" name="signature" ref={sigRef} />
        <div className="field"><label htmlFor="sg-n">{admin ? 'İmzalayan' : 'Adınız soyadınız'}</label><input id="sg-n" name="name" defaultValue={name} autoComplete="name" /></div>
        <div className="field"><span className="lbl" id="sg-l">İmza</span><div className="pad-wrap"><canvas className="pad" ref={cv} aria-labelledby="sg-l" role="img" /><button type="button" className="lb pad-clear" onClick={clear}>Temizle</button>{!dirty && <span className="pad-hint">Parmağınızla veya farenizle bu alana imzanızı atın</span>}</div></div>
        {!admin && <><label className="chk"><input type="checkbox" name="read" disabled={!read} /> Sözleşmenin tamamını okudum ve anladım.</label>
          <label className="chk"><input type="checkbox" name="agree" /> Bu sözleşmeyi elektronik ortamda onaylıyor, onay kaydının delil olarak kullanılmasını kabul ediyorum.</label></>}
        {st.error && <div className="alert err" role="alert">{st.error}</div>}
        <div><Submit pending="İmzalanıyor">{admin ? 'İmzayı tamamla' : 'Sözleşmeyi imzala'}</Submit></div>
      </form></section>
  );
}
