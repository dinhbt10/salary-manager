import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { LUONG_VIEW } from '@/lib/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    const rows = await q(LUONG_VIEW + ` WHERE bl.thang=$1 AND bl.nam=$2 ORDER BY bl.luongthuclinh DESC`,
      [Number(sp.get('thang')), Number(sp.get('nam'))]);
    return NextResponse.json(rows);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
