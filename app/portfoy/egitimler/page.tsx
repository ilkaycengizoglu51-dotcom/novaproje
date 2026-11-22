import TrainingAdmin from '@/components/TrainingAdmin';
import { PageTitle } from '@/components/Shell';
import { requireManager } from '@/lib/auth';
export default async function Page() { const u = await requireManager(); return <><PageTitle title="Eğitim paketleri" /><p className="muted" style={{ maxWidth: '80ch' }}>Danışan görüşmelerinde de gösterebileceğiniz sektör eğitimleri ve danışanlarınızın ilerlemesi.</p><TrainingAdmin base="/portfoy/egitimler" managerId={u.id} /></>; }
