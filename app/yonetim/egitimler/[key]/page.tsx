import { notFound } from 'next/navigation';
import { pkgByKey } from '@/lib/training';
import { PkgView } from '@/components/Training';
import { PageTitle } from '@/components/Shell';
export default function Page({ params }: { params: { key: string } }) { const p = pkgByKey(params.key); if (!p) notFound(); return <><PageTitle title={p.title} crumb={{ href: '/yonetim/egitimler', label: 'Eğitim paketleri' }} /><PkgView p={p} done={new Set()} interactive={false} /></>; }
