import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await q(
      `SELECT malog, tenbang, hanhdong, khoachinh, nguoithuchien, thoigian, noidung
         FROM audit_log ORDER BY malog DESC LIMIT 100`);
    return NextResponse.json(rows);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
