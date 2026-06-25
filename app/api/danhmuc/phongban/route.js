import { NextResponse } from 'next/server';
import { q, q1, run } from '@/lib/db';
import { addAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Danh sach phong ban kem so nhan vien va ten truong phong (de hien thi & lien ket NV)
export async function GET() {
  try {
    return NextResponse.json(await q(
      `SELECT pb.mapb, pb.tenpb, pb.diadiem, pb.matruongphong, tp.hoten AS tentruongphong,
              (SELECT COUNT(*) FROM nhanvien nv WHERE nv.mapb=pb.mapb)::int AS songuoi
         FROM phongban pb LEFT JOIN nhanvien tp ON pb.matruongphong=tp.manv
        ORDER BY pb.mapb`));
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const b = await req.json();
    if (!b.TENPB) return NextResponse.json({ error: 'Thiếu tên phòng ban' }, { status: 400 });
    const manvTP = b.MATRUONGPHONG ? Number(b.MATRUONGPHONG) : null;
    // 1-1: nguoi nay khong duoc dang lam truong phong noi khac
    if (manvTP) {
      const da = await q1(`SELECT mapb FROM phongban WHERE matruongphong=$1`, [manvTP]);
      if (da) return NextResponse.json({ error: 'Nhân viên này đã là trưởng phòng của phòng khác' }, { status: 409 });
    }
    const r = await run(
      `INSERT INTO phongban (tenpb, diadiem, matruongphong) VALUES ($1,$2,$3) RETURNING mapb`,
      [b.TENPB, b.DIADIEM || null, manvTP]);
    const mapb = r[0].mapb;
    await addAudit('PHONGBAN', 'INSERT', mapb, `Thêm phòng ban: ${b.TENPB}`);
    return NextResponse.json({ MAPB: mapb }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
