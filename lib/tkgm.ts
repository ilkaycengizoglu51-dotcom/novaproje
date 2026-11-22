/** Thin client for TKGM's public parcel service (the one behind parselsorgu.tkgm.gov.tr), with in-memory caching. */
const BASE = 'https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/';
const HDR = { 'User-Agent': 'Mozilla/5.0 (NOVAPROJE parsel sorgu)', Referer: 'https://parselsorgu.tkgm.gov.tr/', Accept: 'application/json' };
const cache = new Map<string, { at: number; v: any }>();
export class TkgmError extends Error { status: number; constructor(msg: string, status = 502) { super(msg); this.status = status; } }
async function get(path: string, ttl: number) {
  const c = cache.get(path); if (c && Date.now() - c.at < ttl) return c.v;
  let r: Response;
  try { r = await fetch(BASE + path, { headers: HDR, cache: 'no-store', signal: AbortSignal.timeout(15000) }); }
  catch { throw new TkgmError('TKGM servisine ulaşılamadı. Biraz sonra tekrar deneyin.'); }
  const t = await r.text(); let j: any = null; try { j = JSON.parse(t); } catch { /* not json */ }
  if (r.status === 404 || (j && (j.Message || j.message) && !j.type && !j.features)) throw new TkgmError('Bu bilgilerle kayıtlı parsel bulunamadı. Ada ve parsel numarasını kontrol edin.', 404);
  if (!r.ok || !j) throw new TkgmError(r.status === 429 ? 'TKGM servisi sorguları kısa süreliğine sınırladı; bir dakika sonra tekrar deneyin.' : 'TKGM servisinden geçerli yanıt alınamadı.');
  if (cache.size > 2000) cache.clear();
  cache.set(path, { at: Date.now(), v: j }); return j;
}
const list = (j: any) => (j.features || []).map((f: any) => ({ id: f.properties.id, text: f.properties.text })).sort((a: any, b: any) => a.text.localeCompare(b.text, 'tr'));
const DAY = 864e5;
export const iller = async () => list(await get('idariYapi/ilListe', DAY));
export const ilceler = async (id: number) => list(await get(`idariYapi/ilceListe/${id}`, DAY));
export const mahalleler = async (id: number) => list(await get(`idariYapi/mahalleListe/${id}`, DAY));
function parcel(j: any) {
  if (!j || j.type !== 'Feature' || !j.properties) throw new TkgmError('Bu bilgilerle kayıtlı parsel bulunamadı.', 404);
  const p = j.properties, m2 = Number(String(p.alan || '').replace(/\./g, '').replace(',', '.')) || null;
  return { geometry: j.geometry, info: { il: p.ilAd, ilce: p.ilceAd, mahalle: p.mahalleAd, ilId: p.ilId, ilceId: p.ilceId, mahalleId: p.mahalleId, ada: p.adaNo, parsel: p.parselNo, alan: p.alan, m2, nitelik: p.nitelik, mevkii: p.mevkii, pafta: p.pafta, zemin: p.zeminKmdurum, ozet: p.ozet, gittigi: p.gittigiParselListe || '', sebep: p.gittigiParselSebep || '' } };
}
export const byNumber = async (mah: number, ada: string, par: string) => parcel(await get(`parsel/${mah}/${encodeURIComponent(ada)}/${encodeURIComponent(par)}`, 36e5));
export const byPoint = async (lat: number, lng: number) => parcel(await get(`parsel/${lat.toFixed(6)}/${lng.toFixed(6)}/`, 36e5));
