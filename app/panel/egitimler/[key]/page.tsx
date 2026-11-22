import { notFound } from 'next/navigation';
import { requireClient } from '@/lib/auth';
import { q } from '@/lib/db';
import { pkgByKey } from '@/lib/training';
import { PkgView } from '@/components/Training';
import { PageTitle } from '@/components/Shell';
export const dynamic = 'force-dynamic';
export default async function Training({ params }: { params: { key: string } }) {
  const u = await requireClient(); const p = pkgByKey(params.key); if (!p) notFound();
  const done = new Set((await q('SELECT item FROM training_progress WHERE user_id = $1', [u.id])).map((r) => r.item));
  return <><PageTitle title={p.title} crumb={{ href: '/panel/egitimler', label: 'Eğitim paketleri' }} /><PkgView p={p} done={done} interactive /></>;
}
