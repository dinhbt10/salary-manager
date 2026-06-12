import { NextResponse } from 'next/server';
import { q1, run } from '@/lib/db';
import { addAudit } from '@/lib/audit';
import { NV_VIEW } from '@/lib/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const r = await q1(NV_VIEW + ` WHERE nv.manv=$1`, [Number(params.id)]);
    if (!r) return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });
    return NextResponse.json(r);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(req, { params }) {
  try {
    const b = await req.json();
    await run(
      `UPDATE nhanvien SET hoten=$1, dienthoai=$2, email=$3, diachi=$4, mapb=$5, macv=$6, trangthai=$7 WHERE manv=$8`,
      [b.HOTEN, b.DIENTHOAI, b.EMAIL, b.DIACHI, Number(b.MAPB), Number(b.MACV), b.TRANGTHAI, Number(params.id)]
    );
    await addAudit('NHANVIEN', 'UPDATE', params.id, `Sửa NV ${params.id}`);
    return NextResponse.json({ message: 'Đã cập nhật' });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req, { params }) {
  try {
    await run(`DELETE FROM nhanvien WHERE manv=$1`, [Number(params.id)]);
    await addAudit('NHANVIEN', 'DELETE', params.id, `Xóa NV ${params.id}`);
    return NextResponse.json({ message: 'Đã xóa' });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
