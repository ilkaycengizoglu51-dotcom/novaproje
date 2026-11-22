import { notFound } from 'next/navigation';
import { requireManager } from '@/lib/auth';
import { one } from '@/lib/db';
import LeadDetail from '@/components/LeadDetail';
import { LeadReply } from '@/components/LeadForms';
import { PageTitle } from '@/components/Shell';
export default async function Lead({ params, searchParams }: { params: { id: string }; searchParams: { yeni?: string } }) {
  const u = await requireManager(); const l = await one('SELECT * FROM leads WHERE id = $1 AND manager_id = $2', [Number(params.id), u.id]); if (!l) notFound();
  return (<><PageTitle title={l.name} crumb={{ href: '/portfoy/on-kayit', label: 'Ön kayıtlarım' }} />
    {searchParams.yeni && <div className="alert ok" role="status">Ön kayıt yöneticiye gönderildi. Onay sürecini bu sayfadan izleyebilirsiniz.</div>}
    <LeadDetail l={l} />
    {!['onaylandi', 'reddedildi'].includes(l.status) && <section className="card"><h2>{l.status === 'eksik' ? 'İstenen bilgiyi gönder' : 'Bilgi veya belge ekle'}</h2><LeadReply id={l.id} /></section>}</>);
}
