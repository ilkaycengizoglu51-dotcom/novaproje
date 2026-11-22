import { q } from '@/lib/db';
import { date, dt } from '@/lib/format';
import { PageTitle } from '@/components/Shell';
import { NewClientForm, ResetButton } from '@/components/ClientForms';
import { Submit } from '@/components/client-bits';
import { toggleClient, updateClient } from '@/app/actions/admin';

export default async function Clients({ searchParams }: { searchParams: { q?: string } }) {
  const term = (searchParams.q || '').trim();
  const list = await q(`SELECT u.*, (SELECT count(*)::int FROM projects p WHERE p.client_id = u.id) AS projects, (SELECT name FROM users m WHERE m.id = u.manager_id) AS manager FROM users u WHERE role = 'client'
    AND ($1 = '' OR u.name ILIKE '%'||$1||'%' OR u.username ILIKE '%'||$1||'%' OR u.email ILIKE '%'||$1||'%') ORDER BY u.created_at DESC`, [term]);
  const taken = (await q('SELECT username FROM users')).map((r) => r.username);
  return (
    <>
      <PageTitle title="Danışanlar" />
      <section className="card"><div className="card-head"><h2>Danışan hesapları</h2><form className="toolbar" role="search"><label className="sr" htmlFor="q">Danışan ara</label><input id="q" name="q" type="search" defaultValue={term} placeholder="Ad, kullanıcı adı veya e-posta" /></form></div>
        {list.length ? <div className="tw"><table className="tb"><thead><tr><th scope="col">Danışan</th><th scope="col">Kullanıcı adı</th><th scope="col" className="num">Proje</th><th scope="col">Son giriş</th><th scope="col">Durum</th><th scope="col"><span className="sr">İşlemler</span></th></tr></thead>
          <tbody>{list.map((u) => { const exp = u.must_change_password && u.temp_password_expires_at && new Date(u.temp_password_expires_at) < new Date(); return (
            <tr key={u.id} className={u.active ? '' : 'off'}>
              <td>{u.name}<small>{u.email || 'E-posta yok'}{u.manager ? ` · Portföy: ${u.manager}` : ''}</small>
                <details><summary className="btn-link" style={{ listStyle: 'none' }}>Düzenle</summary><form className="af" action={updateClient} style={{ marginTop: 8, minWidth: 260 }}><input type="hidden" name="id" value={u.id} />
                  <div className="field wide"><label htmlFor={`en-${u.id}`}>Ad</label><input id={`en-${u.id}`} name="name" defaultValue={u.name} /></div><div className="field wide"><label htmlFor={`ee-${u.id}`}>E-posta</label><input id={`ee-${u.id}`} name="email" type="email" defaultValue={u.email || ''} /></div>
                  <div className="field wide"><label htmlFor={`ep-${u.id}`}>Telefon (iç kayıt)</label><input id={`ep-${u.id}`} name="phone" defaultValue={u.phone || ''} /></div><div className="wide"><Submit className="btn btn-ink btn-sm">Kaydet</Submit></div></form></details></td>
              <td><code>{u.username}</code></td><td className="num">{u.projects}</td><td>{u.last_login_at ? dt(u.last_login_at) : 'Henüz giriş yapmadı'}</td>
              <td>{u.active ? 'Açık' : 'Kapalı'}{u.must_change_password && <small>{exp ? <span className="late">Geçici şifre süresi doldu</span> : <>Geçici şifre{u.temp_password_expires_at ? ` · ${date(new Date(u.temp_password_expires_at).toISOString())} tarihine kadar` : ''}</>}</small>}</td>
              <td><div className="acts"><ResetButton id={u.id} name={u.name} /><form action={toggleClient} className="inline-form"><input type="hidden" name="id" value={u.id} /><Submit className={`btn-link ${u.active ? 'red' : ''}`} confirm={u.active ? `${u.name} hesabı kapatılsın mı? Giriş yapamaz.` : undefined}>{u.active ? 'Hesabı kapat' : 'Hesabı aç'}</Submit></form></div></td>
            </tr>); })}</tbody></table></div> : <p className="muted">{term ? 'Aramanızla eşleşen danışan yok.' : 'Henüz danışan yok. Aşağıdan ilk hesabı açın.'}</p>}</section>
      <NewClientForm taken={taken} />
    </>
  );
}
