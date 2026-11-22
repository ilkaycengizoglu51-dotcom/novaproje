import { q } from '@/lib/db';
import { Icon } from './ui';
export const resUrl = (r: any) => (r.file_id ? `/api/dosya/${r.file_id}` : r.url);
export default async function Resources({ admin, del }: { admin?: boolean; del?: (r: any) => React.ReactNode }) {
  const l = await q('SELECT r.*, f.mime, f.name AS fname FROM resources r LEFT JOIN files f ON f.id = r.file_id ORDER BY r.kind, r.sort, r.id');
  const docs = l.filter((r) => r.kind !== 'video'), vids = l.filter((r) => r.kind === 'video');
  return (<>
    <section className="card"><h2>Sunum ve dokümanlar</h2>{docs.length ? <ul className="doc-list">{docs.map((r) => <li key={r.id} className="doc-row"><span className="doc-ic" aria-hidden="true"><Icon n="file" /></span><div className="doc-main"><b>{r.title}</b><small>{r.description || (r.kind === 'sunum' ? 'Sunum dosyası' : 'Doküman')}</small></div>
      <a className="btn btn-ghost2 btn-sm" href={resUrl(r)} target="_blank" rel="noopener">Aç</a>{r.file_id && <a className="btn btn-ink btn-sm" href={`${resUrl(r)}?indir`}>İndir</a>}{del && del(r)}</li>)}</ul>
      : <p className="muted">{admin ? 'Henüz sunum yüklenmedi. Aşağıdan ekleyin.' : 'Sunum dosyası yakında burada olacak.'}</p>}</section>
    <section className="card"><h2>Proje videoları</h2>{vids.length ? <ul className="res-vids">{vids.map((r) => <li key={r.id}><video controls preload="metadata" playsInline src={resUrl(r)} poster={r.url && r.url.endsWith('.mp4') ? r.url.replace('.mp4', '.webp') : undefined} /><div className="row-between"><div><b>{r.title}</b>{r.description && <small className="muted" style={{ display: 'block' }}>{r.description}</small>}</div><div className="toolbar"><a className="btn-link" href={resUrl(r)} download>İndir</a>{del && del(r)}</div></div></li>)}</ul> : <p className="muted">Henüz video yok.</p>}</section>
  </>);
}
