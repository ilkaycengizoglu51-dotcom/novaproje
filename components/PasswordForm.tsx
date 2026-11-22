'use client';
import { useFormState } from 'react-dom';
import { changePassword, type PwState } from '@/app/actions/auth';
import { Submit } from './client-bits';
export default function PasswordForm() {
  const [st, action] = useFormState<PwState, FormData>(changePassword, {});
  return (
    <section className="card" style={{ maxWidth: 560 }}><h2>Şifre değiştir</h2><p className="muted">En az 10 karakter; en az bir harf ve bir rakam.</p>
      {st.ok ? <div className="alert ok" role="status">Şifreniz değiştirildi.</div> : null}
      {st.error && <div className="alert err" role="alert">{st.error}</div>}
      <form className="pf" action={action}>
        <div className="field"><label htmlFor="pw-c">Mevcut şifre</label><input id="pw-c" name="current" type="password" autoComplete="current-password" /></div>
        <div className="field"><label htmlFor="pw-n">Yeni şifre</label><input id="pw-n" name="next" type="password" autoComplete="new-password" /></div>
        <div className="field"><label htmlFor="pw-a">Yeni şifre (tekrar)</label><input id="pw-a" name="again" type="password" autoComplete="new-password" /></div>
        <div><Submit pending="Kaydediliyor">Şifreyi değiştir</Submit></div>
      </form></section>
  );
}
