import Link from 'next/link';
import { type Pkg, itemsOf, pctOf, posterOf, videoOf, extrasOf } from '@/lib/training';
import { toggleItem } from '@/app/actions/training';
import TrainingPlayer from './TrainingPlayer';

export function PkgCard({ p, done, href, big }: { p: Pkg; done?: Set<string>; href: string; big?: boolean }) {
  const pct = done ? pctOf(p, done) : null;
  return (
    <Link className={`tpk ${big ? 'big' : ''}`} href={href}>
      <span className="tpk-img"><img src={posterOf(p.key)} alt="" loading="lazy" /><span className="tpk-play" aria-hidden="true">▶</span><span className="tpk-min">{p.minutes} dk</span></span>
      <span className="tpk-body"><small>{p.sector}</small><b>{p.title}</b>{big && <span className="tpk-sum">{p.summary}</span>}
        {pct !== null && <span className="tpk-prog"><span className="prog-track"><span style={{ width: `${pct}%` }} /></span><em>{pct === 100 ? 'Tamamlandı ✓' : `%${pct}`}</em></span>}</span>
    </Link>
  );
}
const Tick = ({ item, on, label, interactive }: { item: string; on: boolean; label: string; interactive: boolean }) => interactive
  ? <form action={toggleItem} className="tk-form"><input type="hidden" name="item" value={item} /><input type="hidden" name="on" value={on ? '0' : '1'} /><button type="submit" className={`tk ${on ? 'on' : ''}`} aria-pressed={on}><span aria-hidden="true">{on ? '✓' : ''}</span>{label}</button></form>
  : null;
export function PkgView({ p, done, interactive }: { p: Pkg; done: Set<string>; interactive: boolean }) {
  const pct = pctOf(p, done), total = itemsOf(p).length, n = itemsOf(p).filter((x) => done.has(x)).length;
  return (
    <div className="tv">
      <section className="tv-hero">
        <div className="tv-player"><TrainingPlayer k={p.key} src={videoOf(p.key)} poster={posterOf(p.key)} track={interactive} watched={done.has(`${p.key}:video`)} /></div>
        <div className="tv-side">
          <small className="tv-sector">{p.sector} · {p.minutes} dk</small>
          <h2>{p.title}</h2><p>{p.summary}</p>
          <ol className="tv-ch">{p.chapters.map((c, i) => <li key={i}><span>{i + 1}</span>{c}</li>)}</ol>
          {interactive && <div className="tv-pct"><div className="prog-track"><span style={{ width: `${pct}%` }} /></div><b>{pct === 100 ? 'Paket tamamlandı ✓' : `${n} / ${total} adım · %${pct}`}</b></div>}
        </div>
      </section>
      <section className="card"><h2>Dersler</h2>
        <div className="tv-lessons">{p.lessons.map((l, i) => { const it = `${p.key}:l:${l.key}`, on = done.has(it); return (
          <details key={l.key} className={`tv-l ${on ? 'done' : ''}`} open={i === 0}>
            <summary><span className="tv-n">{on ? '✓' : i + 1}</span><b>{l.title}</b></summary>
            <ul>{l.body.map((b, j) => <li key={j}>{b}</li>)}</ul>
            <Tick item={it} on={on} label={on ? 'Okundu olarak işaretlendi' : 'Okudum, tamamladım'} interactive={interactive} />
          </details>); })}</div></section>
      {extrasOf(p.key).length > 0 && <section className="card"><h2>Sahadan kısa eğitimler</h2><p className="muted">Günlük işletme pratiği için kısa, animasyonlu anlatımlar.</p>
        <div className="tx-grid">{extrasOf(p.key).map((x) => (
          <figure key={x.key} className="tx"><video controls preload="none" playsInline poster={posterOf(x.key)} src={videoOf(x.key)} />
            <figcaption><small>{x.topic} · {x.minutes}</small><b>{x.title}</b></figcaption></figure>))}</div></section>}
      <section className="card"><h2>Hazırlık listesi</h2><p className="muted">Projenizin sağlıklı ilerlemesi için kendi tarafınızda yapmanız gerekenler.</p>
        <ul className="tv-check">{p.checklist.map((c, i) => { const it = `${p.key}:c:${i}`, on = done.has(it); return <li key={i}>{interactive ? <Tick item={it} on={on} label={c} interactive /> : <span className="tk"><span aria-hidden="true" />{c}</span>}</li>; })}</ul></section>
      <p className="hint">Eğitim içerikleri genel bilgilendirme amaçlıdır; projenize özel kararlar için proje ekibimize danışın.</p>
    </div>
  );
}
