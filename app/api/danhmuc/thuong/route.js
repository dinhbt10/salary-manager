import { NextResponse } from 'next/server';
import { q, run } from '@/lib/db';
import { addAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await q(
      `SELECT th.mathuong, th.manv, nv.hoten, th.thang, th.nam, th.lydo, th.sotien
         FROM thuong th JOIN nhanvien nv ON th.manv=nv.manv
        ORDER BY th.nam DESC, th.thang DESC, th.mathuong DESC`));
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const r = await run(`INSERT INTO thuong (manv, thang, nam, lydo, sotien) VALUES ($1,$2,$3,$4,$5) RETURNING mathuong`,
      [Number(b.MANV), Number(b.THANG), Number(b.NAM), b.LYDO, Number(b.SOTIEN)]);
    await addAudit('THUONG', 'INSERT', r[0].mathuong, `Thêm thưởng NV ${b.MANV}: ${b.SOTIEN}`);
    return NextResponse.json({ message: 'Đã thêm thưởng' }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
