import { one } from './db';
export const MAX_FILE = 10 * 1024 * 1024;
export const OK_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
/** Validates and stores an uploaded File in the database; returns its id. */
export const RES_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint', 'video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'];
export async function saveFile(f: File, opts: { clientId?: number | null; uploadedBy: number; isPublic?: boolean; images?: boolean; types?: string[]; max?: number }) {
  if (!f || typeof f === 'string' || !f.size) return null;
  const allowed = opts.types ? opts.types : opts.images ? ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] : OK_TYPES.filter((t) => t !== 'image/svg+xml');
  if (!allowed.includes(f.type)) throw new Error(`${f.name}: ${opts.types ? 'bu dosya türü desteklenmiyor (PDF, PPTX, MP4, JPG, PNG).' : `yalnızca ${opts.images ? 'PNG, JPG, WebP veya SVG' : 'PDF, JPG, PNG veya WebP'} yüklenebilir.`}`);
  const max = opts.max || MAX_FILE; if (f.size > max) throw new Error(`${f.name}: dosya ${Math.round(max / 1048576)} MB’tan büyük.`);
  const buf = Buffer.from(await f.arrayBuffer());
  const r = await one<{ id: string }>('INSERT INTO files (name, mime, size, data, client_id, public, uploaded_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
    [f.name.slice(0, 200), f.type, f.size, buf, opts.clientId ?? null, !!opts.isPublic, opts.uploadedBy]);
  return r?.id ?? null;
}
