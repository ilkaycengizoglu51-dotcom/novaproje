'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export default function SideNav({ items, root, site }: { items: { href: string; label: string; n?: number; svg: ReactNode }[]; root: string; site: ReactNode }) {
  const path = usePathname() || '';
  const isOn = (h: string) => (h === root ? path === root : path === h || path.startsWith(h + '/'));
  return (
    <nav aria-label="Panel menüsü">
      {items.map((n) => (
        <Link key={n.href} href={n.href} aria-current={isOn(n.href) ? 'page' : undefined} onClick={() => document.getElementById('sb')?.classList.remove('open')}>{n.svg}{n.label}{n.n ? <span className="nb">{n.n}</span> : null}</Link>
      ))}
      <a href="/">{site}Web sitesine dön</a>
    </nav>
  );
}
