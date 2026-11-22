import { requireClient } from '@/lib/auth';
import PasswordForm from '@/components/PasswordForm';
import { PageTitle } from '@/components/Shell';
export default async function Account() {
  const u = await requireClient();
  return <><PageTitle title="Hesabım" /><PasswordForm />
    <section className="card" style={{ maxWidth: 560 }}><h2>Hesap bilgileri</h2><dl className="meta3" style={{ gridTemplateColumns: '1fr 1fr' }}><div><dt>Ad</dt><dd>{u.name}</dd></div><div><dt>Kullanıcı adı</dt><dd>{u.username}</dd></div><div><dt>E-posta</dt><dd>{u.email || '—'}</dd></div></dl>
      <p className="muted" style={{ fontSize: 13 }}>Bilgilerinizde değişiklik için NOVAPROJE ile iletişime geçin.</p></section></>;
}
