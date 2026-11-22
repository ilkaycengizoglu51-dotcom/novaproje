import { notFound } from 'next/navigation';
import { one, q } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { dt } from '@/lib/format';
import ContractPaper from '@/components/ContractPaper';
import SignForm from '@/components/SignForm';
import { ContractEditor } from '@/components/AdminForms';
import { PageTitle } from '@/components/Shell';
import { Submit } from '@/components/client-bits';
import { cancelContract, duplicateContract } from '@/app/actions/admin';
export default async function AdminContract({ params }: { params: { id: string } }) {
  const a = await requireAdmin();
  const c = await one('SELECT c.*, p.name AS project, u.name AS client_name, u.email AS client_email, u.role AS client_role FROM contracts c JOIN projects p ON p.id = c.project_id JOIN users u ON u.id = c.client_id WHERE c.id = $1', [Number(params.id)]); if (!c) notFound();
  const [audit, att] = await Promise.all([q('SELECT at, who, what, ip FROM contract_audit WHERE contract_id = $1 ORDER BY at', [c.id]), c.attachment_id ? one('SELECT id, name, size FROM files WHERE id = $1', [c.attachment_id]) : null]);
  const sub = c.client_role === 'contractor', party = sub ? 'Taşeron' : 'Danışan';
  const mail = `mailto:${encodeURIComponent(c.client_email || '')}?subject=${encodeURIComponent('NOVAPROJE — İmzanızı bekleyen sözleşme')}&body=${encodeURIComponent(`Sayın ${c.client_name},\n\n“${c.title}” ${sub ? 'taşeron' : 'danışan'} panelinizde imzanızı bekliyor.\n${(process.env.SITE_URL || '')}/${sub ? 'taseron' : 'panel'}/sozlesmeler/${c.id}\n\nSaygılarımızla,\nNOVAPROJE`)}`;
  const H = (p: any) => <input type="hidden" {...p} />;
  return (
    <><PageTitle title={c.title} crumb={{ href: '/yonetim/sozlesmeler', label: 'Sözleşmeler' }} />
      <p className="muted">{party}: {c.client_name}</p>
      <ContractPaper c={c} project={c.project} attachment={att} party={party} />
      {['taslak', 'revizyon'].includes(c.status) && <ContractEditor c={c} />}
      {c.status === 'imzalandi' && <SignForm id={c.id} name={a.name} admin />}
      <section className="card"><h2>İşlemler</h2><div className="toolbar">
        {c.status === 'gonderildi' && <a className="btn btn-ghost2 btn-sm" href={mail}>{party}a e-posta ile hatırlat</a>}
        {!['tamamlandi', 'iptal'].includes(c.status) && <form action={cancelContract} className="inline-form"><H name="id" value={c.id} /><Submit className="btn btn-red btn-sm" confirm={`Sözleşme iptal edilsin mi? ${party} artık imzalayamaz.`}>Sözleşmeyi iptal et</Submit></form>}
        {['iptal', 'tamamlandi'].includes(c.status) && <form action={duplicateContract} className="inline-form"><H name="id" value={c.id} /><Submit className="btn btn-ghost2 btn-sm">Yeni sürüm oluştur</Submit></form>}
      </div>
      <h3 style={{ fontSize: 14, marginTop: 6 }}>İşlem geçmişi</h3><ul className="log">{audit.map((x, i) => <li key={i}><time>{dt(x.at)}</time><span><b>{x.who}</b> · {x.what}{x.ip ? ` · IP ${x.ip}` : ''}</span></li>)}</ul></section>
    </>
  );
}
