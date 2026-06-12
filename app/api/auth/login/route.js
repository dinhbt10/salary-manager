import { NextResponse } from 'next/server';
import { q1 } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { tendangnhap, matkhau } = await req.json();
    if (!tendangnhap || !matkhau) return NextResponse.json({ error: 'Thiếu tên đăng nhập hoặc mật khẩu' }, { status: 400 });
    const u = await q1(
      `SELECT mauser, tendangnhap, vaitro, manv FROM app_user WHERE tendangnhap=$1 AND matkhau=$2`,
      [tendangnhap, matkhau]
    );
    if (!u) return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 });
    return NextResponse.json({ user: u });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
