import Resources from '@/components/Resources';
import { ResourceForm } from '@/components/LeadForms';
import { PageTitle } from '@/components/Shell';
import { Submit } from '@/components/client-bits';
import { deleteResource } from '@/app/actions/admin';
export default function AdminRes() {
  return (<><PageTitle title="Sunum ve videolar" /><p className="muted" style={{ maxWidth: '80ch' }}>Buraya eklediğiniz sunum dosyaları ve videolar portföy yöneticilerinin panelinde görünür. Danışanlar bu bölümü görmez.</p>
    <section className="card"><h2>Yeni ekle</h2><ResourceForm /></section>
    <Resources admin del={(r) => <form action={deleteResource} className="inline-form"><input type="hidden" name="id" value={r.id} /><Submit className="btn-link red" confirm={`“${r.title}” silinsin mi?`}>Sil</Submit></form>} /></>);
}
