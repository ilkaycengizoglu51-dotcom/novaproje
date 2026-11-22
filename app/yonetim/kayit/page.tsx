import { q } from '@/lib/db';
import { dt } from '@/lib/format';
import { PageTitle } from '@/components/Shell';
export default async function Activity() {
  const l = await q('SELECT at, who, what FROM activity ORDER BY at DESC LIMIT 300');
  return <><PageTitle title="İşlem kaydı" /><section className="card"><h2>Son 300 işlem</h2><ul className="log">{l.map((a, i) => <li key={i}><time>{dt(a.at)}</time><span><b>{a.who}</b> · {a.what}</span></li>)}</ul></section></>;
}
