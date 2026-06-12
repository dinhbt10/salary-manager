import { NextResponse } from 'next/server';
import { computeAndStoreMonth } from '@/lib/salary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { thang, nam } = await req.json();
    const r = await computeAndStoreMonth(Number(thang), Number(nam));
    return NextResponse.json({ message: `Đã tính lương tháng ${thang}/${nam}`, thanhcong: r.ok, loi: r.loi });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
