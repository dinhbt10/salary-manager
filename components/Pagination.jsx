'use client';
// Pagination.jsx - Phan trang dung chung cho cac bang danh sach.
// Props: page (1-based), pageSize, total, onChange(page). Tu an khi <= 1 trang.
export default function Pagination({ page, pageSize, total, onChange }) {
  const soTrang = Math.max(1, Math.ceil(total / pageSize));
  if (soTrang <= 1) return null;

  const tu = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const den = Math.min(page * pageSize, total);

  // Hien toi da 5 nut so quanh trang hien tai
  const start = Math.max(1, Math.min(page - 2, soTrang - 4));
  const end = Math.min(soTrang, start + 4);
  const nums = [];
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="pagination">
      <span className="pg-info">{tu}–{den} / {total}</span>
      <button onClick={() => onChange(1)} disabled={page === 1}>«</button>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}>‹</button>
      {nums.map((n) => (
        <button key={n} className={n === page ? 'active' : ''} onClick={() => onChange(n)}>{n}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === soTrang}>›</button>
      <button onClick={() => onChange(soTrang)} disabled={page === soTrang}>»</button>
    </div>
  );
}
