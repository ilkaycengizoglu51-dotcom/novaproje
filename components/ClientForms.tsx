'use client';
import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { createClient, resetClientPassword, type ClientState } from '@/app/actions/admin';
import { CopyBtn, Submit } from './client-bits';

const tr = (s: string) => s.toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/i̇/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[âà]/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u');
const gen = () => { const a = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => a[b % a.length]).join(''); };
const strength = (pw: string) => { let s = 0; if (pw.length >= 10) s++; if (pw.length >= 14) s++; if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++; return Math.min(4, s); };
const PWL = ['Çok zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok güçlü'];
const fdate = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function Creds({ c }: { c: NonNullable<ClientState['creds']> }) {
  const [hide, setHide] = useState(false); if (hide) return null;
  const mgr = c.role === 'manager', sub = c.role === 'contractor', panel = mgr ? 'portföy yöneticisi paneli' : sub ? 'taşeron paneli' : 'danışan paneli';
  const url = typeof window !== 'undefined' ? location.origin + (mgr ? '/giris?tur=portfoy' : sub ? '/giris?tur=taseron' : '/giris') : '/giris';
  const msg = `Sayın ${c.name},\n\nNOVAPROJE ${panel} hesabınız ${c.reset ? 'için yeni geçici şifre oluşturuldu' : 'açıldı'}.\nGiriş adresi: ${url}\nKullanıcı adı: ${c.username}\nGeçici şifre: ${c.password}\n\nGeçici şifreniz ${fdate(c.exp)} tarihine kadar geçerlidir; ilk girişte kendi şifrenizi belirlemeniz istenecektir.\n\nSaygılarımızla,\nNOVAPROJE Tarımsal Mühendislik`;
  const mail = `mailto:${encodeURIComponent(c.email || '')}?subject=${encodeURIComponent(`NOVAPROJE ${panel} hesabınız`)}&body=${encodeURIComponent(`Sayın ${c.name},\n\nNOVAPROJE ${panel} hesabınız ${c.reset ? 'güncellendi' : 'açıldı'}.\nGiriş adresi: ${url}\nKullanıcı adı: ${c.username}\n\nGeçici şifreniz size ayrıca iletilecektir.\n\nSaygılarımızla,\nNOVAPROJE Tarımsal Mühendislik`)}`;
  return (
    <div className="creds" role="status"><b>{c.reset ? 'Yeni geçici şifre üretildi.' : 'Hesap açıldı.'} Şifre yalnızca şimdi görünür.</b>
      <dl><div><dt>Kullanıcı adı</dt><dd><code>{c.username}</code> <CopyBtn text={c.username} /></dd></div><div><dt>Geçici şifre</dt><dd><code>{c.password}</code> <CopyBtn text={c.password} /></dd></div><div><dt>Geçerlilik</dt><dd>{fdate(c.exp)} tarihine kadar</dd></div><div><dt>E-posta</dt><dd>{c.email || '—'}</dd></div></dl>
      <div className="toolbar">{c.email && <a className="btn btn-ink btn-sm" href={mail}>Hoş geldiniz e-postası (şifresiz)</a>}<CopyBtn text={msg} label="Tam mesajı kopyala" className="btn btn-ghost2 btn-sm" /><button type="button" className="btn-link" onClick={() => setHide(true)}>Kapat</button></div>
      <p className="hint">Güvenlik için kullanıcı adını e-postayla, geçici şifreyi ayrı bir kanaldan (SMS, WhatsApp veya yüz yüze) iletmeniz önerilir.</p></div>
  );
}
export function NewClientForm({ taken, role = 'client' }: { taken: string[]; role?: 'client' | 'manager' | 'contractor' }) {
  const mgr = role === 'manager', sub = role === 'contractor';
  const [st, action] = useFormState<ClientState, FormData>(createClient, {});
  const [name, setName] = useState(''), [user, setUser] = useState(''), [touched, setTouched] = useState(false), [pw, setPw] = useState(''), [days, setDays] = useState('7');
  useEffect(() => setPw(gen()), []);
  useEffect(() => { if (st.creds) { setName(''); setUser(''); setTouched(false); setPw(gen()); } }, [st.creds]);
  const used = useMemo(() => new Set([...taken, ...(st.creds ? [st.creds.username] : [])]), [taken, st.creds]);
  const suggest = (n: string) => { const p = tr(n).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean); if (!p.length) return ''; let b = (p.length > 1 ? p[0] + '.' + p[p.length - 1] : p[0]).slice(0, 32); if (b.length < 3) b = (b + '.np').slice(0, 32); let u = b, i = 2; while (used.has(u)) u = b + i++; return u; };
  const ok = /^[a-z0-9._-]{3,40}$/.test(user), free = !used.has(user), s = strength(pw);
  return (
    <section className="card" id="ncCard"><div className="card-head"><h2>{mgr ? 'Yeni portföy yöneticisi hesabı' : sub ? 'Yeni taşeron hesabı' : 'Yeni danışan hesabı'}</h2><span className="pill c-tamamlandi">Dışarıdan kayıt kapalı</span></div>
      <ol className="nc-steps"><li>{mgr ? 'Portföy yöneticisinin' : sub ? 'Taşeronun (firma yetkilisinin)' : 'Danışanın'} bilgilerini girin; kullanıcı adı otomatik önerilir.</li><li>Sistem güçlü bir geçici şifre üretir.</li><li>Hesabı açın, bilgileri iletin. İlk girişte kendi şifresini belirler.</li></ol>
      {st.creds && <Creds c={st.creds} />}
      {st.error && <div className="alert err" role="alert">{st.error}</div>}
      <form className="af" action={action} noValidate><input type="hidden" name="role" value={role} />
        {sub && <div className="field"><label htmlFor="nc-c">Firma unvanı <span className="opt">(isteğe bağlı)</span></label><input id="nc-c" name="company" autoComplete="off" placeholder="Ör. Yıldız Elektrik Ltd. Şti." /></div>}
        <div className="field"><label htmlFor="nc-n">{mgr ? 'Ad soyad' : sub ? 'Yetkili ad soyad' : 'Ad soyad / firma'}</label><input id="nc-n" name="name" value={name} autoComplete="off" onChange={(e) => { setName(e.target.value); if (!touched) setUser(suggest(e.target.value)); }} /></div>
        <div className="field"><label htmlFor="nc-e">E-posta</label><input id="nc-e" name="email" type="email" autoComplete="off" /><span className="hint">Bildirimler ve hoş geldiniz e-postası bu adrese gider.</span></div>
        <div className="field"><label htmlFor="nc-u">Kullanıcı adı</label><div className="inline"><input id="nc-u" name="username" value={user} autoCapitalize="none" spellCheck={false} placeholder="ad.soyad" onChange={(e) => { setUser(e.target.value.toLocaleLowerCase('tr')); setTouched(true); }} /><button type="button" className="btn btn-ghost2 btn-sm" onClick={() => { setUser(suggest(name)); setTouched(false); }}>Öner</button></div>
          <span className={`hint ${user ? (ok && free ? 'good' : 'bad') : ''}`}>{!user ? 'Küçük harf, rakam, nokta, tire; Türkçe karakter kullanılmaz.' : !ok ? '3–40 karakter; yalnızca küçük harf, rakam, nokta, tire ve alt çizgi.' : free ? '✓ Kullanılabilir' : '✗ Bu kullanıcı adı alınmış'}</span></div>
        <div className="field"><label htmlFor="nc-p">Telefon <span className="opt">(isteğe bağlı, yalnızca iç kayıt)</span></label><input id="nc-p" name="phone" type="tel" /></div>
        <div className="field"><label htmlFor="nc-w">Geçici şifre</label><div className="inline"><input id="nc-w" name="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" spellCheck={false} className="mono" /><button type="button" className="btn btn-ghost2 btn-sm" onClick={() => setPw(gen())}>Yeniden üret</button></div>
          <div className="meter" aria-hidden="true"><span className={`m${s}`} style={{ width: `${(s + 1) * 20}%` }} /></div><span className="hint">Şifre gücü: {PWL[s]}</span></div>
        <div className="field"><label htmlFor="nc-x">Geçici şifre geçerliliği</label><select id="nc-x" name="days" value={days} onChange={(e) => setDays(e.target.value)}><option value="3">3 gün</option><option value="7">7 gün</option><option value="14">14 gün</option><option value="30">30 gün</option></select><span className="hint">Süre dolarsa kullanıcı giriş yapamaz; yeni şifre üretirsiniz.</span></div>
        <div className="wide"><Submit pending="Açılıyor">Hesabı aç</Submit></div>
      </form></section>
  );
}
export function ResetButton({ id, name }: { id: number; name: string }) {
  const [st, action] = useFormState<ClientState, FormData>(resetClientPassword, {});
  return (<><form action={action} className="inline-form"><input type="hidden" name="id" value={id} /><Submit className="btn-link" confirm={`${name} için yeni geçici şifre üretilsin mi? Eski şifre hemen geçersiz olur.`}>Şifre sıfırla</Submit></form>
    {st.error && <span className="hint bad">{st.error}</span>}{st.creds && <div style={{ flexBasis: '100%' }}><Creds c={st.creds} /></div>}</>);
}
