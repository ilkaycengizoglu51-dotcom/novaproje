import { CPill, Logo } from './ui';
import { PrintBtn } from './client-bits';
import { dt, fsize } from '@/lib/format';

const html = (body: string) => body.split('\n').map((l, i) => /^Madde \d+/.test(l) ? <h4 key={i}>{l}</h4> : l === l.toLocaleUpperCase('tr') && l.trim().length > 8 ? <h3 key={i}>{l}</h3> : l.trim() ? <p key={i}>{l}</p> : null);
const Sig = ({ s, who }: { s: any; who: string }) => s ? <div className="sig"><span className="sig-who">{who}</span><img src={s.img} alt={`${s.name} imzası`} /><b>{s.name}</b><small>{dt(s.at)}</small></div> : <div className="sig empty"><span className="sig-who">{who}</span><p>İmza bekleniyor</p></div>;
export function Steps({ status, party = 'Danışan' }: { status: string; party?: string }) {
  const k = status === 'tamamlandi' ? 3 : status === 'imzalandi' ? 2 : status === 'gonderildi' ? 1 : 0, lbl = ['İmzaya gönderildi', `${party} imzası`, 'NOVAPROJE imzası'];
  return <ol className="cstep">{lbl.map((l, i) => <li key={l} className={i < k ? 'done' : i === k ? 'now' : ''}><span>{i < k ? '✓' : i + 1}</span>{l}</li>)}</ol>;
}
export default function ContractPaper({ c, project, attachment, party = 'Danışan' }: { c: any; project: string; attachment?: any; party?: string }) {
  return (
    <>
      <div className="toolbar"><CPill s={c.status} /><span className="muted">{project} · Sürüm {c.version}</span><PrintBtn /></div>
      <Steps status={c.status} party={party} />
      {c.status === 'revizyon' && c.revise_note && <div className="alert info"><b>Revizyon talebi:</b> {c.revise_note}</div>}
      <article className="paper print-area" id="paper">
        <div className="paper-head"><Logo /><span>Belge no: NP-{String(c.id).padStart(5, '0')}-v{c.version}</span></div>
        {html(c.body)}
        {attachment && <div className="attach"><span>Ek: {attachment.name} ({fsize(attachment.size)})</span><a className="lb" href={`/api/dosya/${attachment.id}`} target="_blank" rel="noopener">Görüntüle</a></div>}
        <div className="sigs"><Sig s={c.client_sign} who={party} /><Sig s={c.admin_sign} who="NOVAPROJE" /></div>
        {c.client_sign && <p className="fp">{party} onayı: {c.client_sign.name} · {dt(c.client_sign.at)} · IP {c.client_sign.ip} · Belge parmak izi (SHA-256): <code>{String(c.client_sign.hash).slice(0, 32)}…</code></p>}
      </article>
    </>
  );
}
