import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await q(`SELECT mapb, tenpb, diadiem, matruongphong FROM phongban ORDER BY mapb`));
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
