import { notFound } from 'next/navigation';
import { requireClient } from '@/lib/auth';
import { installments, milestones, project, updates } from '@/lib/data';
import { date } from '@/lib/format';
import { Badge, Kpis, Milestones, PayTable, Prog, Updates } from '@/components/ui';
import { PageTitle } from '@/components/Shell';
import Gallery from '@/components/Gallery';
import { mediaOfProject } from '@/lib/media';
import { packagesFor } from '@/lib/training';

export default async function ClientProject({ params }: { params: { id: string } }) {
  const u = await requireClient(); const p = await project(Number(params.id)); if (!p || p.client_id !== u.id) notFound();
  const [ms, ups, inst, media] = await Promise.all([milestones(p.id), updates(p.id), installments(p.id), mediaOfProject(p.id, 'client')]);
  const tp = packagesFor([p.type]).find((x) => x.key !== 'genel' && x.key !== 'hibe');
  return (
    <>
      <PageTitle title={p.name} crumb={{ href: '/panel', label: 'Genel bakış' }} />
      {p.description && <p className="muted" style={{ maxWidth: '80ch' }}>{p.description}</p>}
      <div className="grid2">
        <section className="card"><div className="card-head"><h2>İlerleme</h2><Badge s={p.status} /></div><Prog v={p.progress} />
          <dl className="meta3"><div><dt>Konum</dt><dd>{p.location || '—'}</dd></div><div><dt>Başlangıç</dt><dd>{date(p.start_date)}</dd></div><div><dt>Hedef teslim</dt><dd>{date(p.target_date)}</dd></div></dl>
          <h2 style={{ marginTop: 6 }}>İş programı</h2><Milestones items={ms} /></section>
        <div style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
          <section className="card"><h2>Güncellemeler</h2><Updates items={ups} /></section>
          <section className="card contact-card"><h2>Proje sorumlunuz</h2><p>Sorularınız için “Mesajlar” bölümünden ekibimize yazabilir ya da <a href="mailto:info@novaproje.com">info@novaproje.com</a> adresine e-posta gönderebilirsiniz.</p></section>
        </div>
      </div>
      <section className="card"><div className="card-head"><h2>Sahadan görseller</h2><span className="muted">{media.length} görsel</span></div><Gallery items={JSON.parse(JSON.stringify(media))} empty="Projeniz ilerledikçe sahadan görseller burada paylaşılacak." /></section>
      {tp && <a className="tv-cta" href={`/panel/egitimler/${tp.key}`}><span className="tv-cta-ic" aria-hidden="true">▶</span><span><small>Projenize özel eğitim</small><b>{tp.title}</b></span><span aria-hidden="true">›</span></a>}
      <section className="card"><h2>Ödeme planı</h2><Kpis list={inst} /><PayTable list={inst} /></section>
    </>
  );
}
