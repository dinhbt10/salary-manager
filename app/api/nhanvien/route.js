import { NextResponse } from 'next/server';
import { q, q1, run } from '@/lib/db';
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
    // Chong trung: email / CMND da ton tai thi bao loi (vi DB live chua co rang buoc UNIQUE)
    if (b.EMAIL && await q1(`SELECT 1 FROM nhanvien WHERE email=$1`, [b.EMAIL]))
      return NextResponse.json({ error: `Email "${b.EMAIL}" đã tồn tại` }, { status: 409 });
    if (b.CMND && await q1(`SELECT 1 FROM nhanvien WHERE cmnd=$1`, [b.CMND]))
      return NextResponse.json({ error: `CMND/CCCD "${b.CMND}" đã tồn tại` }, { status: 409 });
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
