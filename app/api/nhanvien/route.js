import { NextResponse } from 'next/server';
import { q, run } from '@/lib/db';
import { addAudit } from '@/lib/audit';
import { NV_VIEW } from '@/lib/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await q(NV_VIEW + ` ORDER BY nv.manv`));
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const r = await run(
      `INSERT INTO nhanvien (hoten, gioitinh, ngaysinh, cmnd, dienthoai, email, diachi, mapb, macv, sotaikhoan, trangthai)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Dang lam') RETURNING manv`,
      [b.HOTEN, b.GIOITINH, b.NGAYSINH || null, b.CMND || null, b.DIENTHOAI || null, b.EMAIL || null,
       b.DIACHI || null, Number(b.MAPB) || null, Number(b.MACV) || null, b.SOTAIKHOAN || null]
    );
    const manv = r[0].manv;
    await addAudit('NHANVIEN', 'INSERT', manv, `Thêm NV: ${b.HOTEN}`);
    return NextResponse.json({ MANV: manv }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
