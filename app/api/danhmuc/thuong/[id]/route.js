import { NextResponse } from 'next/server';
import { run } from '@/lib/db';
import { addAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
  try {
    await run(`DELETE FROM thuong WHERE mathuong=$1`, [Number(params.id)]);
    await addAudit('THUONG', 'DELETE', params.id, `Xóa thưởng ${params.id}`);
    return NextResponse.json({ message: 'Đã xóa thưởng' });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
