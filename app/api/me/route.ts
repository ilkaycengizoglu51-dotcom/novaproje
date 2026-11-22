import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET() { const u = await getUser(); return NextResponse.json(u ? { name: u.name, role: u.role } : null, { headers: { 'Cache-Control': 'no-store' } }); }
