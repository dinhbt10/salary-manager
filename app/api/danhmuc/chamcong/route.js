import { NextResponse } from 'next/server';
import { q, run } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    const t = sp.get('thang') ? Number(sp.get('thang')) : null;
    const n = sp.get('nam') ? Number(sp.get('nam')) : null;
    const rows = await q(
      `SELECT cc.macc, cc.manv, nv.hoten, cc.thang, cc.nam, cc.songaycong, cc.songaynghi, cc.sogiotangca
         FROM chamcong cc JOIN nhanvien nv ON cc.manv=nv.manv
        WHERE ($1::int IS NULL OR cc.thang=$1) AND ($2::int IS NULL OR cc.nam=$2) ORDER BY cc.manv`,
      [t, n]);
    return NextResponse.json(rows);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const b = await req.json();
    await run(`DELETE FROM chamcong WHERE manv=$1 AND thang=$2 AND nam=$3`, [Number(b.MANV), Number(b.THANG), Number(b.NAM)]);
    await run(
      `INSERT INTO chamcong (manv, thang, nam, songaycong, songaynghi, sogiotangca) VALUES ($1,$2,$3,$4,$5,$6)`,
      [Number(b.MANV), Number(b.THANG), Number(b.NAM), Number(b.SONGAYCONG), Number(b.SONGAYNGHI || 0), Number(b.SOGIOTANGCA || 0)]);
    return NextResponse.json({ message: 'Đã lưu chấm công' }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
