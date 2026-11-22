import { LeadForm } from '@/components/LeadForms';
import { PageTitle } from '@/components/Shell';
export default function NewLead({ searchParams }: { searchParams: { konum?: string; parsel?: string; notlar?: string } }) {
  const init = { konum: (searchParams.konum || '').slice(0, 200), parsel: (searchParams.parsel || '').slice(0, 160), notlar: (searchParams.notlar || '').slice(0, 1000) };
  return (<><PageTitle title="Danışan ön kayıt formu" crumb={{ href: '/portfoy/on-kayit', label: 'Ön kayıtlarım' }} />
    <section className="card"><ol className="nc-steps"><li>Danışan adayının ve yatırımın bilgilerini girin; varsa tapu, ÇKS gibi ön belgeleri ekleyin.</li><li>Kayıt NOVAPROJE yöneticisine gider; inceleme ve onay adımlarını “Ön kayıtlarım” bölümünden izlersiniz.</li><li>Onaylanınca danışan hesabı açılır ve danışan adına belge yükleyebilirsiniz.</li></ol>{init.parsel && <div className="alert info">Parsel sorgusundan aktarıldı: {init.parsel}, {init.konum}. Bilgileri kontrol edip adayın bilgilerini ekleyin.</div>}<LeadForm init={init} /></section></>);
}
