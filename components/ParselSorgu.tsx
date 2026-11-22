'use client';
import { useEffect, useRef, useState } from 'react';

type Opt = { id: number; text: string };
type Res = { geometry: any; info: any };
const TR = (s: string) => s.toLocaleLowerCase('tr');
const fmt = (n: number, d = 0) => n.toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
let leaflet: Promise<any> | null = null;
function loadLeaflet() {
  if (leaflet) return leaflet;
  leaflet = new Promise((res, rej) => {
    if ((window as any).L) return res((window as any).L);
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
    const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = () => res((window as any).L); s.onerror = rej; document.head.appendChild(s);
  });
  return leaflet;
}
async function api(path: string) {
  const r = await fetch('/api/tkgm/' + path, { cache: 'no-store' }); const j = await r.json().catch(() => ({ error: 'Yanıt okunamadı.' }));
  if (!r.ok) throw new Error(j.error || 'Sorgu başarısız.'); return j;
}
const ring = (g: any): number[][] => (g?.type === 'Polygon' ? g.coordinates[0] : g?.type === 'MultiPolygon' ? g.coordinates[0][0] : []);
function perimeter(g: any) {
  const c = ring(g); let m = 0; const R = 6371008.8, rad = Math.PI / 180;
  for (let i = 1; i < c.length; i++) { const [x1, y1] = c[i - 1], [x2, y2] = c[i]; const dl = (y2 - y1) * rad, dg = (x2 - x1) * rad; const a = Math.sin(dl / 2) ** 2 + Math.cos(y1 * rad) * Math.cos(y2 * rad) * Math.sin(dg / 2) ** 2; m += 2 * R * Math.asin(Math.sqrt(a)); }
  return m;
}
function centroid(g: any) { const c = ring(g); if (!c.length) return null; let x = 0, y = 0; c.slice(0, -1).forEach(([a, b]) => { x += a; y += b; }); const n = Math.max(1, c.length - 1); return { lat: y / n, lng: x / n }; }
function download(name: string, text: string, type: string) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
const slug = (s: string) => TR(s).replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Combo({ id, label, opts, value, onPick, disabled, placeholder }: { id: string; label: string; opts: Opt[]; value: Opt | null; onPick: (o: Opt | null) => void; disabled?: boolean; placeholder: string }) {
  const [q, setQ] = useState(''), [open, setOpen] = useState(false), [hi, setHi] = useState(0);
  useEffect(() => { setQ(value ? value.text : ''); }, [value]);
  const list = (q && (!value || q !== value.text) ? opts.filter((o) => TR(o.text).includes(TR(q))) : opts).slice(0, 200);
  const pick = (o: Opt) => { onPick(o); setQ(o.text); setOpen(false); };
  return (
    <div className="field combo">
      <label htmlFor={id}>{label}</label>
      <input id={id} role="combobox" aria-expanded={open} aria-controls={id + '-l'} aria-autocomplete="list" autoComplete="off" disabled={disabled} placeholder={placeholder} value={q}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); if (value) onPick(null); }}
        onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, list.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); } else if (e.key === 'Enter' && open && list[hi]) { e.preventDefault(); pick(list[hi]); } else if (e.key === 'Escape') setOpen(false); }} />
      {open && !disabled && list.length > 0 && <ul className="combo-list" id={id + '-l'} role="listbox">{list.map((o, i) => <li key={o.id} role="option" aria-selected={i === hi} className={i === hi ? 'hi' : ''} onMouseDown={(e) => { e.preventDefault(); pick(o); }}>{o.text}</li>)}</ul>}
    </div>
  );
}

