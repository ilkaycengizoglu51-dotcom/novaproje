import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
/** Returns messages of a thread newer than `after`, marks the other side's messages as read. */
export async function GET(req: Request) {
  const u = await getUser(); if (!u) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });
  const sp = new URL(req.url).searchParams, cid = u.role === 'admin' ? Number(sp.get('client')) : u.id, after = Number(sp.get('after') || 0);
  const rows = await q(`SELECT m.*, COALESCE((SELECT json_agg(json_build_object('id', f.id, 'name', f.name, 'size', f.size)) FROM message_files mf JOIN files f ON f.id = mf.file_id WHERE mf.message_id = m.id), '[]') AS files
    FROM messages m WHERE m.client_id = $1 AND m.id > $2 AND m.created_at <= now() ORDER BY m.id`, [cid, after]);
  await q(`UPDATE messages SET read_at = now() WHERE client_id = $1 AND sender <> $2 AND read_at IS NULL AND created_at <= now()`, [cid, u.role === 'admin' ? 'admin' : 'client']);
  const seen = await q(`SELECT id FROM messages WHERE client_id = $1 AND sender = $2 AND read_at IS NOT NULL ORDER BY id DESC LIMIT 50`, [cid, u.role === 'admin' ? 'admin' : 'client']);
  return NextResponse.json({ messages: rows, seen: seen.map((s) => s.id) }, { headers: { 'Cache-Control': 'no-store' } });
}
