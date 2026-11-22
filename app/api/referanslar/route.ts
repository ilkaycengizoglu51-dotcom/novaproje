import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
export const revalidate = 60;
export async function GET() {
  try {
    const rows = await q('SELECT id, name, category, city, url, description, logo_id FROM partners WHERE visible ORDER BY sort, id');
    return NextResponse.json(rows.map((r) => ({ ...r, logo: r.logo_id ? `/api/dosya/${r.logo_id}` : null })));
  } catch { return NextResponse.json([]); }
}
