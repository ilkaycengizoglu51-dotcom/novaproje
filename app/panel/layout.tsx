import type { Metadata } from 'next';
import { requireClient } from '@/lib/auth';
import { clientCounts } from '@/lib/data';
import Shell from '@/components/Shell';

export const metadata: Metadata = { title: 'Danışan paneli' };
export const dynamic = 'force-dynamic';
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const u = await requireClient(); const c = await clientCounts(u.id);
  return (
    <Shell user={u} nav={[
      { href: '/panel', icon: 'home', label: 'Genel bakış' },
      { href: '/panel/mesajlar', icon: 'chat', label: 'Mesajlar', n: c.msgs },
      { href: '/panel/sozlesmeler', icon: 'sign', label: 'Sözleşmeler', n: c.sign },
      { href: '/panel/belgeler', icon: 'up', label: 'Belgelerim', n: c.docs },
      { href: '/panel/egitimler', icon: 'play', label: 'Eğitim paketleri' },
      { href: '/panel/sertifikalar', icon: 'star', label: 'Sertifikalarım' },
      { href: '/panel/odemeler', icon: 'pay', label: 'Ödemelerim' },
      { href: '/panel/hesap', icon: 'key', label: 'Hesabım' },
    ]}>{children}</Shell>
  );
}
