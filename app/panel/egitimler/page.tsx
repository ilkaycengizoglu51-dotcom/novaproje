import { requireClient } from '@/lib/auth';
import { q } from '@/lib/db';
import { PACKAGES, packagesFor, pctOf } from '@/lib/training';
import { PkgCard } from '@/components/Training';
import { AkademiCard } from '@/components/Certs';
import { PageTitle } from '@/components/Shell';
export const dynamic = 'force-dynamic';
export default async function Trainings() {
  const u = await requireClient();
  const [ps, pr] = await Promise.all([q('SELECT type FROM projects WHERE client_id = $1', [u.id]), q('SELECT item FROM training_progress WHERE user_id = $1', [u.id])]);
  const done = new Set(pr.map((r) => r.item)), mine = packagesFor(ps.map((p) => p.type)), others = PACKAGES.filter((p) => !mine.includes(p));
  const avg = mine.length ? Math.round(mine.reduce((s, p) => s + pctOf(p, done), 0) / mine.length) : 0;
  return (<>
    <PageTitle title="Eğitim paketleri" />
    <section className="tv-intro"><div><p className="akd-kicker">Size özel</p><h2>Projenize göre hazırlanan eğitimler</h2><p>Projenizin sektörüne göre seçilen kısa videolu eğitimler. İşletmenizin nasıl işleyeceğini, tesisin bölümlerini ve dikkat edilmesi gerekenleri öğrenin.</p></div>
      <div className="tv-ring" role="img" aria-label={`Genel ilerleme yüzde ${avg}`}><b>%{avg}</b><small>tamamlandı</small></div></section>
    <div className="tpk-grid big">{mine.map((p) => <PkgCard key={p.key} p={p} done={done} href={`/panel/egitimler/${p.key}`} big />)}</div>
    {others.length > 0 && <section className="card"><h2>Diğer eğitimler</h2><p className="muted">Merak ettiğiniz diğer sektörlerin eğitimlerine de göz atabilirsiniz.</p><div className="tpk-grid">{others.map((p) => <PkgCard key={p.key} p={p} done={done} href={`/panel/egitimler/${p.key}`} />)}</div></section>}
    <AkademiCard compact />
  </>);
}
