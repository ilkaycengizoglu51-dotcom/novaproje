import { notFound } from 'next/navigation';
import { requireManager } from '@/lib/auth';
import { pkgByKey } from '@/lib/training';
import { PkgView } from '@/components/Training';
import { PageTitle } from '@/components/Shell';
export default async function Page({ params }: { params: { key: string } }) { await requireManager(); const p = pkgByKey(params.key); if (!p) notFound(); return <><PageTitle title={p.title} crumb={{ href: '/portfoy/egitimler', label: 'Eğitim paketleri' }} /><PkgView p={p} done={new Set()} interactive={false} /></>; }
