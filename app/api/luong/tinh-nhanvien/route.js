import { NextResponse } from 'next/server';
import { tinhLuongNhanVien } from '@/lib/salary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { manv, thang, nam } = await req.json();
    await tinhLuongNhanVien(Number(manv), Number(thang), Number(nam));
    return NextResponse.json({ message: `Đã tính lương NV ${manv} tháng ${thang}/${nam}` });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
