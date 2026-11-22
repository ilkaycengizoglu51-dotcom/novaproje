import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, Logo } from './ui';
import { MobileMenu } from './client-bits';
import SideNav from './SideNav';
import { logout } from '@/app/actions/auth';
import type { User } from '@/lib/auth';

export default function Shell({ user, nav, children }: { user: User; nav: { href: string; icon: string; label: string; n?: number }[]; children: ReactNode }) {
  const home = user.role === 'admin' ? '/yonetim' : user.role === 'manager' ? '/portfoy' : user.role === 'contractor' ? '/taseron' : '/panel';
  return (
    <div className="pa">
      <div className="mtop"><Logo /><MobileMenu /></div>
      <div className="shell enter">
        <aside className="sb" id="sb">
          <Link href={home} aria-label="Panel ana sayfası"><Logo /></Link>
          <span className="sb-role">{user.role === 'admin' ? 'Yönetim paneli' : user.role === 'manager' ? 'Portföy yöneticisi' : user.role === 'contractor' ? 'Taşeron paneli' : 'Danışan paneli'}</span>
          <SideNav items={nav.map((n) => ({ ...n, svg: <Icon n={n.icon} /> }))} root={home} site={<Icon n="site" />} />
          <div className="sb-user"><b>{user.name}</b><span>@{user.username}</span><button type="button" className="btn-out" data-pwa-install hidden>Uygulamayı yükle</button><form action={logout}><button type="submit" className="btn-out">Çıkış yap</button></form></div>
        </aside>
        <main className="pmain2">
          {user.must_change_password && <p className="warn" role="status">Size verilen geçici şifreyi kullanıyorsunuz. Güvenliğiniz için <Link href={`${home}/hesap`}>şifrenizi şimdi değiştirin</Link>.</p>}
          {children}
        </main>
      </div>
    </div>
  );
}
export const PageTitle = ({ title, crumb }: { title: string; crumb?: { href: string; label: string } }) => (
  <div className="ptop"><div>{crumb && <Link className="crumb" href={crumb.href}>‹ {crumb.label}</Link>}<h1>{title}</h1></div></div>
);
