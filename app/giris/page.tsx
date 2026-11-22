import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUser, homeOf } from '@/lib/auth';
import LoginForm from './LoginForm';
import { Logo } from '@/components/ui';
import { Still } from '@/components/client-bits';

export const metadata: Metadata = { title: 'Giriş' };
export const dynamic = 'force-dynamic';
export default async function Login({ searchParams }: { searchParams: { tur?: string } }) {
  const u = await getUser(); if (u) redirect(homeOf(u.role));
  const admin = searchParams.tur === 'yonetici', mgr = searchParams.tur === 'portfoy', sub = searchParams.tur === 'taseron';
  return (
    <div className="pa auth2">
      <aside className="auth-side">
        <Still k={admin ? 'nft' : mgr ? 'kumes' : sub ? 'koyun100' : 'agil400'} className="auth-still" />
        <div><a className="back-site" href="/">‹ Siteye dön</a><div style={{ marginTop: 28 }}><Logo /></div>
          <h1>{sub ? <>Size düşen iş,<br /><span>net ve kayıt altında.</span></> : admin ? <>Proje yönetimi,<br /><span>tek ekranda.</span></> : mgr ? <>Portföyünüz,<br /><span>adım adım takipte.</span></> : <>Projeniz,<br /><span>her an elinizin altında.</span></>}</h1>
          <ul>{sub ? <><li>Size atanan projeyi ve üstleneceğiniz işi görün.</li><li>İş sözleşmenizi panelden okuyup elektronik olarak imzalayın.</li><li>İstenen evrakı (vergi levhası, SGK, İSG belgeleri vb.) yükleyin.</li></> : mgr ? <><li>Danışan adaylarınızı ön kayıt formuyla gönderin.</li><li>Yönetici onayına kadar her adımı izleyin.</li><li>Sunum ve proje videolarına erişin, danışanlarınız adına belge yükleyin.</li></> : admin ? <><li>Danışan hesaplarını yalnızca siz açar, şifrelerini siz verirsiniz.</li><li>Sözleşme, belge, mesaj ve tahsilatı tek yerden yönetin.</li><li>Geciken ödemeleri ve bekleyen işleri bir bakışta görün.</li></>
            : <><li>Projenizin hangi aşamada olduğunu anlık takip edin.</li><li>Sözleşmenizi imzalayın, istenen belgeleri yükleyin.</li><li>Ekibimize doğrudan yazın, ödemelerinizi izleyin.</li></>}</ul></div>
        <p style={{ fontSize: 13, color: '#9fb0a5' }}>Bu alan yalnızca NOVAPROJE tarafından hesap tanımlanmış kişilere açıktır.</p>
        <img className="auth-emblem" src="/img/revmark_big.webp" alt="" />
      </aside>
      <main className="auth-main"><div className="auth-box">
        <nav className="seg seg4" aria-label="Giriş türü"><a href="/giris" aria-current={!admin && !mgr && !sub ? 'page' : undefined}>Danışan</a><a href="/giris?tur=portfoy" aria-current={mgr ? 'page' : undefined}>Portföy yöneticisi</a><a href="/giris?tur=taseron" aria-current={sub ? 'page' : undefined}>Taşeron</a><a href="/giris?tur=yonetici" aria-current={admin ? 'page' : undefined}>Yönetici</a></nav>
        <h2>{admin ? 'Yönetici girişi' : mgr ? 'Portföy yöneticisi girişi' : sub ? 'Taşeron girişi' : 'Danışan girişi'}</h2>
        <p className="lead">{admin ? 'Yönetim paneline erişmek için hesabınızla giriş yapın.' : 'Size iletilen kullanıcı adı ve şifre ile giriş yapın.'}</p>
        <LoginForm kind={admin ? 'admin' : mgr ? 'manager' : sub ? 'contractor' : 'client'} />
        <p className="auth-foot">Dışarıdan üyelik alınmaz. Hesaplar yalnızca NOVAPROJE tarafından açılır; giriş bilgileriniz size proje sorumlunuz tarafından iletilir.</p>
      </div></main>
    </div>
  );
}
