'use client';
import { useEffect, useState } from 'react';
import api, { dinhDangTien } from '@/lib/api';
import Modal from '@/components/Modal';
import { SkeletonTable } from '@/components/Skeleton';

export default function BangLuong() {
  const [thang, setThang] = useState(5);
  const [nam, setNam] = useState(2026);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const [chitiet, setChitiet] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get(`/luong?thang=${thang}&nam=${nam}`);
    setRows(data);
  };
  useEffect(() => { load().catch(() => {}).finally(() => setLoading(false)); }, []);

  const tinhThang = async () => {
    setMsg({ t: 'ok', m: 'Đang tính lương...' });
    try {
      const { data } = await api.post('/luong/tinh-thang', { thang, nam });
      setMsg({ t: 'ok', m: `${data.message}. Thành công: ${data.thanhcong}, Lỗi: ${data.loi}` });
      await load();
    } catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
  };

  return (
    <div>
      <div className="page-title">Bảng lương <small>Kết quả tính lương (logic port từ PL/SQL)</small></div>
      {msg && <div className={`alert ${msg.t === 'ok' ? 'ok' : 'err'}`}>{msg.m}</div>}

      <div className="toolbar">
        <label className="field">Tháng
          <select value={thang} onChange={(e) => setThang(+e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="field">Năm<input type="number" value={nam} onChange={(e) => setNam(+e.target.value)} style={{ width: 100 }} /></label>
        <button className="btn ghost" style={{ alignSelf: 'end' }} onClick={() => load().catch(() => {})}>Xem</button>
        <button className="btn" style={{ alignSelf: 'end' }} onClick={tinhThang}>⚙ Tính lương tháng {thang}/{nam}</button>
      </div>

      {loading ? <SkeletonTable rows={8} cols={8} /> : (
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th><th>Phòng ban</th>
              <th className="num">Lương công</th><th className="num">Phụ cấp</th><th className="num">Thưởng</th>
              <th className="num">BHXH</th><th className="num">Thuế</th><th className="num">Thực lĩnh</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.MABL}>
                <td><b>{r.HOTEN}</b></td><td>{r.TENPB}</td>
                <td className="num">{dinhDangTien(r.LUONGCOBAN)}</td>
                <td className="num">{dinhDangTien(r.TONGPHUCAP)}</td>
                <td className="num">{dinhDangTien(r.TONGTHUONG)}</td>
                <td className="num" style={{ color: '#dc2626' }}>-{dinhDangTien(r.BHXH)}</td>
                <td className="num" style={{ color: '#dc2626' }}>-{dinhDangTien(r.THUETNCN)}</td>
                <td className="num"><b style={{ color: '#16a34a' }}>{dinhDangTien(r.LUONGTHUCLINH)}</b></td>
                <td><button className="btn ghost small" onClick={() => setChitiet(r)}>Phiếu</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} style={{ color: '#64748b' }}>Chưa có bảng lương. Bấm "Tính lương tháng".</td></tr>}
          </tbody>
        </table>
      </div>
      )}

      <Modal open={!!chitiet} width={460} title={chitiet ? `🧾 Phiếu lương — ${chitiet.HOTEN}` : ''} onClose={() => setChitiet(null)}>
        {chitiet && (
          <div>
            <p style={{ color: '#64748b', marginBottom: 12 }}>Kỳ {chitiet.THANG}/{chitiet.NAM} · {chitiet.TENCV} · {chitiet.TENPB}</p>
            <Row k="Lương theo công" v={chitiet.LUONGCOBAN} />
            <Row k="Tăng ca" v={chitiet.LUONGTANGCA} />
            <Row k="Phụ cấp" v={chitiet.TONGPHUCAP} />
            <Row k="Thưởng" v={chitiet.TONGTHUONG} />
            <Row k="Thu nhập gộp" v={chitiet.THUNHAP_GOP} bold />
            <Row k="BHXH (10.5%)" v={-chitiet.BHXH} red />
            <Row k="Thuế TNCN" v={-chitiet.THUETNCN} red />
            <Row k="Khấu trừ khác" v={-chitiet.TONGKHAUTRU} red />
            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <Row k="THỰC LĨNH" v={chitiet.LUONGTHUCLINH} bold green />
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ k, v, bold, red, green }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '5px 0',
      fontWeight: bold ? 700 : 400, color: red ? '#dc2626' : green ? '#16a34a' : '#1e293b',
    }}>
      <span>{k}</span><span>{dinhDangTien(v)}</span>
    </div>
  );
}
