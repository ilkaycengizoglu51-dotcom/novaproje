import type { Metadata } from 'next';
import ParselSorgu from '@/components/ParselSorgu';
import { PageTitle } from '@/components/Shell';
import { requireManager } from '@/lib/auth';
export const metadata: Metadata = { title: 'Parsel sorgu' };
export default async function Page() { await requireManager(); return <><PageTitle title="Parsel sorgu" /><p className="muted" style={{ maxWidth: '80ch', marginTop: -6 }}>Danışan adayınızın parselini sorgulayın; sonucu tek tıkla ön kayıt formuna aktarın.</p><ParselSorgu role="manager" /></>; }
