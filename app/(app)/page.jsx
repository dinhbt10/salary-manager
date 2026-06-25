'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api, { dinhDangTien, kyHienTai } from '@/lib/api';
import Spinner from '@/components/Spinner';
import { SkeletonKpis, SkeletonCard, SkeletonTable } from '@/components/Skeleton';

const COLORS = ['#6366f1', '#16a34a', '#d97706', '#7c3aed', '#dc2626'];
const KY = kyHienTai();

export default function Dashboard() {
  const [thang, setThang] = useState(KY.thang);
  const [nam, setNam] = useState(KY.nam);
  const [tk, setTk] = useState({});
  const [pb, setPb] = useState([]);
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [a, b, c] = await Promise.all([
      api.get(`/baocao/thongke?thang=${thang}&nam=${nam}`),
      api.get(`/baocao/phongban?thang=${thang}&nam=${nam}`),
      api.get(`/baocao/top?thang=${thang}&nam=${nam}`),
    ]);
    setTk(a.data || {}); setPb(b.data); setTop(c.data);
  };

  useEffect(() => { load().catch(() => {}).finally(() => setLoading(false)); }, []);

  const xem = async () => { setLoading(true); try { await load(); } catch {} finally { setLoading(false); } };

  const chartData = pb.map((p) => ({ ten: p.TENPB, luong: Number(p.TONG_LUONG_THUCLINH) }));

  return (
    <div>
      <div className="page-title">Tổng quan <small>Số liệu lương thưởng kỳ {thang}/{nam}</small></div>

      <div className="toolbar">
        <label className="field">Tháng
          <select value={thang} onChange={(e) => setThang(+e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="field">Năm
          <input type="number" value={nam} onChange={(e) => setNam(+e.target.value)} style={{ width: 100 }} />
        </label>
        <button className="btn ghost" onClick={xem} disabled={loading} style={{ alignSelf: 'end' }}>
          {loading && <Spinner />}Xem
        </button>
      </div>

      {loading ? (
        <><SkeletonKpis n={4} /><SkeletonCard height={300} /><SkeletonTable rows={5} cols={5} /></>
      ) : (
        <>
          <div className="kpi-grid">
            <div className="kpi blue"><div className="label">Số phiếu lương</div><div className="value">{tk.SO_PHIEU_LUONG || 0}</div></div>
            <div className="kpi green"><div className="label">Tổng chi lương</div><div className="value">{dinhDangTien(tk.TONG_CHI_LUONG)}</div></div>
            <div className="kpi amber"><div className="label">Tổng chi thưởng</div><div className="value">{dinhDangTien(tk.TONG_CHI_THUONG)}</div></div>
            <div className="kpi red"><div className="label">Tổng thuế TNCN</div><div className="value">{dinhDangTien(tk.TONG_THUE)}</div></div>
          </div>

          <div className="card">
            <h3>Chi lương theo phòng ban</h3>
            {chartData.length === 0 ? <p style={{ color: '#64748b' }}>Chưa có dữ liệu. Bấm "Tính lương cả công ty".</p> :
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                  <XAxis dataKey="ten" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => (v / 1e6).toFixed(0) + 'tr'} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => dinhDangTien(v)} />
                  <Bar dataKey="luong" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>}
          </div>

          <div className="card">
            <h3>Top 5 thu nhập cao nhất</h3>
            <table>
              <thead><tr><th>Hạng</th><th>Nhân viên</th><th>Phòng ban</th><th className="num">Thưởng</th><th className="num">Thực lĩnh</th></tr></thead>
              <tbody>
                {top.map((t) => (
                  <tr key={t.MANV}>
                    <td>#{t.XEPHANG}</td><td>{t.HOTEN}</td><td>{t.TENPB}</td>
                    <td className="num">{dinhDangTien(t.TONGTHUONG)}</td>
                    <td className="num"><b>{dinhDangTien(t.LUONGTHUCLINH)}</b></td>
                  </tr>
                ))}
                {top.length === 0 && <tr><td colSpan={5} style={{ color: '#64748b' }}>Chưa có dữ liệu.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
