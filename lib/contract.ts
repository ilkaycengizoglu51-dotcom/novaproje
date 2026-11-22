import { createHash } from 'node:crypto';
import { date, money } from './format';
export const fingerprint = (title: string, body: string, version: number) => createHash('sha256').update(`${title}\n${body}\nv${version}`).digest('hex');
export function contractTemplate(p: any, client: any, inst: any[]) {
  const total = inst.reduce((s, i) => s + Number(i.amount_kurus), 0);
  const plan = inst.length ? inst.map((i) => `${i.no}. taksit: ${date(i.due_date)} — ${money(i.amount_kurus)}${i.paid_at ? ' (ödendi)' : ''}`).join('\n') : 'Ödeme planı taraflarca ayrıca belirlenecektir.';
  return `PROJE HİZMET SÖZLEŞMESİ

Madde 1 — Taraflar
Bu sözleşme, NOVAPROJE Tarımsal Mühendislik (bundan sonra “NOVAPROJE”) ile ${client?.name || '[Danışan adı]'} (bundan sonra “Danışan”) arasında düzenlenmiştir.

Madde 2 — Konu
Sözleşmenin konusu, ${p.location || '[konum]'} adresindeki “${p.name}” (${p.type}) için mühendislik projelerinin hazırlanması ve ilgili danışmanlık hizmetlerinin verilmesidir.

Madde 3 — Kapsam
NOVAPROJE; vaziyet planı, mimari, statik, mekanik, elektrik ve yangın projeleri ile metraj ve keşif çalışmasını hazırlar. Kapsama girmeyen işler yazılı olarak ayrıca teklif edilir. Proje çıktıları DXF ve PDF olarak teslim edilir.

Madde 4 — Bedel ve ödeme
Sözleşme bedeli ${total ? money(total) : '[tutar]'} olup aşağıdaki plana göre ödenir:
${plan}
Vadesinde yapılmayan ödemeler, işin teslim takvimini aynı süre kadar erteleyebilir.

Madde 5 — Süre
İşe başlama tarihi ${date(p.start_date)}${p.target_date ? `, hedef teslim tarihi ${date(p.target_date)}` : ''}. Süreler, Danışan’dan beklenen belge ve onayların zamanında iletilmesine bağlıdır.

Madde 6 — Danışanın yükümlülükleri
Danışan; tapu, kimlik, ÇKS ve benzeri belgeleri NOVAPROJE danışan paneli üzerinden zamanında yükler, sahaya erişimi sağlar ve proje kararlarına ilişkin onaylarını panel üzerinden verir.

Madde 7 — Gizlilik
Taraflar, sözleşme kapsamında edindikleri bilgi ve belgeleri üçüncü kişilerle paylaşmaz. Kişisel veriler yalnızca bu sözleşmenin ifası amacıyla işlenir.

Madde 8 — Fikri mülkiyet
Bedelin tamamı ödendiğinde, proje çıktılarının bu proje için kullanım hakkı Danışan’a geçer.

Madde 9 — Fesih
Taraflardan biri yükümlülüklerini yerine getirmezse, diğer taraf yazılı bildirimle sözleşmeyi feshedebilir. Fesih tarihine kadar yapılan işlerin bedeli ödenir.

Madde 10 — Elektronik onay
Taraflar, bu sözleşmenin NOVAPROJE danışan paneli üzerinden elektronik olarak onaylanmasını ve onay kayıtlarının (tarih, saat, IP adresi, belge parmak izi) delil olarak kullanılmasını kabul eder.

Madde 11 — Uyuşmazlık
Bu sözleşmeden doğan uyuşmazlıklarda [şehir] mahkemeleri ve icra daireleri yetkilidir.`;
}

/* Taşeron (alt yüklenici) iş sözleşmesi şablonu; metni yönetici gönderişten önce düzenler. */
export function contractorTemplate(w: any, p: any, sub: any) {
  const firm = sub?.company ? `${sub.company} (yetkili: ${sub.name})` : sub?.name || '[Yüklenici adı]';
  return `TAŞERON İŞ SÖZLEŞMESİ

Madde 1 — Taraflar
Bu sözleşme, NOVAPROJE Tarımsal Mühendislik (bundan sonra “NOVAPROJE”) ile ${firm} (bundan sonra “Yüklenici”) arasında düzenlenmiştir.

Madde 2 — Konu
Sözleşmenin konusu, ${p.location || '[konum]'} adresindeki “${p.name}” (${p.type}) projesinde “${w.title}” işinin (${w.trade}) Yüklenici tarafından yapılmasıdır.

Madde 3 — İşin kapsamı
${w.scope || '[İşin kapsamı, malzeme ve işçilik ayrımı yazılacaktır.]'}
Kapsam dışında kalan işler ancak NOVAPROJE’nin yazılı onayıyla yapılır ve ayrıca fiyatlandırılır.

Madde 4 — Süre
İşe başlama tarihi ${w.start_date ? date(w.start_date) : '[başlama tarihi]'}, işin bitiş tarihi ${w.due_date ? date(w.due_date) : '[bitiş tarihi]'}. Yüklenici, iş programına uymayan gecikmeleri gerekçesiyle birlikte NOVAPROJE’ye yazılı olarak bildirir.

Madde 5 — Bedel ve ödeme
Sözleşme bedeli [tutar] olup [hakediş / ödeme planı] esasına göre ödenir. Ödemeler, NOVAPROJE’nin işi yerinde kontrol edip onaylamasından sonra yapılır.

Madde 6 — Yüklenicinin yükümlülükleri
Yüklenici; işi onaylı projelere, teknik şartnamelere, ilgili yönetmelik ve standartlara uygun yapar. Çalıştırdığı personelin sigorta, ücret ve tüm yasal yükümlülükleri Yükleniciye aittir. İstenen belgeleri NOVAPROJE taşeron paneli üzerinden zamanında yükler.

Madde 7 — İş sağlığı ve güvenliği
Yüklenici, 6331 sayılı İş Sağlığı ve Güvenliği Kanunu ve ilgili mevzuata uyar; çalışanlarına gerekli eğitimleri verir ve kişisel koruyucu donanımları sağlar. Şantiye kurallarına ve NOVAPROJE’nin İSG talimatlarına uyar.

Madde 8 — Kalite, kontrol ve kabul
NOVAPROJE işi her aşamada denetleyebilir. Projeye veya şartnameye uygun olmayan imalat Yüklenici tarafından bedelsiz olarak düzeltilir. İş, NOVAPROJE’nin yazılı kabulüyle tamamlanmış sayılır.

Madde 9 — Gizlilik
Yüklenici; proje, işveren ve danışana ait bilgi ve belgeleri yalnızca bu iş için kullanır, üçüncü kişilerle paylaşmaz.

Madde 10 — Fesih
Yüklenici yükümlülüklerini yerine getirmez veya işi uzun süre aksatırsa NOVAPROJE yazılı bildirimle sözleşmeyi feshedebilir. Fesih tarihine kadar kabul edilmiş imalatın bedeli ödenir.

Madde 11 — Elektronik onay
Taraflar, bu sözleşmenin NOVAPROJE taşeron paneli üzerinden elektronik olarak onaylanmasını ve onay kayıtlarının (tarih, saat, IP adresi, belge parmak izi) delil olarak kullanılmasını kabul eder.

Madde 12 — Uyuşmazlık
Bu sözleşmeden doğan uyuşmazlıklarda [şehir] mahkemeleri ve icra daireleri yetkilidir.`;
}
