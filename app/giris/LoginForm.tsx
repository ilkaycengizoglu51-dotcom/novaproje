'use client';
import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { login, type LoginState } from '@/app/actions/auth';
import { Submit } from '@/components/client-bits';

const greet = () => { const h = new Date().getHours(); return h < 5 ? 'İyi geceler' : h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar'; };
export default function LoginForm({ kind }: { kind: 'admin' | 'client' | 'manager' | 'contractor' }) {
  const [st, action] = useFormState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false), [info, setInfo] = useState(''), [welcome, setWelcome] = useState<null | { name: string; role: string }>(null);
  const router = useRouter();
  useEffect(() => {
    if (!st.ok) return; const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    router.prefetch(st.ok.to); if (reduce) { router.replace(st.ok.to); return; }
    setWelcome({ name: st.ok.name.split(' ')[0], role: st.ok.role });
    const t1 = setTimeout(() => router.replace(st.ok!.to), 1900); return () => clearTimeout(t1);
  }, [st, router]);
  return (
    <>
      <form className="pf" action={action} noValidate>
        <input type="hidden" name="kind" value={kind} />
        <div className="field"><label htmlFor="lg-u">Kullanıcı adı</label><input id="lg-u" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required /></div>
        <div className="field"><label htmlFor="lg-p">Şifre</label><div className="pw-wrap"><input id="lg-p" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required /><button type="button" className="pw-toggle" aria-pressed={show} onClick={() => setShow((v) => !v)}>{show ? 'Gizle' : 'Göster'}</button></div></div>
        {st.error && <div className="alert err" role="alert">{st.error}</div>}
        {info && <div className="alert info" role="status">{info}</div>}
        <div className="row-between"><span /><button type="button" className="linkish" onClick={() => setInfo('Şifrenizi kendiniz sıfırlayamazsınız. Yeni geçici şifre için proje sorumlunuza veya info@novaproje.com adresine başvurun.')}>Şifremi unuttum</button></div>
        <Submit className="btn btn-ink" pending="Giriş yapılıyor">Giriş yap</Submit>
      </form>
      {welcome && (
        <div className="welcome-ov" role="status">
          <div className="wl-glow" aria-hidden="true" />
          <div className="wl-box"><img className="wl-mark" src="/img/revmark_big.webp" alt="" /><p className="wl-hi">{greet()}</p><p className="wl-name">{welcome.name}</p><p className="wl-sub">{welcome.role === 'admin' ? 'Yönetim paneli hazırlanıyor' : welcome.role === 'manager' ? 'Portföyünüz hazırlanıyor' : welcome.role === 'contractor' ? 'İşleriniz hazırlanıyor' : 'Projeniz hazırlanıyor'}</p><span className="wl-bar"><span /></span></div>
        </div>
      )}
    </>
  );
}
