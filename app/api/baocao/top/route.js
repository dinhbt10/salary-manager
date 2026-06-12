import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    const rows = await q(
      `SELECT bl.thang, bl.nam, nv.manv, nv.hoten, pb.tenpb, bl.luongthuclinh, bl.tongthuong,
              CAST(RANK() OVER (ORDER BY bl.luongthuclinh DESC) AS int) AS xephang
         FROM bangluong bl JOIN nhanvien nv ON bl.manv=nv.manv LEFT JOIN phongban pb ON nv.mapb=pb.mapb
        WHERE bl.thang=$1 AND bl.nam=$2`,
      [Number(sp.get('thang')), Number(sp.get('nam'))]);
    return NextResponse.json(rows.filter((r) => r.XEPHANG <= 5));
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
