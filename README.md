# NOVAPROJE — web sitesi, danışan paneli ve yönetim paneli (sunuculu sürüm)

Next.js 14 + PostgreSQL. Tanıtım sitesi (3D sahneler, logo animasyonu) `/` adresinde, danışan paneli `/panel`, yönetim paneli `/yonetim`, giriş sayfası `/giris` adresindedir. Dışarıdan üyelik yoktur; hesapları yalnızca yönetici açar.

## Kurulum (bir kez)

1. **Veritabanı:** Neon, Supabase veya benzeri bir hizmette ücretsiz bir PostgreSQL veritabanı açın, bağlantı adresini kopyalayın.
2. **Ayarlar:** `.env.example` dosyasını `.env.local` adıyla kopyalayın; `DATABASE_URL`, `SITE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` alanlarını doldurun.
3. **Kurulum komutları:**
   ```bash
   npm install
   npm run db:init      # tabloları kurar, ilk yönetici hesabını açar
   npm run dev          # http://localhost:3000
   ```
4. **E-posta bildirimleri (isteğe bağlı):** resend.com’da ücretsiz hesap açın, alan adınızı doğrulayın, `RESEND_API_KEY` ve `MAIL_FROM` değerlerini girin. Anahtar girilmezse sistem çalışır, yalnızca e-posta gönderilmez.

## Yayına alma

- **Önerilen:** Railway, Render veya kendi sunucunuz (Node.js 18+). `npm run build && npm start`. Bu ortamlarda 10 MB’a kadar dosya yüklenebilir.
- **Vercel:** Çalışır; ancak Vercel tek istekte en fazla 4,5 MB kabul ettiği için daha büyük belgeler yüklenemez.
- Her iki durumda da ortam değişkenlerini barındırma panelinde tanımlayın ve `npm run db:init` komutunu bir kez çalıştırın.

## Danışan paneli

Genel bakış (selamlama, projenin 3D görseli, ilerleme halkası, bekleyen işler, iş programı, sahadan haberler, ödeme özeti) · Mesajlar · Sözleşmeler (okuma zorunlu, ekrana imza, değişiklik talebi) · Belgelerim (sürükle-bırak yükleme) · Ödemelerim · Hesabım (şifre değiştirme). Giriş anında kişiye özel karşılama ekranı gösterilir.

## Yönetim paneli

- **Danışanlar:** Kullanıcı adı otomatik önerilir, güçlü geçici şifre üretilir (3/7/14/30 gün geçerli), ilk girişte şifre değişimi zorunludur. Şifre sıfırlama, hesap kapatma, bilgi düzenleme.
- **Projeler:** Aşama, ilerleme, iş programı, sahadan güncelleme (danışana e-postayla bildirilir), taksit planı, tahsilat işleme.
- **Sözleşmeler:** Projeden otomatik şablon (danışan, konum, bedel, taksitler işlenir), düzenleme, ek dosya, imzaya gönderme, karşı imza, iptal, yeni sürüm. Her adım tarih, saat ve IP adresiyle kaydedilir; imzalanan metnin SHA-256 parmak izi saklanır.
- **Belgeler:** Hazır listeden veya serbest metinle belge isteme, son tarih, inceleme, onay, gerekçeli iade.
- **Mesajlar:** Gelen kutusu, hazır yanıtlar, okundu bilgisi; danışan yazınca mesai saatine göre otomatik yanıt (metinler düzenlenebilir).
- **Teklif talepleri:** Sitedeki formdan gelenler burada listelenir ve size e-postayla bildirilir.
- **Referanslar:** Sitedeki “Referanslar ve çözüm ortaklarımız” bölümü buradan yönetilir (logo, kategori, şehir, web sitesi).
- **İşlem kaydı:** Kim, ne zaman, ne yaptı.

## Güvenlik

Şifreler scrypt ile saklanır; oturumlar veritabanında, `httpOnly` çerezle tutulur. Hatalı girişler 15 dakikada 5 denemeyle sınırlıdır. Her sayfa ve her işlem sunucuda yetki kontrolü yapar; danışan yalnızca kendi projelerini, belgelerini ve mesajlarını görebilir. Dosyalar yalnızca sahibi ve yönetici tarafından açılabilir.

## Bilinmesi gerekenler

- Yüklenen dosyalar veritabanında saklanır. Ücretsiz veritabanı planlarının depolama sınırı (genellikle 0,5 GB) dolarsa ücretli plana geçmek ya da dosya depolamayı S3 / Cloudflare R2’ye taşımak gerekir.
- Ekrana atılan imza “basit elektronik imza”dır. Islak imzayla eşdeğer “güvenli elektronik imza” (5070 sayılı Kanun) için bir e-imza / mobil imza sağlayıcısıyla entegrasyon gerekir. Sözleşme şablonunu kullanmadan önce hukuk danışmanınıza kontrol ettirin.
- Sitedeki telefon numarası kaldırılmıştır; iletişim e-posta üzerindendir (`info@novaproje.com` adresini kendi adresinizle değiştirin: `public/site.html` ve panel sayfaları).
