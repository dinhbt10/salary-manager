'use client';
import { useEffect, useState } from 'react';
import api, { dinhDangTien } from '@/lib/api';
import Modal from '@/components/Modal';
import { SkeletonTable } from '@/components/Skeleton';

export default function ThuongKhauTru() {
  const [tab, setTab] = useState('thuong');
  const [thuong, setThuong] = useState([]);
  const [khautru, setKhautru] = useState([]);
  const [nv, setNv] = useState([]);
  const [form, setForm] = useState({ MANV: '', THANG: 5, NAM: 2026, LYDO: '', SOTIEN: '' });
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [a, b, c] = await Promise.all([
      api.get('/danhmuc/thuong'), api.get('/danhmuc/khautru'), api.get('/nhanvien'),
    ]);
    setThuong(a.data); setKhautru(b.data); setNv(c.data);
  };
  useEffect(() => { load().catch(() => {}).finally(() => setLoading(false)); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const openAdd = () => { setForm({ MANV: '', THANG: 5, NAM: 2026, LYDO: '', SOTIEN: '' }); setShow(true); };

  const them = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/danhmuc/${tab}`, {
        MANV: +form.MANV, THANG: +form.THANG, NAM: +form.NAM, LYDO: form.LYDO, SOTIEN: +form.SOTIEN,
      });
      setMsg({ t: 'ok', m: `Đã thêm ${tab === 'thuong' ? 'thưởng' : 'khấu trừ'}` });
      setShow(false); await load();
    } catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
  };

  const data = tab === 'thuong' ? thuong : khautru;
  const nhan = tab === 'thuong' ? 'thưởng' : 'khấu trừ';

  return (
    <div>
      <div className="page-title">Thưởng & Khấu trừ <small>Quản lý các khoản cộng/trừ theo tháng</small></div>
      {msg && <div className={`alert ${msg.t === 'ok' ? 'ok' : 'err'}`}>{msg.m}</div>}

      <div className="toolbar">
        <button className={`btn ${tab === 'thuong' ? '' : 'ghost'}`} onClick={() => setTab('thuong')}>🎁 Thưởng</button>
        <button className={`btn ${tab === 'khautru' ? '' : 'ghost'}`} onClick={() => setTab('khautru')}>➖ Khấu trừ</button>
        <button className="btn" style={{ marginLeft: 'auto' }} onClick={openAdd}>+ Thêm {nhan}</button>
      </div>

      {loading ? <SkeletonTable rows={6} cols={4} /> : (
      <div className="card">
        <table>
          <thead><tr><th>Nhân viên</th><th>Tháng/Năm</th><th>Lý do</th><th className="num">Số tiền</th></tr></thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.MATHUONG || r.MAKT}>
                <td>{r.HOTEN}</td><td>{r.THANG}/{r.NAM}</td><td>{r.LYDO}</td>
                <td className="num" style={{ color: tab === 'thuong' ? '#16a34a' : '#dc2626' }}>
                  {tab === 'thuong' ? '+' : '-'}{dinhDangTien(r.SOTIEN)}
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={4} style={{ color: '#64748b' }}>Chưa có dữ liệu.</td></tr>}
          </tbody>
        </table>
      </div>
      )}

      <Modal open={show} width={520} title={`Thêm khoản ${nhan}`} onClose={() => setShow(false)}>
        <form onSubmit={them} className="form-grid">
          <label className="field full">Nhân viên
            <select value={form.MANV} onChange={set('MANV')} required>
              <option value="">-- chọn --</option>
              {nv.map((n) => <option key={n.MANV} value={n.MANV}>{n.HOTEN}</option>)}
            </select>
          </label>
          <label className="field">Tháng<input type="number" value={form.THANG} onChange={set('THANG')} min={1} max={12} /></label>
          <label className="field">Năm<input type="number" value={form.NAM} onChange={set('NAM')} /></label>
          <label className="field full">Lý do<input value={form.LYDO} onChange={set('LYDO')} /></label>
          <label className="field full">Số tiền<input type="number" value={form.SOTIEN} onChange={set('SOTIEN')} required /></label>
          <div className="full" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost" onClick={() => setShow(false)}>Hủy</button>
            <button className="btn">Thêm {nhan}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
