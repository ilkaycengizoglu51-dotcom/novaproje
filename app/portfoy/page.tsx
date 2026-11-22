import Link from 'next/link';
import { requireManager } from '@/lib/auth';
import { q } from '@/lib/db';
import { date, greet } from '@/lib/format';
import { Icon } from '@/components/ui';
import { LeadPill } from '@/components/LeadSteps';
export default async function ManagerHome() {
  const u = await requireManager();
  const [leads, clients] = await Promise.all([q('SELECT id, name, facility, status, created_at, updated_at FROM leads WHERE manager_id = $1 ORDER BY updated_at DESC', [u.id]), q(`SELECT count(*)::int AS n FROM users WHERE manager_id = $1 AND role = 'client'`, [u.id])]);
  const cnt = (s: string[]) => leads.filter((l) => s.includes(l.status)).length;
  const Tile = ({ href, icon, label, big, sub, alert }: any) => <Link className={`tile ${alert ? 'alert' : ''}`} href={href}><span className="tile-ic"><Icon n={icon} /></span><span className="tile-l">{label}</span><b className="tile-n">{big}</b><small>{sub}</small><span className="tile-go" aria-hidden="true">›</span></Link>;
  return (<>
    <section className="hello mgr-hello"><div className="hello-txt"><p className="hello-hi">{greet()}</p><h1 className="hello-name">{u.name.split(' ')[0]}</h1>
      <p className="hello-sub">Yeni danışan adaylarınızı ön kayıt formuyla gönderin; yönetici onayına kadar her adımı buradan izleyin.</p>
      <div className="hello-actions"><Link className="btn btn-lime btn-sm" href="/portfoy/on-kayit/yeni">Yeni ön kayıt</Link><Link className="btn btn-line btn-sm" href="/portfoy/kaynaklar">Sunum ve videolar</Link></div></div>
      <div className="mgr-art" aria-hidden="true"><img src="/img/revmark_big.webp" alt="" /></div></section>
    <nav className="tiles" aria-label="Özet">
      <Tile href="/portfoy/on-kayit" icon="list" label="Onay bekleyen" big={cnt(['gonderildi', 'inceleniyor'])} sub="Yönetici incelemesinde" />
      <Tile href="/portfoy/on-kayit" icon="bolt" label="Eksik bilgi" big={cnt(['eksik'])} sub={cnt(['eksik']) ? 'Sizden bilgi bekleniyor' : 'Bekleyen yok'} alert={cnt(['eksik'])} />
      <Tile href="/portfoy/danisanlar" icon="users" label="Onaylanan" big={cnt(['onaylandi'])} sub={`${clients[0].n} aktif danışan`} />
      <Tile href="/portfoy/kaynaklar" icon="file" label="Kaynaklar" big="Sunum" sub="Sunum dosyası ve videolar" />
    </nav>
    <section className="card"><div className="card-head"><h2>Son ön kayıtlar</h2><Link className="go" href="/portfoy/on-kayit">Tümü ›</Link></div>
      {leads.length ? <ul className="doc-list">{leads.slice(0, 6).map((l) => <li key={l.id} className="doc-row"><div className="doc-main"><b>{l.name}</b><small>{l.facility} · {date(new Date(l.created_at).toISOString())}</small></div><LeadPill s={l.status} /><Link className="btn btn-ghost2 btn-sm" href={`/portfoy/on-kayit/${l.id}`}>Aç</Link></li>)}</ul>
        : <p className="muted">Henüz ön kayıt göndermediniz. <Link href="/portfoy/on-kayit/yeni">İlk ön kaydı oluşturun</Link>.</p>}</section>
  </>);
}
