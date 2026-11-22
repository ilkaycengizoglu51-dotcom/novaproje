import Link from 'next/link';
import { requireClient } from '@/lib/auth';
import { q } from '@/lib/db';
import { clientCounts, installmentsOfClient, milestones, projectsOf, summary } from '@/lib/data';
import { STATUS, date, greet, money } from '@/lib/format';
import { Badge, Icon, Milestones, Prog } from '@/components/ui';
import { CountUp, Still } from '@/components/client-bits';
import { AkademiCard } from '@/components/Certs';
import Gallery from '@/components/Gallery';
import { mediaOfClient } from '@/lib/media';
import { packagesFor, pctOf } from '@/lib/training';
import { PkgCard } from '@/components/Training';

const stillKey = (p: any) => (!p ? 'agil400' : /sera|hidroponik/i.test(p.type + ' ' + p.name) ? 'nft' : /kanatl|tavuk|kümes/i.test(p.type + ' ' + p.name) ? 'kumes' : 'agil400');
export default async function Dashboard() {
  const u = await requireClient();
  const [ps, inst, c] = await Promise.all([projectsOf(u.id), installmentsOfClient(u.id), clientCounts(u.id)]);
  const p = ps[0]; const ms = p ? await milestones(p.id) : []; const next = ms.find((m) => m.status !== 'tamam');
  const ups = ps.length ? await q('SELECT title, body, created_at FROM updates WHERE project_id = ANY($1::int[]) ORDER BY created_at DESC LIMIT 3', [ps.map((x) => x.id)]) : [];
  const docStats = await q(`SELECT status, count(*)::int AS n FROM doc_requests WHERE client_id = $1 GROUP BY status`, [u.id]);
  const okDocs = docStats.find((x) => x.status === 'onaylandi')?.n || 0, allDocs = docStats.reduce((a, x) => a + x.n, 0);
  const signed = (await q(`SELECT count(*)::int AS n FROM contracts WHERE client_id = $1 AND status IN ('imzalandi','tamamlandi')`, [u.id]))[0]?.n || 0;
  const [media, tprog] = await Promise.all([mediaOfClient(u.id, 6), q('SELECT item FROM training_progress WHERE user_id = $1', [u.id])]);
  const tdone = new Set(tprog.map((r) => r.item)), tpk = packagesFor(ps.map((x) => x.type)).filter((x) => pctOf(x, tdone) < 100).slice(0, 2);
  const s = summary(inst), paidPct = s.total ? Math.round((s.paid / s.total) * 100) : 0, R = 46, C = 2 * Math.PI * R, v = p?.progress || 0;
  const Tile = ({ href, icon, label, big, sub, alert }: any) => <Link className={`tile ${alert ? 'alert' : ''}`} href={href}><span className="tile-ic"><Icon n={icon} /></span><span className="tile-l">{label}</span><b className="tile-n">{big}</b><small>{sub}</small><span className="tile-go" aria-hidden="true">›</span></Link>;
  return (
    <>
      <section className="hello" aria-labelledby="hello-name">
        <div className="hello-txt">
          <p className="hello-hi">{greet()}</p>
          <h1 id="hello-name" className="hello-name">{u.name.split(' ')[0]}</h1>
          {p ? <dl className="hello-meta"><div><dt>Proje</dt><dd>{p.name}</dd></div><div><dt>Aşama</dt><dd><span className="pulse" aria-hidden="true" />{STATUS[p.status]}</dd></div>{next && <div><dt>Sıradaki adım</dt><dd>{next.title}{next.due_date && <small>{date(next.due_date)}</small>}</dd></div>}</dl>
            : <p className="hello-sub">Projeniz tanımlandığında burada görünecek.</p>}
          <div className="hello-actions"><Link className="btn btn-lime btn-sm" href="/panel/mesajlar"><Icon n="chat" />Mesaj gönder</Link>{p && <Link className="btn btn-line btn-sm" href={`/panel/proje/${p.id}`}>Projeyi aç</Link>}</div>
        </div>
        <Still k={stillKey(p)} className="hello-visual" alt={p ? `${p.name} — 3D görselleştirme` : ''}>
          <figcaption>3D görselleştirme</figcaption>
          {p && <div className="ring" role="img" aria-label={`Genel ilerleme yüzde ${v}`}><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r={R} className="ring-bg" /><circle cx="60" cy="60" r={R} className="ring-fg" style={{ strokeDasharray: C, strokeDashoffset: C, ['--to' as any]: C * (1 - v / 100) }} /></svg><span><b><CountUp to={v} /></b><small>% tamamlandı</small></span></div>}
        </Still>
      </section>
      <nav className="tiles" aria-label="Kısayollar">
        <Tile href="/panel/sozlesmeler" icon="sign" label="Sözleşmeler" big={c.sign ? `${c.sign} imza` : signed ? 'Güncel' : '—'} sub={c.sign ? 'İmzanızı bekliyor' : signed ? `${signed} sözleşme imzalı` : 'Henüz sözleşme yok'} alert={c.sign} />
        <Tile href="/panel/belgeler" icon="up" label="Belgelerim" big={c.docs ? `${c.docs} belge` : allDocs ? 'Tamam' : '—'} sub={c.docs ? 'Yüklemeniz bekleniyor' : allDocs ? `${okDocs} / ${allDocs} onaylandı` : 'İstenen belge yok'} alert={c.docs} />
        <Tile href="/panel/mesajlar" icon="chat" label="Mesajlar" big={c.msgs ? `${c.msgs} yeni` : 'Yeni yok'} sub={c.msgs ? 'NOVAPROJE’den' : 'Bize her an yazabilirsiniz'} alert={c.msgs} />
        <Tile href="/panel/odemeler" icon="pay" label={s.od ? 'Gecikmiş ödeme' : 'Sıradaki ödeme'} big={s.od ? money(s.odA) : s.next ? money(s.next.amount_kurus) : '—'} sub={s.od ? `${s.od} taksitin vadesi geçti` : s.next ? date(s.next.due_date) : 'Kalan taksit yok'} alert={s.od} />
      </nav>
      {media.length > 0 && <section className="card"><div className="card-head"><h2>Sahadan son görseller</h2>{p && <Link className="go" href={`/panel/proje/${p.id}`}>Tümü ›</Link>}</div><Gallery items={JSON.parse(JSON.stringify(media))} /></section>}
      {tpk.length > 0 && <section className="card"><div className="card-head"><h2>Eğitimleriniz</h2><Link className="go" href="/panel/egitimler">Tümü ›</Link></div><div className="tpk-grid">{tpk.map((x) => <PkgCard key={x.key} p={x} done={tdone} href={`/panel/egitimler/${x.key}`} />)}</div></section>}
      <AkademiCard compact />
      {p ? (
        <div className="dash">
          <section className="card"><div className="card-head"><h2>İş programı</h2><Link className="go" href={`/panel/proje/${p.id}`}>Ayrıntılar ›</Link></div><Prog v={p.progress} /><Milestones items={ms} /></section>
          <div className="dash-side">
            <section className="card"><div className="card-head"><h2>Sahadan son haberler</h2></div>{ups.length ? <ul className="upd">{ups.map((x, i) => <li key={i}><time>{date(new Date(x.created_at).toISOString())}</time><b>{x.title}</b><p>{x.body}</p></li>)}</ul> : <p className="muted">Henüz paylaşılan bir güncelleme yok.</p>}</section>
            <section className="card"><div className="card-head"><h2>Ödeme özeti</h2><Link className="go" href="/panel/odemeler">Tümü ›</Link></div><div className="paybar" role="img" aria-label={`Ödenen yüzde ${paidPct}`}><span style={{ width: `${paidPct}%` }} /></div>
              <dl className="meta3"><div><dt>Ödenen</dt><dd>{money(s.paid)}</dd></div><div><dt>Kalan</dt><dd>{money(s.rem)}</dd></div><div><dt>Toplam</dt><dd>{money(s.total)}</dd></div></dl></section>
          </div>
        </div>
      ) : <section className="card"><p>Hesabınıza henüz bir proje tanımlanmadı. Proje başladığında ilerlemeyi, belgeleri ve ödeme planınızı burada göreceksiniz.</p></section>}
      {ps.length > 1 && <section className="card"><h2>Projelerim</h2><ul className="pcards2">{ps.map((x) => <li key={x.id}><Link className="pc" href={`/panel/proje/${x.id}`}><div className="row-between"><span className="muted" style={{ fontSize: 13 }}>{x.type}</span><Badge s={x.status} /></div><h3>{x.name}</h3><Prog v={x.progress} /><span className="go">Projeyi aç ›</span></Link></li>)}</ul></section>}
    </>
  );
}
