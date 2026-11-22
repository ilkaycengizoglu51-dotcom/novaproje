import { q } from '@/lib/db';
import { dt } from '@/lib/format';
import { PageTitle } from '@/components/Shell';
import { NewClientForm, ResetButton } from '@/components/ClientForms';
import { Submit } from '@/components/client-bits';
import { toggleClient } from '@/app/actions/admin';
export default async function Managers() {
  const l = await q(`SELECT u.*, (SELECT count(*)::int FROM leads WHERE manager_id = u.id) AS leads, (SELECT count(*)::int FROM leads WHERE manager_id = u.id AND status = 'onaylandi') AS ok,
    (SELECT count(*)::int FROM users c WHERE c.manager_id = u.id) AS clients FROM users u WHERE role = 'manager' ORDER BY u.created_at DESC`);
  const taken = (await q('SELECT username FROM users')).map((r) => r.username);
  return (<><PageTitle title="Portföy yöneticileri" />
    <p className="muted" style={{ maxWidth: '80ch' }}>Portföy yöneticileri danışan adaylarını ön kayıt formuyla gönderir, onay sürecini izler, sunum ve videolara erişir ve kendi danışanları adına belge yükler. Diğer danışanların bilgilerini göremezler.</p>
    <section className="card"><h2>Hesaplar</h2>{l.length ? <div className="tw"><table className="tb"><thead><tr><th scope="col">Portföy yöneticisi</th><th scope="col">Kullanıcı adı</th><th scope="col" className="num">Ön kayıt</th><th scope="col" className="num">Onaylanan</th><th scope="col">Son giriş</th><th scope="col"><span className="sr">İşlemler</span></th></tr></thead>
      <tbody>{l.map((u) => <tr key={u.id} className={u.active ? '' : 'off'}><td>{u.name}<small>{u.email}</small></td><td><code>{u.username}</code></td><td className="num">{u.leads}</td><td className="num">{u.ok}<small>{u.clients} danışan</small></td><td>{u.last_login_at ? dt(u.last_login_at) : 'Henüz giriş yapmadı'}{u.must_change_password && <small>Geçici şifre</small>}</td>
        <td><div className="acts"><ResetButton id={u.id} name={u.name} /><form action={toggleClient} className="inline-form"><input type="hidden" name="id" value={u.id} /><Submit className={`btn-link ${u.active ? 'red' : ''}`} confirm={u.active ? `${u.name} hesabı kapatılsın mı?` : undefined}>{u.active ? 'Hesabı kapat' : 'Hesabı aç'}</Submit></form></div></td></tr>)}</tbody></table></div> : <p className="muted">Henüz portföy yöneticisi yok. Aşağıdan ilk hesabı açın.</p>}</section>
    <NewClientForm taken={taken} role="manager" /></>);
}
