import { STATUS, TYPES } from '@/lib/format';
export default function ProjectFields({ p, clients }: { p?: any; clients: any[] }) {
  return (<>
    <div className="field"><label htmlFor="pf-n">Proje adı</label><input id="pf-n" name="name" defaultValue={p?.name} required /></div>
    <div className="field"><label htmlFor="pf-c">Danışan</label><select id="pf-c" name="client" defaultValue={p?.client_id ?? ''} required><option value="" disabled>Seçin</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name} (@{c.username})</option>)}</select></div>
    <div className="field"><label htmlFor="pf-t">Tesis tipi</label><select id="pf-t" name="type" defaultValue={p?.type ?? TYPES[0]}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
    <div className="field"><label htmlFor="pf-l">Konum</label><input id="pf-l" name="location" defaultValue={p?.location ?? ''} placeholder="İl / ilçe, ada / parsel" /></div>
    <div className="field"><label htmlFor="pf-s">Aşama</label><select id="pf-s" name="status" defaultValue={p?.status ?? 'planlama'}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
    <div className="field"><label htmlFor="pf-p">İlerleme (%)</label><input id="pf-p" name="progress" type="number" min={0} max={100} defaultValue={p?.progress ?? 0} /></div>
    <div className="field"><label htmlFor="pf-a">Başlangıç</label><input id="pf-a" name="start" type="date" defaultValue={p?.start_date ?? ''} /></div>
    <div className="field"><label htmlFor="pf-g">Hedef teslim</label><input id="pf-g" name="target" type="date" defaultValue={p?.target_date ?? ''} /></div>
    <div className="field wide"><label htmlFor="pf-d">Açıklama <span className="opt">(danışan görür)</span></label><textarea id="pf-d" name="description" rows={3} defaultValue={p?.description ?? ''} /></div>
  </>);
}
