import { notFound } from 'next/navigation';
import { clientIp, requireClient } from '@/lib/auth';
import { one, q } from '@/lib/db';
import ContractPaper from '@/components/ContractPaper';
import SignForm from '@/components/SignForm';
import { PageTitle } from '@/components/Shell';
import { requestRevision } from '@/app/actions/client';
import { Submit } from '@/components/client-bits';

export default async function ContractPage({ params }: { params: { id: string } }) {
  const u = await requireClient();
  const c = await one('SELECT c.*, p.name AS project FROM contracts c JOIN projects p ON p.id = c.project_id WHERE c.id = $1', [Number(params.id)]);
  if (!c || c.client_id !== u.id || c.status === 'taslak') notFound();
  if (!c.viewed_at) { await q('UPDATE contracts SET viewed_at = now() WHERE id = $1', [c.id]); await q('INSERT INTO contract_audit (contract_id, who, what, ip) VALUES ($1,$2,$3,$4)', [c.id, u.name, 'Sözleşmeyi görüntüledi', clientIp()]); }
  const att = c.attachment_id ? await one('SELECT id, name, size FROM files WHERE id = $1', [c.attachment_id]) : null;
  return (
    <>
      <PageTitle title={c.title} crumb={{ href: '/panel/sozlesmeler', label: 'Sözleşmeler' }} />
      <ContractPaper c={c} project={c.project} attachment={att} />
      {c.status === 'gonderildi' && <>
        <SignForm id={c.id} name={u.name} />
        <details className="card"><summary style={{ cursor: 'pointer', fontWeight: 700 }}>Sözleşmede değişiklik talep et</summary>
          <form className="pf" action={requestRevision} style={{ marginTop: 12 }}><input type="hidden" name="id" value={c.id} /><div className="field"><label htmlFor="rv">Hangi değişikliği istiyorsunuz?</label><textarea id="rv" name="note" rows={3} required minLength={5} /></div><div><Submit className="btn btn-ghost2 btn-sm">Talebi gönder</Submit></div></form></details>
      </>}
    </>
  );
}
