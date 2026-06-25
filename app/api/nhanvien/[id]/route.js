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
    const manv = Number(params.id);
    const mapbMoi = Number(b.MAPB) || null;
    // Chong trung email/CMND voi nhan vien KHAC
    if (b.EMAIL && await q1(`SELECT 1 FROM nhanvien WHERE email=$1 AND manv<>$2`, [b.EMAIL, manv]))
      return NextResponse.json({ error: `Email "${b.EMAIL}" đã thuộc về nhân viên khác` }, { status: 409 });
    if (b.CMND && await q1(`SELECT 1 FROM nhanvien WHERE cmnd=$1 AND manv<>$2`, [b.CMND, manv]))
      return NextResponse.json({ error: `CMND/CCCD "${b.CMND}" đã thuộc về nhân viên khác` }, { status: 409 });
    await run(
      `UPDATE nhanvien SET hoten=$1, gioitinh=$2, ngaysinh=$3, cmnd=$4, dienthoai=$5, email=$6,
              diachi=$7, mapb=$8, macv=$9, sotaikhoan=$10, trangthai=$11 WHERE manv=$12`,
      [b.HOTEN, b.GIOITINH || null, b.NGAYSINH || null, b.CMND || null, b.DIENTHOAI || null, b.EMAIL || null,
       b.DIACHI || null, mapbMoi, Number(b.MACV) || null, b.SOTAIKHOAN || null,
       b.TRANGTHAI || 'Dang lam', manv]
    );
    // Giu 1-1: neu NV doi sang phong khac (hoac roi phong) ma dang la truong phong -> go chuc o phong cu.
    await run(`UPDATE phongban SET matruongphong=NULL WHERE matruongphong=$1 AND mapb IS DISTINCT FROM $2`, [manv, mapbMoi]);
    await addAudit('NHANVIEN', 'UPDATE', params.id, `Sửa NV ${params.id}`);
    return NextResponse.json({ message: 'Đã cập nhật' });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req, { params }) {
  try {
    const manv = Number(params.id);
    // Go chuc truong phong (neu co) de tranh tham chieu treo truoc khi xoa
    await run(`UPDATE phongban SET matruongphong=NULL WHERE matruongphong=$1`, [manv]);
    await run(`DELETE FROM nhanvien WHERE manv=$1`, [manv]);
    await addAudit('NHANVIEN', 'DELETE', params.id, `Xóa NV ${params.id}`);
    return NextResponse.json({ message: 'Đã xóa' });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
