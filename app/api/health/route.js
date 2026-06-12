import { NextResponse } from 'next/server';
import { q1 } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const r = await q1(`SELECT COUNT(*)::int AS n FROM nhanvien`);
    return NextResponse.json({ status: 'ok', db: 'supabase-postgres', so_nhanvien: r?.N ?? 0 });
  } catch (e) {
    return NextResponse.json({ status: 'error', error: e.message }, { status: 500 });
  }
}
