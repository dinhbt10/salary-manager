// lib/db.js - Ket noi Supabase (Postgres) bang postgres.js qua connection pooler.
import postgres from 'postgres';

let _sql;

export function getSql() {
  if (!_sql) {
    _sql = postgres(process.env.DATABASE_URL, {
      prepare: false,      // bat buoc khi dung Supabase transaction pooler (port 6543)
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
    });
  }
  return _sql;
}

// Postgres tra ten cot CHU THUONG -> doi sang CHU HOA cho khop frontend
function toUpperKeys(rows) {
  return rows.map((r) => {
    const o = {};
    for (const k of Object.keys(r)) o[k.toUpperCase()] = r[k];
    return o;
  });
}

// SELECT -> mang object (key VIET HOA). Dung $1,$2... cho tham so.
export async function q(sql, args = []) {
  const rows = await getSql().unsafe(sql, args);
  return toUpperKeys(rows);
}

export async function q1(sql, args = []) {
  const rows = await q(sql, args);
  return rows[0] || null;
}

// INSERT/UPDATE/DELETE. Tra ve mang dong (key chu thuong) - dung cho RETURNING.
export async function run(sql, args = []) {
  return getSql().unsafe(sql, args);
}
