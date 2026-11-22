import { requireClient } from '@/lib/auth';
import { q } from '@/lib/db';
import { AkademiCard, CertList } from '@/components/Certs';
import CertForm from '@/components/CertForm';
import { PageTitle } from '@/components/Shell';
export const dynamic = 'force-dynamic';
export default async function Certs() {
  const u = await requireClient();
  const l = await q(`SELECT id, title, issuer, to_char(issued_at,'YYYY-MM-DD') AS issued_at, hours, file_id, status, reason, created_at FROM certificates WHERE client_id = $1 ORDER BY created_at DESC`, [u.id]);
  const ok = l.filter((c) => c.status === 'onaylandi').length;
  return (<>
    <PageTitle title="Eğitim ve sertifikalar" />
    <AkademiCard />
    <section className="card" id="sertifika-yukle"><div className="card-head"><h2>Sertifika yükle</h2><span className="muted">{ok} onaylı · {l.length} toplam</span></div>
      <p className="muted" style={{ fontSize: 14 }}>Tarım Orman Akademisi veya başka kurumlardan aldığınız eğitim belgelerini yükleyin. Bazı hibe ve destek başvurularında (örneğin TKDK) eğitim belgesi istenebilir; yüklediğiniz belgeler proje dosyanızda hazır bulunur.</p>
      <CertForm /></section>
    <section className="card"><h2>Sertifikalarım</h2><CertList list={l} own /></section>
  </>);
}
