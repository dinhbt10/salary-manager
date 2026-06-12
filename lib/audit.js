// lib/audit.js - Ghi nhat ky thao tac (thay cho trigger ben Oracle)
import { run } from './db';

export async function addAudit(tenbang, hanhdong, khoa, noidung) {
  const thoigian = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await run(
    `INSERT INTO audit_log (tenbang, hanhdong, khoachinh, nguoithuchien, thoigian, noidung)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [tenbang, hanhdong, String(khoa), 'APP', thoigian, noidung]
  );
}
