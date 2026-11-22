import { q } from '@/lib/db';
import { initials } from '@/lib/format';
import { PartnerForm } from '@/components/AdminForms';
import { PageTitle } from '@/components/Shell';
import { Submit } from '@/components/client-bits';
import { partnerAction } from '@/app/actions/admin';
export default async function Partners() {
  const l = await q('SELECT * FROM partners ORDER BY sort, id');
  const Act = ({ id, act, label, red, confirm }: any) => <form action={partnerAction} className="inline-form"><input type="hidden" name="id" value={id} /><input type="hidden" name="act" value={act} /><Submit className={`btn-link ${red ? 'red' : ''}`} confirm={confirm}>{label}</Submit></form>;
  return (
    <><PageTitle title="Referanslar" />
      <p className="muted" style={{ maxWidth: '80ch' }}>Buradaki firmalar web sitesindeki “Referanslar ve çözüm ortaklarımız” bölümünde görünür. Yalnızca birlikte çalıştığınız ve adını kullanma izni aldığınız firmaları yayına alın. Hiç firma yoksa sitede çalıştığımız alanlar gösterilir.</p>
      <section className="card"><h2>Firmalar</h2>{l.length ? <div className="tw"><table className="tb"><thead><tr><th scope="col"><span className="sr">Logo</span></th><th scope="col">Firma</th><th scope="col">Kategori</th><th scope="col">Durum</th><th scope="col"><span className="sr">İşlemler</span></th></tr></thead>
        <tbody>{l.map((x, i) => <tr key={x.id} className={x.visible ? '' : 'off'}><td>{x.logo_id ? <img className="thumb" src={`/api/dosya/${x.logo_id}`} alt="" /> : <span className="thumb-m" aria-hidden="true">{initials(x.name)}</span>}</td>
          <td>{x.name}{x.city && <small>{x.city}</small>}<details><summary className="btn-link" style={{ listStyle: 'none' }}>Düzenle</summary><PartnerForm p={x} /></details></td><td>{x.category}</td><td>{x.visible ? 'Yayında' : 'Gizli'}</td>
          <td><div className="acts"><Act id={x.id} act="vis" label={x.visible ? 'Gizle' : 'Yayınla'} />{i > 0 && <Act id={x.id} act="up" label="Yukarı" />}<Act id={x.id} act="del" label="Sil" red confirm={`"${x.name}" silinsin mi?`} /></div></td></tr>)}</tbody></table></div> : <p className="muted">Henüz firma eklenmedi.</p>}</section>
      <section className="card"><h2>Yeni firma ekle</h2><PartnerForm /></section>
    </>
  );
}
