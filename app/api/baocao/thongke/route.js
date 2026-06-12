import { NextResponse } from 'next/server';
import { q1 } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    const r = await q1(
      `SELECT COUNT(*)::int AS so_phieu_luong, COALESCE(SUM(luongthuclinh),0)::int AS tong_chi_luong,
              COALESCE(SUM(tongthuong),0)::int AS tong_chi_thuong, COALESCE(SUM(bhxh),0)::int AS tong_bhxh,
              COALESCE(SUM(thuetncn),0)::int AS tong_thue, COALESCE(ROUND(AVG(luongthuclinh)),0)::int AS luong_tb
         FROM bangluong WHERE thang=$1 AND nam=$2`,
      [Number(sp.get('thang')), Number(sp.get('nam'))]);
    return NextResponse.json(r || {});
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
