import type { Metadata } from 'next';
import ParselSorgu from '@/components/ParselSorgu';
import { PageTitle } from '@/components/Shell';
export const metadata: Metadata = { title: 'Parsel sorgu' };
export default function Page() { return <><PageTitle title="Parsel sorgu" /><p className="muted" style={{ maxWidth: '80ch', marginTop: -6 }}>İl, ilçe, mahalle ve ada/parsel ile ya da haritadan tıklayarak parselin sınırını, yüzölçümünü ve niteliğini görün.</p><ParselSorgu role="admin" /></>; }
