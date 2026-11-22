import type { Metadata } from 'next';
import { requireManager } from '@/lib/auth';
import { one } from '@/lib/db';
import Shell from '@/components/Shell';
export const metadata: Metadata = { title: 'Portföy yöneticisi' };
export const dynamic = 'force-dynamic';
export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const u = await requireManager();
  const c = await one(`SELECT (SELECT count(*) FROM leads WHERE manager_id = $1 AND status = 'eksik')::int AS missing,
    (SELECT count(*) FROM doc_requests r JOIN users c ON c.id = r.client_id WHERE c.manager_id = $1 AND r.status IN ('bekliyor','reddedildi'))::int AS docs`, [u.id]);
  return (
    <Shell user={u} nav={[
      { href: '/portfoy', icon: 'home', label: 'Genel bakış' },
      { href: '/portfoy/on-kayit/yeni', icon: 'up', label: 'Ön kayıt formu' },
      { href: '/portfoy/on-kayit', icon: 'list', label: 'Ön kayıtlarım', n: c?.missing },
      { href: '/portfoy/parsel', icon: 'map', label: 'Parsel sorgu' },
      { href: '/portfoy/danisanlar', icon: 'users', label: 'Danışanlarım', n: c?.docs },
      { href: '/portfoy/kaynaklar', icon: 'file', label: 'Sunum ve videolar' },
      { href: '/portfoy/egitimler', icon: 'play', label: 'Eğitim paketleri' },
      { href: '/portfoy/hesap', icon: 'key', label: 'Hesabım' },
    ]}>{children}</Shell>
  );
}
