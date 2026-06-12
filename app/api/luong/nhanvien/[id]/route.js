import { NextResponse } from 'next/server';
import { q1 } from '@/lib/db';
import { LUONG_VIEW } from '@/lib/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const sp = new URL(req.url).searchParams;
    const r = await q1(LUONG_VIEW + ` WHERE bl.manv=$1 AND bl.thang=$2 AND bl.nam=$3`,
      [Number(params.id), Number(sp.get('thang')), Number(sp.get('nam'))]);
    if (!r) return NextResponse.json({ error: 'Chưa có bảng lương cho kỳ này' }, { status: 404 });
    return NextResponse.json(r);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
