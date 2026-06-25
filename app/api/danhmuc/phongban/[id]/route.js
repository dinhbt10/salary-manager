import { NextResponse } from 'next/server';
import { q1, run } from '@/lib/db';
import { addAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  try {
    const b = await req.json();
    if (!b.TENPB) return NextResponse.json({ error: 'Thiếu tên phòng ban' }, { status: 400 });
    const mapb = Number(params.id);
    const manvTP = b.MATRUONGPHONG ? Number(b.MATRUONGPHONG) : null;
    if (manvTP) {
      // (1) Truong phong phai la nhan vien THUOC phong nay
      const nv = await q1(`SELECT mapb FROM nhanvien WHERE manv=$1`, [manvTP]);
      if (!nv) return NextResponse.json({ error: 'Không tìm thấy nhân viên được chọn' }, { status: 400 });
      if (Number(nv.MAPB) !== mapb)
        return NextResponse.json({ error: 'Trưởng phòng phải là nhân viên thuộc chính phòng ban này' }, { status: 409 });
      // (2) 1-1: nguoi nay khong duoc dang lam truong phong noi khac
      const da = await q1(`SELECT mapb FROM phongban WHERE matruongphong=$1 AND mapb<>$2`, [manvTP, mapb]);
      if (da) return NextResponse.json({ error: 'Nhân viên này đã là trưởng phòng của phòng khác' }, { status: 409 });
    }
    await run(
      `UPDATE phongban SET tenpb=$1, diadiem=$2, matruongphong=$3 WHERE mapb=$4`,
      [b.TENPB, b.DIADIEM || null, manvTP, mapb]);
    await addAudit('PHONGBAN', 'UPDATE', params.id, `Sửa phòng ban ${params.id}: ${b.TENPB}`);
    return NextResponse.json({ message: 'Đã cập nhật phòng ban' });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req, { params }) {
  try {
    // Khong cho xoa phong ban con nhan vien (giu toan ven du lieu)
    const c = await q1(`SELECT COUNT(*)::int AS n FROM nhanvien WHERE mapb=$1`, [Number(params.id)]);
    if (c.N > 0) return NextResponse.json(
      { error: `Phòng ban đang có ${c.N} nhân viên — chuyển/ xóa nhân viên trước khi xóa phòng ban` }, { status: 409 });
    await run(`DELETE FROM phongban WHERE mapb=$1`, [Number(params.id)]);
    await addAudit('PHONGBAN', 'DELETE', params.id, `Xóa phòng ban ${params.id}`);
    return NextResponse.json({ message: 'Đã xóa phòng ban' });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
