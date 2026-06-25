'use client';
import { useEffect, useState } from 'react';
import api, { dinhDangTien, kyHienTai } from '@/lib/api';
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import Pagination from '@/components/Pagination';
import { SkeletonTable } from '@/components/Skeleton';

const KY = kyHienTai();
const PAGE_SIZE = 10;

export default function ThuongKhauTru() {
  const [tab, setTab] = useState('thuong');
  const [thuong, setThuong] = useState([]);
  const [khautru, setKhautru] = useState([]);
  const [nv, setNv] = useState([]);
  const [form, setForm] = useState({ MANV: '', THANG: KY.thang, NAM: KY.nam, LYDO: '', SOTIEN: '' });
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);

  const load = async () => {
    const [a, b, c] = await Promise.all([
      api.get('/danhmuc/thuong'), api.get('/danhmuc/khautru'), api.get('/nhanvien'),
    ]);
    setThuong(a.data); setKhautru(b.data); setNv(c.data);
  };
  useEffect(() => { load().catch(() => {}).finally(() => setLoading(false)); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const openAdd = () => { setForm({ MANV: '', THANG: KY.thang, NAM: KY.nam, LYDO: '', SOTIEN: '' }); setShow(true); };

  const them = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.post(`/danhmuc/${tab}`, {
        MANV: +form.MANV, THANG: +form.THANG, NAM: +form.NAM, LYDO: form.LYDO, SOTIEN: +form.SOTIEN,
      });
      setMsg({ t: 'ok', m: `Đã thêm ${tab === 'thuong' ? 'thưởng' : 'khấu trừ'}` });
      setShow(false); await load();
    } catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
    finally { setBusy(false); }
  };

  const doiTab = (t) => { setTab(t); setPage(1); };
  const data = tab === 'thuong' ? thuong : khautru;
  const nhan = tab === 'thuong' ? 'thưởng' : 'khấu trừ';
  const dataTrang = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-title">Thưởng & Khấu trừ <small>Quản lý các khoản cộng/trừ theo tháng</small></div>
      {msg && <div className={`alert ${msg.t === 'ok' ? 'ok' : 'err'}`}>{msg.m}</div>}

      <div className="toolbar">
        <button className={`btn ${tab === 'thuong' ? '' : 'ghost'}`} onClick={() => doiTab('thuong')}>🎁 Thưởng</button>
        <button className={`btn ${tab === 'khautru' ? '' : 'ghost'}`} onClick={() => doiTab('khautru')}>➖ Khấu trừ</button>
        <button className="btn" style={{ marginLeft: 'auto' }} onClick={openAdd}>+ Thêm {nhan}</button>
      </div>

      {loading ? <SkeletonTable rows={6} cols={4} /> : (
      <div className="card">
        <table>
          <thead><tr><th>Nhân viên</th><th>Tháng/Năm</th><th>Lý do</th><th className="num">Số tiền</th></tr></thead>
          <tbody>
            {dataTrang.map((r) => (
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
        <Pagination page={page} pageSize={PAGE_SIZE} total={data.length} onChange={setPage} />
      </div>
      )}

      <Modal
        open={show} width={520} title={`Thêm khoản ${nhan}`} onClose={() => setShow(false)}
        footer={
          <>
            <button type="button" className="btn ghost" onClick={() => setShow(false)} disabled={busy}>Hủy</button>
            <button type="submit" form="form-thuong" className="btn" disabled={busy}>
              {busy && <Spinner />}Thêm {nhan}
            </button>
          </>
        }
      >
        <form id="form-thuong" onSubmit={them} className="form-grid">
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
        </form>
      </Modal>
    </div>
  );
}
