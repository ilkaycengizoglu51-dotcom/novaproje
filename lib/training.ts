/* Sector training packages. Content source: egitim/content.json (also used to render the videos). */
export type Lesson = { key: string; title: string; body: string[] };
export type Pkg = { key: string; title: string; sector: string; minutes: number; summary: string; lessons: Lesson[]; checklist: string[]; chapters: string[] };
export const PACKAGES: Pkg[] = [
 {
  "key": "genel",
  "title": "Projeniz adım adım",
  "sector": "Tüm danışanlar",
  "minutes": 6,
  "summary": "Fikirden işletmeye: bir tarımsal yatırım projesinin hangi aşamalardan geçtiğini, sizden neler beklendiğini ve süreci panelden nasıl takip edeceğinizi öğrenin.",
  "lessons": [
   {
    "key": "asamalar",
    "title": "Projenin aşamaları",
    "body": [
     "Arazi ve fikir: parselin konumu, büyüklüğü, imar durumu ve hedef kapasite netleşir.",
     "Fizibilite: yatırım tutarı, işletme giderleri ve geri dönüş süresi kabaca hesaplanır.",
     "Projelendirme: vaziyet planı, mimari, statik, mekanik ve elektrik projeleri hazırlanır.",
     "Ruhsat ve izinler: belediye veya il özel idaresi, gerekirse ÇED ve diğer kurum görüşleri alınır.",
     "Yapım ve devreye alma: tesis kurulur, ekipman test edilir, işletme başlar."
    ]
   },
   {
    "key": "belgeler",
    "title": "Belgeler ve onaylar",
    "body": [
     "Tapu, kimlik ve Çiftçi Kayıt Sistemi (ÇKS) belgesi çoğu başvurunun temelidir.",
     "İstenen belgeleri Belgelerim bölümünden yükleyin; iade edilirse nedenini aynı yerde görürsünüz.",
     "Sözleşme ve proje kararlarını panelden onaylamak süreci hızlandırır."
    ]
   },
   {
    "key": "takip",
    "title": "Süreci panelden takip etmek",
    "body": [
     "Genel bakış sayfası projenizin aşamasını ve sıradaki adımı gösterir.",
     "Sahadan gelen fotoğraflar ve güncellemeler proje sayfanızda yayınlanır.",
     "Sorularınızı Mesajlar bölümünden iletin; yanıtlar aynı yazışmada birikir."
    ]
   }
  ],
  "checklist": [
   "Tapu ve kimlik belgemi yükledim",
   "Sözleşmemi okudum",
   "Ödeme planımı kontrol ettim",
   "Proje ekibine iletişim bilgilerimi doğruladım"
  ],
  "chapters": [
   "Projeniz adım adım",
   "Bir projenin aşamaları",
   "Sizden beklenenler",
   "Panelde neler var?",
   "Süreyi en çok etkileyenler",
   "Sorunuz mu var?"
  ]
 },
 {
  "key": "hayvancilik",
  "title": "Hayvancılık işletmesi nasıl işler?",
  "sector": "Hayvancılık tesisleri",
  "minutes": 8,
  "summary": "Besi ve süt hayvancılığında günlük işleyiş, tesisin bölümleri ve verimi belirleyen kritik noktalar.",
  "lessons": [
   {
    "key": "dongu",
    "title": "Üretim döngüsü",
    "body": [
     "Besi işletmesinde hayvanlar temin edilir, karantina ve adaptasyon döneminden sonra hedef ağırlığa kadar beslenir ve satılır.",
     "Süt işletmesinde günlük sağım, sütün hızla soğutulması ve düzenli satış işin merkezindedir.",
     "Her iki modelde de yem maliyeti en büyük gider kalemlerinden biridir; yem planı baştan yapılmalıdır."
    ]
   },
   {
    "key": "tesis",
    "title": "Tesisin bölümleri",
    "body": [
     "Barınak; bölmeler, yemlik ve suluklarla hayvan sayısına göre boyutlandırılır.",
     "Yem deposu ve silaj alanı, yemin kalitesini korumak için kuru ve erişilebilir olmalıdır.",
     "Gübre yönetimi çevre mevzuatı açısından zorunludur; gübre çukuru veya platformu projede yer alır.",
     "Hasta ve yeni gelen hayvanlar için ayrı revir ve karantina bölmesi hastalık yayılımını önler."
    ]
   },
   {
    "key": "kritik",
    "title": "Kritik noktalar",
    "body": [
     "İyi havalandırma solunum hastalıklarını azaltır.",
     "Temiz ve sürekli su, hem verimi hem hayvan sağlığını doğrudan etkiler.",
     "Aşı ve veteriner kontrol takvimine uymak, kayıpları azaltır.",
     "Hayvan kayıtları ve kulak küpeleri yasal takibin bir parçasıdır."
    ]
   }
  ],
  "checklist": [
   "Hedef hayvan sayısını ve modeli (besi / süt) netleştirdim",
   "Yem tedarik planımı düşündüm",
   "Veteriner hekim desteğini planladım",
   "Gübre yönetimi çözümünü proje ekibiyle konuştum"
  ],
  "chapters": [
   "Hayvancılık işletmesi nasıl işler?",
   "Besi işletmesinde döngü",
   "Tesisin bölümleri",
   "Süt işletmesinde ek adımlar",
   "Verimi belirleyen noktalar",
   "Tesisiniz bu işleyişe göre tasarlanır"
  ]
 },
 {
  "key": "kanatli",
  "title": "Kanatlı işletmesi nasıl işler?",
  "sector": "Kanatlı tesisleri",
  "minutes": 7,
  "summary": "Yumurta tavukçuluğunda kapalı kümes işleyişi, kümes donanımı ve biyogüvenlik.",
  "lessons": [
   {
    "key": "donem",
    "title": "Üretim dönemi",
    "body": [
     "Yumurtlama çağına gelmiş yarkalar kümese alınır ve yumurtlama dönemi boyunca beslenir.",
     "Yumurtalar her gün toplanır, sınıflandırılır ve paketlenir.",
     "Dönem sonunda kümes boşaltılır, temizlenir ve dezenfekte edilir; yeni sürü ondan sonra girer."
    ]
   },
   {
    "key": "donanim",
    "title": "Kümes donanımı",
    "body": [
     "Otomatik yemleme ve nipel suluklar iş gücünü azaltır, israfı önler.",
     "Kapalı sistemlerde havalandırma fan ve pedlerle yönetilir; iklim kontrol panosu bunu otomatik yapar.",
     "Gübre bantları kümes içindeki amonyağı azaltır ve temizliği kolaylaştırır.",
     "Elektrik kesintisinde havalandırma durmaması için yedek enerji şarttır."
    ]
   },
   {
    "key": "biyoguvenlik",
    "title": "Biyogüvenlik",
    "body": [
     "Kümese giriş çıkış kontrollü olmalı; dezenfeksiyon havuzu ve kıyafet değişimi uygulanmalıdır.",
     "Yabani kuşların ve kemirgenlerin içeri girmesi engellenmelidir.",
     "Günlük ölüm, yem ve su tüketimi kayıtları hastalıkları erken fark ettirir."
    ]
   }
  ],
  "checklist": [
   "Hedef kapasiteyi netleştirdim",
   "Yarka tedarikçisini araştırdım",
   "Yedek enerji çözümünü planladım",
   "Yumurta satış kanalımı düşündüm"
  ],
  "chapters": [
   "Kanatlı işletmesi nasıl işler?",
   "Üretim dönemi",
   "Kümes donanımı",
   "Kritik noktalar",
   "Günlük rutin",
   "Kümesiniz bu işleyişe göre tasarlanır"
  ]
 },
 {
  "key": "sera",
  "title": "Sera işletmesi nasıl işler?",
  "sector": "Sera ve hidroponik",
  "minutes": 7,
  "summary": "Örtü altı üretimde yetiştirme döngüsü, sera yapısı, sulama-gübreleme ve iklim yönetimi.",
  "lessons": [
   {
    "key": "dongu",
    "title": "Yetiştirme döngüsü",
    "body": [
     "Sağlıklı fide ile başlanır; fidenin kalitesi tüm sezonu etkiler.",
     "Sulama ve gübreleme çoğunlukla birlikte, damla sistemle yapılır (fertigasyon).",
     "Hasat zamanlaması ve paketleme, ürünün pazardaki değerini belirler."
    ]
   },
   {
    "key": "yapi",
    "title": "Sera yapısı",
    "body": [
     "Çelik iskelet rüzgâr ve kar yüküne göre hesaplanır.",
     "Örtü malzemesi ışık geçirgenliği ve ömrüne göre seçilir.",
     "Havalandırma pencereleri ve ısıtma sistemi sera içi iklimi yönetir."
    ]
   },
   {
    "key": "iklim",
    "title": "İklim ve bitki sağlığı",
    "body": [
     "Yüksek nem mantar hastalıklarını artırır; havalandırma bunu dengeler.",
     "Hastalık ve zararlılar düzenli gözlemle erken yakalanmalıdır.",
     "Su analizi yapılmadan gübreleme programı kurulmamalıdır."
    ]
   }
  ],
  "checklist": [
   "Yetiştireceğim ürünü belirledim",
   "Su kaynağımın analizini yaptırdım",
   "Isıtma için enerji seçeneklerini düşündüm",
   "Ürün satış kanalımı araştırdım"
  ],
  "chapters": [
   "Sera işletmesi nasıl işler?",
   "Yetiştirme döngüsü",
   "Seranın bölümleri",
   "Topraksız tarımda farklar",
   "Kritik noktalar",
   "Seranız bu işleyişe göre tasarlanır"
  ]
 },
 {
  "key": "safran",
  "title": "Kapalı ortamda safran",
  "sector": "Safran ve kapalı ortam",
  "minutes": 6,
  "summary": "İklim kontrollü kapalı ortamda safran üretiminin işleyişi: soğandan paketlemeye.",
  "lessons": [
   {
    "key": "akis",
    "title": "Üretim akışı",
    "body": [
     "Safran, soğanlarından (korm) yetiştirilir; kapalı ortamda raflara yerleştirilir.",
     "Sıcaklık, nem ve ışık yönetimiyle çiçeklenme yönlendirilir.",
     "Çiçeklenme dönemi kısadır; hasat günlük ve dikkatli yapılır."
    ]
   },
   {
    "key": "hasat",
    "title": "Hasat ve işleme",
    "body": [
     "Çiçekler toplanır, kırmızı stigmalar elle ayrılır.",
     "Stigmalar kontrollü koşullarda kurutulur; kurutma kalitesi renk ve aromayı belirler.",
     "Ürün ışık ve nemden korunacak şekilde paketlenir."
    ]
   },
   {
    "key": "kalite",
    "title": "Kalite ve pazar",
    "body": [
     "Safran yüksek değerli bir üründür; hijyen ve izlenebilirlik alıcı için önemlidir.",
     "Soğanların sağlıklı korunması bir sonraki sezonun verimini belirler.",
     "Satış kanalı (toptan, perakende, ihracat) baştan planlanmalıdır."
    ]
   }
  ],
  "checklist": [
   "Soğan tedarikçimi araştırdım",
   "Hasat dönemi için iş gücü planladım",
   "Kurutma ve paketleme alanını konuştum",
   "Satış kanalımı düşündüm"
  ],
  "chapters": [
   "Kapalı ortamda safran",
   "Üretim akışı",
   "Tesisin donanımı",
   "Kritik noktalar",
   "Hasat sonrası",
   "Tesisiniz bu işleyişe göre tasarlanır"
  ]
 },
 {
  "key": "soguk",
  "title": "Soğuk zincir ve paketleme",
  "sector": "Soğuk zincir ve paketleme",
  "minutes": 6,
  "summary": "Soğuk hava deposu ve paketleme tesisinde ürünün kabulden sevkiyata yolculuğu.",
  "lessons": [
   {
    "key": "akis",
    "title": "Ürün akışı",
    "body": [
     "Ürün kabulde kontrol edilir ve kayıt altına alınır.",
     "Ön soğutma, ürünün tarla sıcaklığını hızla düşürerek raf ömrünü uzatır.",
     "Her ürünün kendine uygun depolama sıcaklığı ve nemi vardır."
    ]
   },
   {
    "key": "tesis",
    "title": "Tesis ve ekipman",
    "body": [
     "Soğuk odalar yalıtımlı panellerle kurulur; kapı ve contalar enerji kaybını belirler.",
     "Soğutma grubu kapasitesi ürün miktarı ve giriş sıcaklığına göre hesaplanır.",
     "Sıcaklık izleme ve alarm sistemi arızaları erken bildirir."
    ]
   },
   {
    "key": "kalite",
    "title": "Kalite ve izlenebilirlik",
    "body": [
     "Soğuk zincirin kısa bir süre bile kırılması ürün kaybına yol açabilir.",
     "Elektrik kesintisine karşı yedek enerji planlanmalıdır.",
     "Parti bazlı kayıt, alıcıya güven verir ve sorunların kaynağını bulmayı kolaylaştırır."
    ]
   }
  ],
  "checklist": [
   "Depolayacağım ürünleri ve miktarları belirledim",
   "Enerji ve yedek güç seçeneğini düşündüm",
   "Paketleme ihtiyacımı netleştirdim",
   "Alıcı ve sevkiyat planımı düşündüm"
  ],
  "chapters": [
   "Soğuk zincir ve paketleme",
   "Ürün akışı",
   "Tesisin bölümleri",
   "Kritik noktalar",
   "İşletmede günlük kontroller",
   "Tesisiniz bu işleyişe göre tasarlanır"
  ]
 },
 {
  "key": "sulama",
  "title": "Sulama sistemleri nasıl işler?",
  "sector": "Hidrolik ve sulama",
  "minutes": 5,
  "summary": "Su kaynağından bitkiye: basınçlı sulama sisteminin bölümleri ve dikkat edilmesi gerekenler.",
  "lessons": [
   {
    "key": "kaynak",
    "title": "Su kaynağı ve izinler",
    "body": [
     "Kuyu, gölet veya kanaldan su kullanımı için ilgili kurumlardan izin gerekir.",
     "Su analizi, filtre seçimini ve gübreleme programını belirler.",
     "Kaynağın debisi, sulanacak alanın büyüklüğünü sınırlar."
    ]
   },
   {
    "key": "sistem",
    "title": "Sistemin bölümleri",
    "body": [
     "Pompa, gereken debi ve basınca göre seçilir.",
     "Filtre grubu damlatıcıların tıkanmasını önler.",
     "Ana ve yan hatlar, basınç kayıpları hesaplanarak boyutlandırılır.",
     "Otomasyon, sulamayı zamana veya sensörlere göre yönetir."
    ]
   },
   {
    "key": "bakim",
    "title": "Bakım ve verim",
    "body": [
     "Düzenli filtre temizliği sistem ömrünü uzatır.",
     "Tıkanan damlatıcılar bitkilerin eşit sulanmamasına yol açar.",
     "Enerji maliyetini düşürmek için güneş enerjili pompa sistemleri değerlendirilebilir."
    ]
   }
  ],
  "checklist": [
   "Su kaynağımın izin durumunu öğrendim",
   "Su analizi yaptırdım",
   "Sulanacak alanı ve ürünü netleştirdim",
   "Enerji seçeneğini düşündüm"
  ],
  "chapters": [
   "Sulama sistemleri nasıl işler?",
   "Suyun yolculuğu",
   "Sistemin bölümleri",
   "Kritik noktalar",
   "Bakım",
   "Sisteminiz bu işleyişe göre tasarlanır"
  ]
 },
 {
  "key": "mikro",
  "title": "Mikro bitki işletmesi nasıl işler?",
  "sector": "Mikro bitki yetiştiriciliği",
  "minutes": 7,
  "summary": "Tohumdan pakete 7–21 günlük üretim döngüsü, raf ve LED sistemi, iklim ve sulama yönetimi, gıda güvenliği ve satış kanalları.",
  "lessons": [
   {
    "key": "dongu",
    "title": "Üretim döngüsü",
    "body": [
     "Mikro bitkiler, ilk gerçek yapraklarını açtıkları dönemde hasat edilen genç sebze ve aromatik bitkilerdir; türe göre ekimden hasada yaklaşık 7–21 gün sürer.",
     "Büyük tohumlu türler (ayçiçeği, bezelye gibi) ekimden önce suda ıslatılır; tohum tepsideki ortama (kokopit, kenevir veya jüt mat) sık ve eşit serpilir.",
     "Ekimden sonra tepsiler birkaç gün üst üste konarak ya da örtülerek karanlıkta tutulur; bu dönem kök tutmayı ve düzgün sürgün boyunu sağlar.",
     "Ardından tepsiler LED ışık altına alınır; bitkiler yeşillenir ve hasat boyuna ulaşır. Hasat temiz bıçak veya makasla, ortam seviyesinin hemen üstünden yapılır."
    ]
   },
   {
    "key": "tesis",
    "title": "Tesis ve ekipman",
    "body": [
     "Üretim kapalı alanda, çok katlı raflarda yapılır; bu sayede küçük bir alandan yüksek verim alınır ve üretim yıl boyu sürer.",
     "Her raf katında LED aydınlatma bulunur; ışık süresi ve yoğunluğu türe göre ayarlanır, zamanlayıcılarla otomatik yönetilir.",
     "Sulama çoğunlukla alttan (tepsi tabanından) yapılır; yaprakların ıslanmaması küf riskini azaltır.",
     "İklimlendirme, nem alma ve fanlarla sürekli hava hareketi sağlanır. Hasat, yıkama-paketleme ve soğuk oda alanları üretim alanından ayrı ve kolay temizlenir olmalıdır."
    ]
   },
   {
    "key": "guvenlik",
    "title": "Gıda güvenliği ve kalite",
    "body": [
     "Mikro bitkiler çoğunlukla çiğ tüketilir; bu nedenle güvenilir tedarikçiden, ilaçlanmamış ve filiz üretimine uygun tohum kullanılmalıdır.",
     "Tepsiler, raflar ve aletler her döngüde temizlenip dezenfekte edilir; çalışan hijyeni ve su kalitesi düzenli kontrol edilir.",
     "Hasattan sonra ürün hızla soğutulur ve soğuk zincirde tutulur; raf ömrü kısadır, bu yüzden üretim planı siparişe göre yapılır.",
     "Satışa başlamadan önce işletmenin il tarım ve orman müdürlüğüne gıda işletmesi olarak kaydı ve etiketleme gereklilikleri netleştirilmelidir."
    ]
   },
   {
    "key": "pazar",
    "title": "Satış ve planlama",
    "body": [
     "Başlıca alıcılar restoranlar, oteller, kafeler, şarküteriler ve marketlerdir; doğrudan tüketiciye abonelik usulü satış da yaygındır.",
     "Her tür farklı sürede hasada geldiği için ekimler kademeli (haftalık) planlanır; böylece her teslimat günü taze ürün hazır olur.",
     "Az sayıda türle başlayıp alıcı talebine göre çeşit artırmak, fire ve maliyeti düşük tutar."
    ]
   }
  ],
  "checklist": [
   "Yetiştireceğim ilk türleri belirledim",
   "Hedef alıcılarımı (restoran, otel, market) araştırdım",
   "Filiz üretimine uygun tohum tedarikçimi belirledim",
   "Üretim alanımın ölçülerini ve elektrik altyapısını çıkardım",
   "Su kaynağımın analizini yaptırdım"
  ],
  "chapters": [
   "Mikro bitki işletmesi nasıl işler?",
   "Üretim döngüsü",
   "Tesisin bölümleri",
   "Sık yetiştirilen türler",
   "Kritik noktalar",
   "Tesisiniz bu döngüye göre tasarlanır"
  ]
 },
 {
  "key": "hibe",
  "title": "Hibe ve destek başvuru süreci",
  "sector": "TKDK / IPARD ve destekler",
  "minutes": 6,
  "summary": "Tarımsal hibe ve desteklere başvuruda izlenen genel adımlar ve en sık yapılan hatalar.",
  "lessons": [
   {
    "key": "adimlar",
    "title": "Başvurunun adımları",
    "body": [
     "Destekler belirli dönemlerde ilan edilen çağrılarla açılır; takvimi kaçırmamak önemlidir.",
     "Önce yatırımın ve başvuru sahibinin uygunluğu kontrol edilir.",
     "İş planı, teknik projeler ve keşif hazırlanarak başvuru yapılır."
    ]
   },
   {
    "key": "hatalar",
    "title": "Sık yapılan hatalar",
    "body": [
     "Sözleşme imzalanmadan yapılan harcamalar çoğu zaman desteklenmez.",
     "Belgelerin güncel ve eksiksiz olması değerlendirmede belirleyicidir.",
     "Uygulama, onaylanan projeyle uyumlu olmalıdır; değişiklikler önceden bildirilmelidir."
    ]
   },
   {
    "key": "sonrasi",
    "title": "Sözleşmeden sonra",
    "body": [
     "Yatırım tamamlandıkça faturalar ve belgeler düzenli toplanır.",
     "Ödeme talebinden sonra yerinde kontrol yapılır.",
     "İzleme dönemi boyunca işletmenin faaliyette kalması ve kayıtların saklanması gerekir."
    ]
   }
  ],
  "checklist": [
   "Hangi desteğe başvurabileceğimi öğrendim",
   "Öz katkı tutarımı planladım",
   "Sözleşme öncesi harcama yapmayacağımı biliyorum",
   "Belgelerimi panelden yükledim"
  ],
  "chapters": [
   "Hibe ve destek başvuru süreci",
   "Başvurunun adımları",
   "Hazırlanması gerekenler",
   "Sık yapılan hatalar",
   "Sözleşmeden sonra",
   "Başvuru takviminizi birlikte planlayalım"
  ]
 }
];
export const videoOf = (k: string) => `/videos/egitim/${k}.mp4`;
export const posterOf = (k: string) => `/videos/egitim/${k}.webp`;
export const pkgByKey = (k: string) => PACKAGES.find((p) => p.key === k) || null;
const BY_TYPE: Record<string, string[]> = {
  'Hayvancılık tesisleri': ['hayvancilik'], 'Kanatlı tesisleri': ['kanatli'], 'Sera ve hidroponik': ['sera'], 'Safran ve kapalı ortam': ['safran'],
  'Soğuk zincir ve paketleme': ['soguk'], 'Hidrolik ve sulama': ['sulama'], 'Mikro bitki yetiştiriciliği': ['mikro'], 'TKDK / IPARD III dosyaları': ['hibe'], 'Yatırım danışmanlığı': ['hibe'],
};
/** Packages that match a client's projects: always the general one, the sector ones, and the grant one. */
export function packagesFor(types: string[]) {
  const keys = ['genel', ...types.flatMap((t) => BY_TYPE[t] || []), 'hibe'];
  return [...new Set(keys)].map(pkgByKey).filter(Boolean) as Pkg[];
}
/** Items a package needs ticked: the video, each lesson and each checklist line. */
export const itemsOf = (p: Pkg) => [`${p.key}:video`, ...p.lessons.map((l) => `${p.key}:l:${l.key}`), ...p.checklist.map((_, i) => `${p.key}:c:${i}`)];
export const pctOf = (p: Pkg, done: Set<string>) => { const it = itemsOf(p); return Math.round((it.filter((x) => done.has(x)).length / it.length) * 100); };
/** Short field videos shown under a package (not counted in progress). */
export type Extra = { key: string; title: string; topic: string; minutes: string };
export const EXTRAS: Record<string, Extra[]> = {
  hayvancilik: [
    { key: 'x-yem-deposu', title: 'Yem depoda neden bozulur?', topic: 'Yem deposu', minutes: '1:09' },
    { key: 'x-gubre', title: 'Gübreden para kazanılır mı?', topic: 'Gübre yönetimi', minutes: '1:14' },
    { key: 'x-sut-yemi', title: 'Süt ineğinde yem karışımı', topic: 'Besleme', minutes: '1:32' },
    { key: 'x-buzagi-24saat', title: 'Buzağının ilk 24 saati', topic: 'Buzağı bakımı', minutes: '0:52' },
    { key: 'x-buzagi-ishal', title: 'Buzağı ishal oldu: sütü kesmeyin', topic: 'Buzağı sağlığı', minutes: '0:58' },
    { key: 'x-buzagi-yemi', title: 'Buzağı yemi tarifi', topic: 'Besleme', minutes: '0:57' },
  ],
};
export const extrasOf = (k: string) => EXTRAS[k] || [];
