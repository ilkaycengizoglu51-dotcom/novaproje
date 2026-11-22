import { allInstallments } from '@/lib/data';
import { Kpis, PayTable } from '@/components/ui';
import { PageTitle } from '@/components/Shell';
import { Submit } from '@/components/client-bits';
import { togglePaid } from '@/app/actions/admin';
export default async function Collections() {
  const l = await allInstallments();
  return <><PageTitle title="Tahsilat" /><Kpis list={l} /><section className="card"><h2>Tüm taksitler</h2>
    <PayTable list={l} showProject linkBase="/yonetim/projeler/" actions={(i) => <form action={togglePaid} className="inline-form"><input type="hidden" name="id" value={i.id} /><Submit className="btn-link">{i.paid_at ? 'Ödenmedi yap' : 'Ödendi işaretle'}</Submit></form>} /></section></>;
}
