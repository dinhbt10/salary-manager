import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    const rows = await q(
      `SELECT pb.mapb, pb.tenpb, bl.thang, bl.nam, COUNT(*)::int AS so_nhanvien,
              SUM(bl.luongthuclinh)::int AS tong_luong_thuclinh, ROUND(AVG(bl.luongthuclinh))::int AS luong_trungbinh,
              SUM(bl.tongthuong)::int AS tong_thuong, SUM(bl.thuetncn)::int AS tong_thue
         FROM bangluong bl JOIN nhanvien nv ON bl.manv=nv.manv JOIN phongban pb ON nv.mapb=pb.mapb
        WHERE bl.thang=$1 AND bl.nam=$2 GROUP BY pb.mapb, pb.tenpb, bl.thang, bl.nam
        ORDER BY tong_luong_thuclinh DESC`,
      [Number(sp.get('thang')), Number(sp.get('nam'))]);
    return NextResponse.json(rows);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
