import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await q(`SELECT macv, tencv, luongcoban, hesoluong FROM chucvu ORDER BY macv`));
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
