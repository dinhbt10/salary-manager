import { NextResponse } from 'next/server';
import { q, run } from '@/lib/db';
import { addAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await q(
      `SELECT kt.makt, kt.manv, nv.hoten, kt.thang, kt.nam, kt.lydo, kt.sotien
         FROM khautru kt JOIN nhanvien nv ON kt.manv=nv.manv
        ORDER BY kt.nam DESC, kt.thang DESC, kt.makt DESC`));
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const r = await run(`INSERT INTO khautru (manv, thang, nam, lydo, sotien) VALUES ($1,$2,$3,$4,$5) RETURNING makt`,
      [Number(b.MANV), Number(b.THANG), Number(b.NAM), b.LYDO, Number(b.SOTIEN)]);
    await addAudit('KHAUTRU', 'INSERT', r[0].makt, `Thêm khấu trừ NV ${b.MANV}: ${b.SOTIEN}`);
    return NextResponse.json({ message: 'Đã thêm khấu trừ' }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
