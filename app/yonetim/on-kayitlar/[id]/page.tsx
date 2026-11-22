import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one } from '@/lib/db';
import LeadDetail from '@/components/LeadDetail';
import { LeadReview } from '@/components/LeadForms';
import { PageTitle } from '@/components/Shell';
export default async function AdminLead({ params }: { params: { id: string } }) {
  const l = await one('SELECT l.*, m.name AS mname FROM leads l JOIN users m ON m.id = l.manager_id WHERE l.id = $1', [Number(params.id)]); if (!l) notFound();
  return (<><PageTitle title={l.name} crumb={{ href: '/yonetim/on-kayitlar', label: 'Ön kayıtlar' }} /><LeadDetail l={l} />
    {l.client_id && <p><Link className="btn btn-ghost2 btn-sm" href="/yonetim/danisanlar">Danışan hesabına git</Link></p>}<LeadReview l={l} /></>);
}
