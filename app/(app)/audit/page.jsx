'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { SkeletonTable } from '@/components/Skeleton';

const mau = { INSERT: 'green', UPDATE: 'gray', DELETE: 'gray' };

export default function AuditLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { const { data } = await api.get('/baocao/audit'); setRows(data); };
  useEffect(() => { load().catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <div className="page-title">Nhật ký thao tác (Audit Log)
        <small>Ghi tự động mỗi khi thêm/sửa/xóa — chứng minh tính truy vết</small>
      </div>
      <div className="toolbar"><button className="btn ghost" onClick={() => load().catch(() => {})}>↻ Làm mới</button></div>
      {loading ? <SkeletonTable rows={8} cols={7} /> : (
      <div className="card">
        <table>
          <thead><tr><th>#</th><th>Thời gian</th><th>Bảng</th><th>Hành động</th><th>Khóa</th><th>Người TH</th><th>Nội dung</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.MALOG}>
                <td>{r.MALOG}</td><td>{r.THOIGIAN}</td><td>{r.TENBANG}</td>
                <td><span className={`tag ${mau[r.HANHDONG] || 'gray'}`}>{r.HANHDONG}</span></td>
                <td>{r.KHOACHINH}</td><td>{r.NGUOITHUCHIEN}</td><td>{r.NOIDUNG}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} style={{ color: '#64748b' }}>Chưa có nhật ký.</td></tr>}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
