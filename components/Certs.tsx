import { date, dt, initials } from '@/lib/format';
import { Icon } from './ui';
import { Submit } from './client-bits';
import { deleteCert, reviewCert } from '@/app/actions/certs';

export const AKADEMI = 'https://akademi.tarimorman.gov.tr/';
const ST: Record<string, [string, string]> = { inceleniyor: ['İnceleniyor', 'd-yuklendi'], onaylandi: ['Onaylandı', 'd-onaylandi'], reddedildi: ['Yeniden yükleyin', 'd-reddedildi'] };

/** Prominent shortcut card to the Ministry's online learning platform. */
export function AkademiCard({ compact }: { compact?: boolean }) {
  return (
    <section className={`akd ${compact ? 'compact' : ''}`} aria-labelledby="akd-t">
      <div className="akd-glow" aria-hidden="true" />
      <div className="akd-txt">
        <p className="akd-kicker">Ücretsiz çevrimiçi eğitim</p>
        <h2 id="akd-t">Tarım Orman Akademisi</h2>
        <p>Tarım ve Orman Bakanlığı’nın dijital öğrenme platformu. Bitkisel ve hayvansal üretim, sulama, iş sağlığı ve güvenliği, tarımsal finans gibi eğitimleri tamamlayınca katılım belgeniz otomatik oluşur.</p>
        {!compact && <ol className="akd-steps"><li><span>1</span>Akademi’de hesap açın veya giriş yapın.</li><li><span>2</span>Projenize uygun eğitimi tamamlayın.</li><li><span>3</span>Katılım belgenizi indirip buraya yükleyin.</li></ol>}
        <div className="akd-acts">
          <a className="btn btn-lime" href={AKADEMI} target="_blank" rel="noopener noreferrer">Akademi’ye git <span aria-hidden="true">↗</span></a>
          {compact ? <a className="btn btn-line btn-sm" href="/panel/sertifikalar">Sertifikalarım</a> : <a className="btn btn-line btn-sm" href="#sertifika-yukle">Sertifika yükle</a>}
        </div>
        <p className="akd-note">Resmî Bakanlık sitesine yönlendirilirsiniz; NOVAPROJE ile bağlantılı değildir.</p>
      </div>
      <div className="akd-art" aria-hidden="true">
        <svg viewBox="0 0 220 180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="30" y="30" width="160" height="112" rx="10" /><path d="M50 58h80M50 76h120M50 94h96" /><circle cx="160" cy="112" r="20" /><path d="M150 128l-6 30 16-10 16 10-6-30" /><path d="M153 112l5 5 9-10" />
        </svg>
      </div>
    </section>
  );
}

export function CertList({ list, admin, own }: { list: any[]; admin?: boolean; own?: boolean }) {
  if (!list.length) return <p className="muted">{admin ? 'Bu filtrede sertifika yok.' : 'Henüz sertifika yüklenmedi.'}</p>;
  return (
    <ul className="cert-grid">{list.map((c) => { const [lbl, cls] = ST[c.status] || ['', '']; return (
      <li key={c.id} className={`cert ${c.status}`}>
        <div className="cert-top"><span className="cert-seal" aria-hidden="true"><Icon n="star" /></span><span className={`pill ${cls}`}>{lbl}</span></div>
        <b className="cert-t">{c.title}</b>
        <small className="muted">{[c.issuer, c.issued_at && date(c.issued_at), c.hours && c.hours + ' saat'].filter(Boolean).join(' · ') || '—'}</small>
        {admin && <small className="cert-who"><span className="av" aria-hidden="true">{initials(c.client_name || '?')}</span>{c.client_name}{c.manager_name ? ` · Portföy: ${c.manager_name}` : ''}</small>}
        {c.status === 'reddedildi' && c.reason && <div className="alert err"><b>İade nedeni:</b> {c.reason}</div>}
        <small className="muted">Yüklendi: {dt(c.created_at)}</small>
        <div className="toolbar">
          {c.file_id && <a className="btn btn-ghost2 btn-sm" href={`/api/dosya/${c.file_id}`} target="_blank" rel="noopener">Görüntüle</a>}
          {admin && c.status === 'inceleniyor' && <form action={reviewCert} className="inline-form"><input type="hidden" name="id" value={c.id} /><input type="hidden" name="act" value="ok" /><Submit className="btn btn-ink btn-sm">Onayla</Submit></form>}
          {admin && c.status === 'inceleniyor' && <details><summary className="btn btn-red btn-sm" style={{ listStyle: 'none' }}>İade et</summary><form action={reviewCert} className="pf" style={{ marginTop: 8 }}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="act" value="no" /><div className="field"><label htmlFor={`cr-${c.id}`}>İade nedeni (danışan görecek)</label><input id={`cr-${c.id}`} name="reason" defaultValue="Belge okunaklı değil veya eksik; lütfen yeniden yükleyin." /></div><div><Submit className="btn btn-red btn-sm">İade et</Submit></div></form></details>}
          {admin && c.status !== 'inceleniyor' && <form action={reviewCert} className="inline-form"><input type="hidden" name="id" value={c.id} /><input type="hidden" name="act" value="reopen" /><Submit className="btn-link">İncelemeye geri al</Submit></form>}
          {((own && c.status !== 'onaylandi') || admin) && <form action={deleteCert} className="inline-form"><input type="hidden" name="id" value={c.id} /><Submit className="btn-link red" confirm={`“${c.title}” silinsin mi?`}>Sil</Submit></form>}
        </div>
      </li>); })}</ul>
  );
}
