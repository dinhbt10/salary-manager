import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Tra ve TAT CA nhan vien dang lam cua ky, kem bang luong + cham cong neu da co.
// NV chua tinh luong -> cac cot bangluong = null (FE hien "--"); luong co ban luon co.
export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    const thang = Number(sp.get('thang')), nam = Number(sp.get('nam'));
    const rows = await q(
      `SELECT nv.manv, nv.hoten, pb.tenpb, cv.tencv,
              (cv.luongcoban*cv.hesoluong)::int AS luongcoban_goc,
              $1::int AS thang, $2::int AS nam,
              cc.songaycong, cc.songaynghi, cc.sogiotangca,
              bl.mabl, bl.luongcoban, bl.tongphucap, bl.tongthuong, bl.luongtangca,
              (bl.luongcoban+bl.luongtangca+bl.tongphucap+bl.tongthuong) AS thunhap_gop,
              bl.bhxh, bl.thuetncn, bl.tongkhautru, bl.luongthuclinh, bl.ngaytao,
              (bl.mabl IS NOT NULL) AS da_tinh
         FROM nhanvien nv
              LEFT JOIN phongban pb ON nv.mapb=pb.mapb
              LEFT JOIN chucvu cv ON nv.macv=cv.macv
              LEFT JOIN chamcong cc ON cc.manv=nv.manv AND cc.thang=$1 AND cc.nam=$2
              LEFT JOIN bangluong bl ON bl.manv=nv.manv AND bl.thang=$1 AND bl.nam=$2
        WHERE nv.trangthai='Dang lam'
        ORDER BY bl.luongthuclinh DESC NULLS LAST, nv.manv`,
      [thang, nam]);
    return NextResponse.json(rows);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
