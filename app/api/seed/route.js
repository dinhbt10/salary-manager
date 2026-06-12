import { NextResponse } from 'next/server';
import { resetAndSeed } from '@/lib/seed';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST /api/seed?secret=...  -> tao bang + nap du lieu mau + tinh luong 5/2026
export async function POST(req) {
  try {
    const secret = new URL(req.url).searchParams.get('secret');
    if (process.env.SEED_SECRET && secret !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: 'Sai SEED_SECRET' }, { status: 401 });
    }
    const r = await resetAndSeed();
    return NextResponse.json({ message: 'Đã nạp dữ liệu mẫu & tính lương 5/2026', ...r });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Cho phep goi bang GET cho tien (mo tren trinh duyet)
export async function GET(req) {
  return POST(req);
}