export default function ParselSorgu({ role }: { role: 'admin' | 'manager' }) {
  const [iller, setIller] = useState<Opt[]>([]), [ilceler, setIlceler] = useState<Opt[]>([]), [mahalleler, setMahalleler] = useState<Opt[]>([]);
  const [il, setIl] = useState<Opt | null>(null), [ilce, setIlce] = useState<Opt | null>(null), [mah, setMah] = useState<Opt | null>(null);
  const [ada, setAda] = useState(''), [par, setPar] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [res, setRes] = useState<Res | null>(null);
  const [base, setBase] = useState<'uydu' | 'harita'>('uydu'), [pick, setPick] = useState(false), [recent, setRecent] = useState<any[]>([]), [copied, setCopied] = useState('');
  const mapEl = useRef<HTMLDivElement>(null), M = useRef<any>({});

  useEffect(() => { api('iller').then(setIller).catch((e) => setErr(e.message)); try { setRecent(JSON.parse(localStorage.getItem('np-parsel-son') || '[]')); } catch { /* ignore */ } }, []);
  useEffect(() => { setIlceler([]); setIlce(null); if (il) api('ilceler/' + il.id).then(setIlceler).catch((e) => setErr(e.message)); }, [il]);
  useEffect(() => { setMahalleler([]); setMah(null); if (ilce) api('mahalleler/' + ilce.id).then(setMahalleler).catch((e) => setErr(e.message)); }, [ilce]);

  useEffect(() => {
    let alive = true;
    loadLeaflet().then((L) => {
      if (!alive || !mapEl.current || M.current.map) return;
      const map = L.map(mapEl.current, { zoomControl: true, attributionControl: true }).setView([39.0, 35.2], 6);
      const uydu = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Uydu: Esri' });
      const etiket = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });
      const harita = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' });
      uydu.addTo(map); etiket.addTo(map);
      M.current = { L, map, uydu, etiket, harita, layer: null, pin: null };
      setTimeout(() => map.invalidateSize(), 50);
    }).catch(() => setErr('Harita yüklenemedi; internet bağlantınızı kontrol edin. Sorgu yine çalışır.'));
    return () => { alive = false; };
  }, []);
  useEffect(() => { const m = M.current; if (!m.map) return; if (base === 'uydu') { m.map.removeLayer(m.harita); m.uydu.addTo(m.map); m.etiket.addTo(m.map); } else { m.map.removeLayer(m.uydu); m.map.removeLayer(m.etiket); m.harita.addTo(m.map); } }, [base]);
  useEffect(() => {
    const m = M.current; if (!m.map) return; const h = (e: any) => { if (pick) query('nokta/' + e.latlng.lat.toFixed(6) + '/' + e.latlng.lng.toFixed(6)); };
    m.map.on('click', h); m.map.getContainer().style.cursor = pick ? 'crosshair' : ''; return () => { m.map.off('click', h); };
  }, [pick]); // eslint-disable-line

  function show(r: Res) {
    const m = M.current; if (!m.map) return; const { L, map } = m;
    if (m.layer) map.removeLayer(m.layer); if (m.pin) map.removeLayer(m.pin);
    m.layer = L.geoJSON(r.geometry, { style: { color: '#a6cb4c', weight: 3, fillColor: '#8db43a', fillOpacity: .28, className: 'parsel-poly' } }).addTo(map);
    const c = centroid(r.geometry);
    if (c) m.pin = L.marker([c.lat, c.lng], { icon: L.divIcon({ className: 'parsel-pin', html: `<span>${r.info.ada}/${r.info.parsel}</span>`, iconSize: null }) }).addTo(map);
    map.flyToBounds(m.layer.getBounds(), { padding: [60, 60], maxZoom: 18, duration: 1.6 });
  }
  async function query(path: string) {
    setBusy(true); setErr('');
    try {
      const r: Res = await api(path); setRes(r); show(r); setPick(false);
      const i = r.info; setAda(i.ada); setPar(i.parsel);
      const item = { ozet: `${i.mahalle} ${i.ada}/${i.parsel}`, yer: `${i.ilce} / ${i.il}`, path: `parsel/${i.mahalleId}/${i.ada}/${i.parsel}`, at: Date.now() };
      const next = [item, ...recent.filter((x) => x.path !== item.path)].slice(0, 8); setRecent(next); try { localStorage.setItem('np-parsel-son', JSON.stringify(next)); } catch { /* ignore */ }
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mah) return setErr('İl, ilçe ve mahalle/köy seçin.');
    if (!/^\d{1,7}$/.test(ada.trim()) || !/^\d{1,7}$/.test(par.trim())) return setErr('Ada ve parsel numarasını rakamla yazın (ada yoksa 0 yazın).');
    query(`parsel/${mah.id}/${ada.trim()}/${par.trim()}`);
  };
  const i = res?.info, c = res ? centroid(res.geometry) : null, per = res ? perimeter(res.geometry) : 0;
  const name = i ? `${slug(i.mahalle)}-${i.ada}-${i.parsel}` : 'parsel';
  const kml = () => { const pts = ring(res!.geometry).map(([x, y]) => `${x},${y},0`).join(' '); return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${i.ozet}</name><Placemark><name>${i.il} ${i.ilce} ${i.mahalle} ${i.ada}/${i.parsel}</name><description>${i.nitelik} · ${i.alan} m²</description><Style><LineStyle><color>ff3ab48d</color><width>3</width></LineStyle><PolyStyle><color>553ab48d</color></PolyStyle></Style><Polygon><outerBoundaryIs><LinearRing><coordinates>${pts}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>`; };
  const copy = async (t: string, k: string) => { try { await navigator.clipboard.writeText(t); setCopied(k); setTimeout(() => setCopied(''), 1600); } catch { /* ignore */ } };
  const leadHref = i ? `/portfoy/on-kayit/yeni?konum=${encodeURIComponent(`${i.ilce} / ${i.il}, ${i.mahalle}`)}&parsel=${encodeURIComponent(`Ada ${i.ada}, Parsel ${i.parsel}`)}&notlar=${encodeURIComponent(`TKGM parsel sorgu: ${i.mahalle} ${i.ada}/${i.parsel} · ${i.nitelik} · ${i.alan} m²${i.mevkii ? ' · Mevkii: ' + i.mevkii : ''} · Pafta ${i.pafta}`)}` : '#';

  return (
    <div className="ps">
      <section className="card ps-form">
        <form onSubmit={submit} noValidate>
          <div className="ps-grid">
            <Combo id="ps-il" label="İl" opts={iller} value={il} onPick={setIl} placeholder={iller.length ? 'İl yazın veya seçin' : 'Yükleniyor…'} disabled={!iller.length} />
            <Combo id="ps-ilce" label="İlçe" opts={ilceler} value={ilce} onPick={setIlce} placeholder={il ? 'İlçe' : 'Önce il seçin'} disabled={!il || !ilceler.length} />
            <Combo id="ps-mah" label="Mahalle / köy" opts={mahalleler} value={mah} onPick={setMah} placeholder={ilce ? 'Mahalle / köy' : 'Önce ilçe seçin'} disabled={!ilce || !mahalleler.length} />
            <div className="field"><label htmlFor="ps-ada">Ada</label><input id="ps-ada" inputMode="numeric" value={ada} onChange={(e) => setAda(e.target.value.replace(/\D/g, ''))} placeholder="Örn. 140" /></div>
            <div className="field"><label htmlFor="ps-par">Parsel</label><input id="ps-par" inputMode="numeric" value={par} onChange={(e) => setPar(e.target.value.replace(/\D/g, ''))} placeholder="Örn. 466" /></div>
            <div className="ps-go"><button type="submit" className="btn btn-ink" disabled={busy}>{busy ? 'Sorgulanıyor…' : 'Sorgula'}</button></div>
          </div>
          {err && <div className="alert err" role="alert">{err}</div>}
        </form>
        {recent.length > 0 && <div className="ps-recent"><span>Son sorgular:</span>{recent.map((r) => <button key={r.path} type="button" className="chipb" onClick={() => query(r.path)} title={r.yer}>{r.ozet}</button>)}</div>}
      </section>

      <div className={`ps-main ${res ? 'has' : ''}`}>
        <div className="ps-map-wrap">
          <div ref={mapEl} className="ps-map" role="application" aria-label="Parsel haritası" />
          <div className="ps-tools">
            <div className="seg-sm" role="group" aria-label="Harita türü"><button type="button" aria-pressed={base === 'uydu'} onClick={() => setBase('uydu')}>Uydu</button><button type="button" aria-pressed={base === 'harita'} onClick={() => setBase('harita')}>Harita</button></div>
            <button type="button" className={`ps-pick ${pick ? 'on' : ''}`} aria-pressed={pick} onClick={() => setPick((p) => !p)}>{pick ? 'Haritada bir noktaya tıklayın…' : 'Haritadan seç'}</button>
          </div>
          {busy && <div className="ps-busy" aria-hidden="true"><span /></div>}
        </div>

        {i && (
          <aside className="ps-card" aria-live="polite" key={i.ozet}>
            <p className="ps-kicker">{i.il} · {i.ilce}</p>
            <h2>{i.mahalle} <span>{i.ada}/{i.parsel}</span></h2>
            <div className="ps-area"><b>{i.m2 ? fmt(i.m2, 2) : i.alan}</b><small>m²</small>{i.m2 && <em>{fmt(i.m2 / 1000, 2)} dönüm · {fmt(i.m2 / 10000, 3)} ha</em>}</div>
            <dl className="ps-dl">
              <div><dt>Nitelik</dt><dd>{i.nitelik || '—'}</dd></div>
              <div><dt>Mevkii</dt><dd>{i.mevkii || '—'}</dd></div>
              <div><dt>Ada / parsel</dt><dd>{i.ada} / {i.parsel}</dd></div>
              <div><dt>Pafta</dt><dd>{i.pafta || '—'}</dd></div>
              <div><dt>Zemin durumu</dt><dd>{i.zemin || '—'}</dd></div>
              <div><dt>Çevre (yaklaşık)</dt><dd>{fmt(per, 0)} m</dd></div>
              {c && <div><dt>Merkez koordinat</dt><dd className="mono">{c.lat.toFixed(6)}, {c.lng.toFixed(6)} <button type="button" className="btn-link" onClick={() => copy(`${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}`, 'k')}>{copied === 'k' ? 'Kopyalandı' : 'Kopyala'}</button></dd></div>}
              {i.gittigi && <div><dt>Gittiği parsel</dt><dd>{i.gittigi}{i.sebep ? ` (${i.sebep})` : ''}</dd></div>}
            </dl>
            <div className="ps-acts">
              {c && <a className="btn btn-ghost2 btn-sm" href={`https://www.google.com/maps?q=${c.lat},${c.lng}`} target="_blank" rel="noopener">Google Haritalar</a>}
              <button type="button" className="btn btn-ghost2 btn-sm" onClick={() => download(name + '.kml', kml(), 'application/vnd.google-earth.kml+xml')}>KML indir</button>
              <button type="button" className="btn btn-ghost2 btn-sm" onClick={() => download(name + '.geojson', JSON.stringify({ type: 'Feature', geometry: res!.geometry, properties: i }), 'application/geo+json')}>GeoJSON indir</button>
              <button type="button" className="btn btn-ghost2 btn-sm" onClick={() => copy(`${i.il} / ${i.ilce} / ${i.mahalle} · Ada ${i.ada}, Parsel ${i.parsel} · ${i.nitelik} · ${i.alan} m²${i.mevkii ? ' · ' + i.mevkii : ''}`, 'o')}>{copied === 'o' ? 'Kopyalandı' : 'Özeti kopyala'}</button>
              <button type="button" className="btn btn-ghost2 btn-sm" onClick={() => window.print()}>Yazdır</button>
              {role === 'manager' && <a className="btn btn-lime btn-sm" href={leadHref}>Bu parselle ön kayıt başlat</a>}
            </div>
          </aside>
        )}
      </div>
      <p className="hint ps-note">Bilgiler Tapu ve Kadastro Genel Müdürlüğü’nün (TKGM) herkese açık parsel sorgu servisinden anlık alınır; bilgilendirme amaçlıdır, resmi tapu kaydı yerine geçmez. Malik bilgisi bu serviste yer almaz.</p>
    </div>
  );
}
