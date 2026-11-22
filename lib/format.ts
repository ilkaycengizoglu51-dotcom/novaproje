const tl = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
export const money = (k: number | string) => tl.format(Number(k) / 100);
const df = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const date = (d?: string | null) => (d ? df.format(new Date(String(d).slice(0, 10) + 'T00:00:00Z')) : '—');
export const dt = (d?: string | Date | null) => (d ? new Date(d).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' }) : '—');
export const hm = (d: string | Date) => new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
export const todayISO = () => new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
export function parseMoney(s: string) {
  const v = String(s || '').replace(/\s|₺|TL/gi, ''); if (!v) return NaN;
  const n = Number(v.includes(',') ? v.replace(/\./g, '').replace(',', '.') : v); return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}
export const STATUS: Record<string, string> = { planlama: 'Planlama', proje: 'Proje hazırlığı', ruhsat: 'Ruhsat ve izinler', insaat: 'İnşaat', 'devreye-alma': 'Devreye alma', tamamlandi: 'Tamamlandı', beklemede: 'Beklemede' };
export const MS: Record<string, string> = { bekliyor: 'Bekliyor', devam: 'Devam ediyor', tamam: 'Tamamlandı' };
export const CST: Record<string, string> = { taslak: 'Taslak', gonderildi: 'İmza bekliyor', revizyon: 'Revizyon istendi', imzalandi: 'Danışan imzaladı', tamamlandi: 'Tamamlandı', iptal: 'İptal edildi' };
export const DST: Record<string, string> = { bekliyor: 'Yükleme bekleniyor', yuklendi: 'İnceleniyor', onaylandi: 'Onaylandı', reddedildi: 'Yeniden yükleyin' };
export const TYPES = ['Hayvancılık tesisleri', 'Kanatlı tesisleri', 'Sera ve hidroponik', 'Safran ve kapalı ortam', 'Soğuk zincir ve paketleme', 'Hidrolik ve sulama', 'Mikro bitki yetiştiriciliği', 'TKDK / IPARD III dosyaları', 'Yatırım danışmanlığı', 'Diğer'];
export const TOPICS = ['Genel', 'Proje süreci', 'Ödeme', 'Belgeler', 'Sözleşme'];
export const DOC_PRESETS = ['Tapu kaydı', 'Kimlik kartı (ön ve arka yüz)', 'Çiftçi Kayıt Sistemi (ÇKS) belgesi', 'İşletme tescil belgesi', 'Vergi levhası', 'İmar durumu belgesi', 'Zemin etüdü raporu', 'Vekâletname', 'Hissedar muvafakatnamesi', 'Mevcut yapı fotoğrafları'];
export const PARTNER_CATS = ['İnşaat ve taahhüt', 'GES ve enerji depolama', 'Çelik konstrüksiyon', 'Sera ve topraksız tarım', 'Hayvancılık ekipmanları', 'Soğutma ve iklimlendirme', 'Sulama ve hidrolik', 'Zemin etüdü ve harita'];
export const fsize = (n: number) => (n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');
export const greet = () => { const h = Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Europe/Istanbul' })); return h < 5 ? 'İyi geceler' : h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar'; };
export const initials = (n: string) => n.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toLocaleUpperCase('tr');
export const LST: Record<string, string> = { gonderildi: 'Gönderildi', inceleniyor: 'İnceleniyor', eksik: 'Eksik bilgi istendi', onaylandi: 'Onaylandı', reddedildi: 'Reddedildi' };
export const RES_KIND: Record<string, string> = { sunum: 'Sunum dosyası', video: 'Proje videosu', diger: 'Diğer doküman' };

/* ---------- taşeron (alt yüklenici) ---------- */
export const TRADES = ['Şantiye ve kaba inşaat', 'Zemin, hafriyat ve beton', 'Çelik konstrüksiyon', 'Çatı ve cephe kaplama', 'Elektrik tesisatı', 'Mekanik tesisat', 'Sıhhi tesisat ve su', 'İklimlendirme ve havalandırma', 'Sulama sistemi', 'Sera konstrüksiyonu', 'Hayvancılık ekipmanı montajı', 'Soğuk oda ve yalıtım', 'Peyzaj ve çevre düzenleme', 'Diğer'];
export const WST: Record<string, string> = { atandi: 'Atandı', devam: 'Devam ediyor', tamamlandi: 'Tamamlandı', iptal: 'İptal' };
export const CONTRACTOR_DOCS = ['Vergi levhası', 'İmza sirküleri', 'Ticaret sicil gazetesi', 'SGK işyeri tescil belgesi', 'Çalışanların SGK işe giriş bildirgeleri', 'İş sağlığı ve güvenliği eğitim belgeleri', 'Mesleki yeterlilik / ustalık belgeleri', 'Sorumluluk sigortası poliçesi', 'Yetkili elektrik mühendisi (SMM/EMO) belgesi', 'İş programı ve ekip listesi', 'Teklif ve keşif özeti'];
