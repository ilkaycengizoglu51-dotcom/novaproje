'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

export function Submit({ children, className = 'btn btn-ink', pending, confirm, name, value }: { children: ReactNode; className?: string; pending?: string; confirm?: string; name?: string; value?: string }) {
  const { pending: busy } = useFormStatus();
  return <button type="submit" className={className} disabled={busy} name={name} value={value} onClick={(e) => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}>{busy ? pending ?? 'İşleniyor' : children}</button>;
}
export function CopyBtn({ text, label = 'Kopyala', className = 'btn-link' }: { text: string; label?: string; className?: string }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className={className} onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1800); } catch { /* ignore */ } }}>{ok ? 'Kopyalandı' : label}</button>;
}
export function PrintBtn() { return <button type="button" className="btn btn-ghost2 btn-sm" onClick={() => window.print()}>Yazdır / PDF</button>; }
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const sb = document.getElementById('sb'); if (sb) sb.classList.toggle('open', open); }, [open]);
  useEffect(() => { const close = () => setOpen(false); window.addEventListener('popstate', close); return () => window.removeEventListener('popstate', close); }, []);
  return <button type="button" aria-expanded={open} aria-controls="sb" onClick={() => setOpen((o) => !o)}>{open ? 'Kapat' : 'Menü'}</button>;
}
export function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = String(to); return; }
    const t0 = performance.now(); let raf = 0; const step = (t: number) => { const k = Math.min(1, (t - t0) / 1300); el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf); }, [to]);
  return <span ref={ref}>0</span>;
}
export function Toast({ text }: { text: string }) {
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShow(false), 6000); return () => clearTimeout(t); }, []);
  return show ? <div className="alert ok" role="status">{text}</div> : null;
}
export function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
  const k = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight; cv.width = W * k; cv.height = H * k; const g = cv.getContext('2d')!; g.scale(k, k);
  const cols = ['#8db43a', '#11463a', '#a6cb4c', '#f2f3ee', '#d6a52b'];
  const P = Array.from({ length: 160 }, () => ({ x: W / 2 + (Math.random() - .5) * 120, y: H * .55, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 6, r: Math.random() * Math.PI, vr: (Math.random() - .5) * .35, w: 6 + Math.random() * 7, h: 3 + Math.random() * 5, c: cols[(Math.random() * cols.length) | 0] }));
  const t0 = performance.now(); const tick = (t: number) => { const el = t - t0; g.clearRect(0, 0, W, H);
    P.forEach((p) => { p.vy += .42; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - el / 2600); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore(); });
    if (el < 2600) requestAnimationFrame(tick); else cv.remove(); }; requestAnimationFrame(tick);
}
/** Renders a 3D still of a facility in the browser (three.js from CDN + /js/np3d.js), cached for the session. */
let loader: Promise<void> | null = null;
function load3d() {
  if (loader) return loader;
  const add = (src: string) => new Promise<void>((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error(src)); document.head.appendChild(s); });
  loader = ((window as any).THREE ? Promise.resolve() : add('https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js')).then(() => ((window as any).renderStill ? undefined : add('/js/np3d.js')));
  return loader;
}
export function Still({ k, className, children, alt = '' }: { k: string; className: string; children?: ReactNode; alt?: string }) {
  const [url, setUrl] = useState(''); const [state, setState] = useState('');
  useEffect(() => { let alive = true; const key = `np-still-${k}-1200x760-g`;
    try { const c = sessionStorage.getItem(key); if (c) { setUrl(c); return; } } catch { /* ignore */ }
    load3d().then(() => (window as any).renderStill(k, 1200, 760, true)).then((u: string) => { if (!alive) return; if (u) setUrl(u); else setState('fail'); }).catch(() => alive && setState('fail'));
    return () => { alive = false; }; }, [k]);
  return <figure className={`${className} ${state} ${url ? 'ready' : ''}`}>{url && <img src={url} alt={alt} />}<span className="shimmer" aria-hidden="true" />{children}</figure>;
}
