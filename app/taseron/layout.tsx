import type { Metadata } from 'next';
import { requireContractor } from '@/lib/auth';
import { one } from '@/lib/db';
import Shell from '@/components/Shell';
export const metadata: Metadata = { title: 'Taşeron paneli' };
export const dynamic = 'force-dynamic';
export default async function ContractorLayout({ children }: { children: React.ReactNode }) {
  const u = await requireContractor();
  const c = await one(`SELECT (SELECT count(*) FROM contracts WHERE client_id = $1 AND status = 'gonderildi')::int AS sign,
    (SELECT count(*) FROM doc_requests WHERE client_id = $1 AND status IN ('bekliyor','reddedildi'))::int AS docs`, [u.id]);
  return (
    <Shell user={u} nav={[
      { href: '/taseron', icon: 'home', label: 'İşlerim' },
      { href: '/taseron/sozlesmeler', icon: 'sign', label: 'Sözleşmeler', n: c?.sign },
      { href: '/taseron/belgeler', icon: 'up', label: 'Belgeler', n: c?.docs },
      { href: '/taseron/hesap', icon: 'key', label: 'Hesabım' },
    ]}>{children}</Shell>
  );
}
