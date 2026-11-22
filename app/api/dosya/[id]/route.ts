import { NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new NextResponse('Bulunamadı', { status: 404 });
  const f = await one('SELECT name, mime, size, data, client_id, public FROM files WHERE id = $1', [params.id]);
  if (!f) return new NextResponse('Bulunamadı', { status: 404 });
  if (!f.public) {
    const u = await getUser(); let ok = !!u && (u.role === 'admin' || f.client_id === u.id);
    if (u && !ok && u.role === 'manager') ok = !!(await one(`SELECT 1 WHERE EXISTS (SELECT 1 FROM resources WHERE file_id = $1)
      OR EXISTS (SELECT 1 FROM lead_files lf JOIN leads l ON l.id = lf.lead_id WHERE lf.file_id = $1 AND l.manager_id = $2)
      OR EXISTS (SELECT 1 FROM users c WHERE c.id = $3 AND c.manager_id = $2)`, [params.id, u.id, f.client_id ?? 0]));
    if (ok && u && u.role !== 'admin') { const pm = await one('SELECT show_client, show_manager FROM project_media WHERE file_id = $1', [params.id]); if (pm && !(u.role === 'client' ? pm.show_client : pm.show_manager)) ok = false; }
    if (!ok) return new NextResponse('Yetkiniz yok', { status: 403 });
  }
  const dl = new URL(req.url).searchParams.has('indir');
  return new NextResponse(f.data, { headers: {
    'Content-Type': f.mime, 'Content-Length': String(f.size),
    'Content-Disposition': `${dl ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(f.name)}`,
    'Cache-Control': f.public ? 'public, max-age=86400' : 'private, no-store',
    ...(f.mime === 'image/svg+xml' ? { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" } : {}),
  } });
}
