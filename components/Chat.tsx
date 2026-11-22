'use client';
import { Fragment, useEffect, useRef, useState } from 'react';
import { sendMessage } from '@/app/actions/client';

const TOPICS = ['Genel', 'Proje süreci', 'Ödeme', 'Belgeler', 'Sözleşme'];
const QUICK = ['Mesajınızı aldık, en kısa sürede dönüş yapacağız.', 'Belgeniz incelendi, teşekkür ederiz.', 'Sahadan güncel fotoğrafları panele ekledik.', 'Ödemeniz hesabımıza ulaştı, teşekkür ederiz.'];
const fsize = (n: number) => (n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');
const hm = (d: string) => new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
const dayOf = (d: string) => { const x = new Date(d), t = new Date(); const diff = Math.round((new Date(t.toDateString()).getTime() - new Date(x.toDateString()).getTime()) / 864e5); return diff === 0 ? 'Bugün' : diff === 1 ? 'Dün' : x.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }); };

export default function Chat({ clientId, role, initial, head }: { clientId: number; role: 'admin' | 'client'; initial: any[]; head: React.ReactNode }) {
  const [msgs, setMsgs] = useState<any[]>(initial), [seen, setSeen] = useState<number[]>([]), [typing, setTyping] = useState(false);
  const [text, setText] = useState(''), [topic, setTopic] = useState('Genel'), [files, setFiles] = useState<File[]>([]), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [lastNew, setLastNew] = useState(0);
  const logRef = useRef<HTMLOListElement>(null), taRef = useRef<HTMLTextAreaElement>(null), fileRef = useRef<HTMLInputElement>(null);
  const mine = role;
  const lastId = msgs.length ? Math.max(...msgs.map((m) => m.id)) : 0;
  useEffect(() => { const l = logRef.current; if (l) l.scrollTop = l.scrollHeight; }, [msgs.length, typing]);
  useEffect(() => {
    let alive = true;
    const poll = async () => { try { const r = await fetch(`/api/mesajlar?client=${clientId}&after=${lastId}`, { cache: 'no-store' }); if (!r.ok) return; const j = await r.json(); if (!alive) return;
      if (j.messages?.length) { setMsgs((cur) => { const ids = new Set(cur.map((m) => m.id)); const add = j.messages.filter((m: any) => !ids.has(m.id)); if (add.length) setLastNew(add[add.length - 1].id); return add.length ? [...cur, ...add] : cur; }); }
      setSeen(j.seen || []); } catch { /* offline */ } };
    poll(); const t = setInterval(poll, 8000); return () => { alive = false; clearInterval(t); };
  }, [clientId, lastId]);
  const fit = () => { const t = taRef.current; if (!t) return; t.style.height = 'auto'; t.style.height = Math.min(180, t.scrollHeight) + 'px'; };
  async function send() {
    if (busy || (!text.trim() && !files.length)) return; setBusy(true); setErr('');
    const fd = new FormData(); fd.set('client', String(clientId)); fd.set('text', text); fd.set('topic', topic); files.forEach((f) => fd.append('files', f));
    try {
      const r = await sendMessage(fd);
      if (r.error) { setErr(r.error); return; }
      setMsgs((cur) => [...cur, r.msg]); setLastNew(r.msg.id); setText(''); setFiles([]); if (fileRef.current) fileRef.current.value = ''; setTimeout(fit, 0);
      if (r.auto) { setTimeout(() => setTyping(true), 450); setTimeout(() => { setTyping(false); setMsgs((cur) => (cur.some((m) => m.id === r.auto.id) ? cur : [...cur, r.auto])); setLastNew(r.auto.id); }, 2100); }
    } catch { setErr('Mesaj gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.'); }
    finally { setBusy(false); taRef.current?.focus(); }
  }
  let lastDay = '';
  return (
    <section className="chat">
      {head}
      <ol className="chat-log" ref={logRef} aria-live="polite">
        {!msgs.length && <li className="chat-empty"><p>{role === 'admin' ? 'Bu danışanla henüz mesajlaşma yok. İlk mesajı siz yazabilirsiniz.' : 'Henüz mesaj yok. Projenizle ilgili her şeyi buradan sorabilirsiniz.'}</p></li>}
        {msgs.map((m) => { const d = dayOf(m.created_at), sep = d !== lastDay; lastDay = d; const me = m.sender === mine, read = m.read_at || seen.includes(m.id);
          return (<Fragment key={m.id}>{sep && <li className="day"><span>{d}</span></li>}
            <li className={`msg ${me ? 'me' : 'them'}${m.auto ? ' auto' : ''}${m.id === lastNew ? ' pop' : ''}`}><div className="bub">
              {m.auto ? <span className="tp auto-l">⚡ Otomatik yanıt</span> : m.topic && m.topic !== 'Genel' ? <span className="tp">{m.topic}</span> : null}
              <p>{m.body}</p>
              {m.files?.length > 0 && <div className="mfiles">{m.files.map((f: any) => <a key={f.id} className="mfile" href={`/api/dosya/${f.id}`} target="_blank" rel="noopener"><span>{f.name}</span><small>{fsize(f.size)}</small></a>)}</div>}
              <span className="meta">{me ? '' : m.author + ' · '}{hm(m.created_at)}{me && !m.auto && <> <span className={`tick ${read ? 'seen' : ''}`} aria-label={read ? 'Görüldü' : 'İletildi'}>{read ? '✓✓' : '✓'}</span></>}</span>
            </div></li></Fragment>); })}
        {typing && <li className="msg them typing"><div className="bub" aria-label="NOVAPROJE yazıyor"><i /><i /><i /></div></li>}
      </ol>
      {role === 'admin' && <div className="quick" role="group" aria-label="Hazır yanıtlar">{QUICK.map((q) => <button key={q} type="button" className="chipb" onClick={() => { setText(q); setTimeout(fit, 0); taRef.current?.focus(); }}>{q.length > 38 ? q.slice(0, 36) + '…' : q}</button>)}</div>}
      <form className="compose" onSubmit={(e) => { e.preventDefault(); send(); }} noValidate>
        <label className="sr" htmlFor="m-topic">Konu</label><select id="m-topic" value={topic} onChange={(e) => setTopic(e.target.value)}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
        <label className="sr" htmlFor="m-text">Mesajınız</label>
        <textarea id="m-text" ref={taRef} rows={1} placeholder="Mesajınızı yazın…" value={text} maxLength={4000} onChange={(e) => { setText(e.target.value); fit(); }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !(e.nativeEvent as any).isComposing) { e.preventDefault(); send(); } }} />
        <label className="attach-btn" title="Dosya ekle"><input ref={fileRef} type="file" className="sr" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFiles([...(e.target.files || [])])} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7" /></svg><span className="sr">Dosya ekle</span></label>
        <button type="submit" className="send" aria-label="Gönder" disabled={busy}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l16-8-6 16-3-7z" /><path d="M11 13l9-9" /></svg></button>
        <div className="picked" aria-live="polite">{files.map((f) => <span key={f.name} className="pk">{f.name} · {fsize(f.size)}</span>)}</div>
      </form>
      {err && <div className="alert err" role="alert" style={{ margin: '0 14px 10px' }}>{err}</div>}
      <p className="enter-hint">Enter ile gönderin, Shift + Enter ile alt satıra geçin. Dosya başına en fazla 10 MB.</p>
    </section>
  );
}
