import { requireClient } from '@/lib/auth';
import { q } from '@/lib/db';
import { threadOf } from '@/lib/messages';
import Chat from '@/components/Chat';
import { PageTitle } from '@/components/Shell';
export const dynamic = 'force-dynamic';
export default async function Messages() {
  const u = await requireClient(); const list = await threadOf(u.id);
  await q(`UPDATE messages SET read_at = now() WHERE client_id = $1 AND sender = 'admin' AND read_at IS NULL AND created_at <= now()`, [u.id]);
  const head = <div className="chat-head"><span className="av team" aria-hidden="true"><img src="/img/revmark.webp" alt="" /></span><div><b>NOVAPROJE Proje Ekibi</b><small><span className="online" aria-hidden="true" />Mesajlarınıza genellikle 1 iş günü içinde yanıt verilir</small></div></div>;
  return <><PageTitle title="Mesajlar" /><Chat clientId={u.id} role="client" initial={JSON.parse(JSON.stringify(list))} head={head} /></>;
}
