import { q } from '@/lib/db';
import { dt } from '@/lib/format';
import { PageTitle } from '@/components/Shell';
import { Submit } from '@/components/client-bits';
import { setQuote } from '@/app/actions/admin';
const ST: Record<string, string> = { yeni: 'Yeni', incelendi: 'İncelendi', 'teklif-verildi': 'Teklif verildi', kapandi: 'Kapandı' };
export default async function Quotes() {
  const l = await q('SELECT * FROM quotes ORDER BY created_at DESC LIMIT 300');
  return (<><PageTitle title="Teklif talepleri" /><section className="card"><h2>Web sitesinden gelen talepler</h2>
    {l.length ? <div className="tw"><table className="tb"><thead><tr><th scope="col">Kişi</th><th scope="col">Tesis / parsel</th><th scope="col">Mesaj</th><th scope="col">Durum</th></tr></thead>
      <tbody>{l.map((x) => <tr key={x.id} className="quote-row"><td>{x.name}<small><a href={`mailto:${x.email}`}>{x.email}</a></small><small>{dt(x.created_at)}</small></td><td>{x.facility || '—'}<small>{x.parcel || ''}{x.capacity ? ' · ' + x.capacity : ''}</small></td><td><p>{x.message}</p></td>
        <td><form action={setQuote} className="toolbar"><input type="hidden" name="id" value={x.id} /><select name="status" defaultValue={x.status} aria-label="Durum">{Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><Submit className="btn-link">Kaydet</Submit></form></td></tr>)}</tbody></table></div> : <p className="muted">Henüz teklif talebi yok.</p>}</section></>);
}
