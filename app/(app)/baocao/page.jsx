'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api, { dinhDangTien } from '@/lib/api';
import { SkeletonCard, SkeletonTable } from '@/components/Skeleton';

const COLORS = ['#6366f1', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0891b2'];

export default function BaoCao() {
  const [thang, setThang] = useState(5);
  const [nam, setNam] = useState(2026);
  const [pb, setPb] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get(`/baocao/phongban?thang=${thang}&nam=${nam}`);
    setPb(data);
  };
  useEffect(() => { load().catch(() => {}).finally(() => setLoading(false)); }, []);

  const pieData = pb.map((p) => ({ name: p.TENPB, value: Number(p.TONG_LUONG_THUCLINH) }));

  return (
    <div>
      <div className="page-title">Báo cáo tổng hợp <small>Phân tích chi lương theo phòng ban</small></div>

      <div className="toolbar">
        <label className="field">Tháng
          <select value={thang} onChange={(e) => setThang(+e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="field">Năm<input type="number" value={nam} onChange={(e) => setNam(+e.target.value)} style={{ width: 100 }} /></label>
        <button className="btn ghost" style={{ alignSelf: 'end' }} onClick={() => load().catch(() => {})}>Xem</button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <SkeletonCard height={300} /><SkeletonTable rows={5} cols={4} />
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3>Tỷ trọng chi lương</h3>
          {pieData.length === 0 ? <p style={{ color: '#64748b' }}>Chưa có dữ liệu.</p> :
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(e) => e.name}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => dinhDangTien(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>}
        </div>

        <div className="card">
          <h3>Chi tiết theo phòng ban</h3>
          <table>
            <thead><tr><th>Phòng ban</th><th className="num">Số NV</th><th className="num">TB/người</th><th className="num">Tổng chi</th></tr></thead>
            <tbody>
              {pb.map((p) => (
                <tr key={p.MAPB}>
                  <td>{p.TENPB}</td>
                  <td className="num">{p.SO_NHANVIEN}</td>
                  <td className="num">{dinhDangTien(p.LUONG_TRUNGBINH)}</td>
                  <td className="num"><b>{dinhDangTien(p.TONG_LUONG_THUCLINH)}</b></td>
                </tr>
              ))}
              {pb.length === 0 && <tr><td colSpan={4} style={{ color: '#64748b' }}>Chưa có dữ liệu.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
