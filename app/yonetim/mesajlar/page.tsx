import Inbox from '@/components/Inbox';
import { AutoreplyForm } from '@/components/AdminForms';
import { autoreplySettings } from '@/lib/data';
import { PageTitle } from '@/components/Shell';
export const dynamic = 'force-dynamic';
export default async function Messages({ searchParams }: { searchParams: { q?: string } }) {
  return (<><PageTitle title="Mesajlar" /><AutoreplyForm v={await autoreplySettings()} />
    <div className="inbox"><Inbox term={(searchParams.q || '').trim()} /><div className="ib-chat"><section className="card ib-empty"><p>Soldan bir danışan seçin.</p></section></div></div></>);
}
