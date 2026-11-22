import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { adminCounts } from '@/lib/data';
import Shell from '@/components/Shell';
export const metadata: Metadata = { title: 'Yönetim' };
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await requireAdmin(); const c = await adminCounts();
  return (
    <Shell user={u} nav={[
      { href: '/yonetim', icon: 'home', label: 'Genel bakış' },
      { href: '/yonetim/mesajlar', icon: 'chat', label: 'Mesajlar', n: c.msgs },
      { href: '/yonetim/on-kayitlar', icon: 'inbox', label: 'Ön kayıtlar', n: c.leads },
      { href: '/yonetim/danisanlar', icon: 'users', label: 'Danışanlar' },
      { href: '/yonetim/portfoy', icon: 'users', label: 'Portföy yöneticileri' },
      { href: '/yonetim/taseronlar', icon: 'list', label: 'Taşeronlar' },
      { href: '/yonetim/projeler', icon: 'folder', label: 'Projeler' },
      { href: '/yonetim/parsel', icon: 'map', label: 'Parsel sorgu' },
      { href: '/yonetim/sozlesmeler', icon: 'sign', label: 'Sözleşmeler', n: c.contracts },
      { href: '/yonetim/belgeler', icon: 'up', label: 'Belgeler', n: c.docs },
      { href: '/yonetim/sertifikalar', icon: 'star', label: 'Sertifikalar', n: c.certs },
      { href: '/yonetim/tahsilat', icon: 'pay', label: 'Tahsilat' },
      { href: '/yonetim/teklifler', icon: 'inbox', label: 'Teklif talepleri', n: c.quotes },
      { href: '/yonetim/egitimler', icon: 'play', label: 'Eğitim paketleri' },
      { href: '/yonetim/kaynaklar', icon: 'file', label: 'Sunum ve videolar' },
      { href: '/yonetim/referanslar', icon: 'star', label: 'Referanslar' },
      { href: '/yonetim/kayit', icon: 'list', label: 'İşlem kaydı' },
      { href: '/yonetim/hesap', icon: 'key', label: 'Hesabım' },
    ]}>{children}</Shell>
  );
}
