import { requireClient } from '@/lib/auth';
import { installmentsOfClient } from '@/lib/data';
import { Kpis, PayTable } from '@/components/ui';
import { PageTitle } from '@/components/Shell';
export default async function Payments() {
  const u = await requireClient(); const l = await installmentsOfClient(u.id);
  return <><PageTitle title="Ödemelerim" /><Kpis list={l} /><section className="card"><h2>Tüm taksitler</h2><PayTable list={l} showProject linkBase="/panel/proje/" /></section></>;
}
