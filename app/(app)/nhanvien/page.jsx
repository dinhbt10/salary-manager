'use client';
import { useEffect, useState } from 'react';
import api, { dinhDangTien } from '@/lib/api';
import Modal from '@/components/Modal';
import { SkeletonTable } from '@/components/Skeleton';

const empty = { HOTEN: '', GIOITINH: 'Nam', NGAYSINH: '', CMND: '', DIENTHOAI: '', EMAIL: '', DIACHI: '', MAPB: '', MACV: '', SOTAIKHOAN: '' };

export default function NhanVien() {
  const [list, setList] = useState([]);
  const [pb, setPb] = useState([]);
  const [cv, setCv] = useState([]);
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [a, b, c] = await Promise.all([
      api.get('/nhanvien'), api.get('/danhmuc/phongban'), api.get('/danhmuc/chucvu'),
    ]);
    setList(a.data); setPb(b.data); setCv(c.data);
  };
  useEffect(() => { load().catch((e) => setMsg({ t: 'err', m: e.message })).finally(() => setLoading(false)); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const openAdd = () => { setForm(empty); setShow(true); };

  const them = async (e) => {
    e.preventDefault();
    try {
      await api.post('/nhanvien', { ...form, MAPB: +form.MAPB, MACV: +form.MACV });
      setMsg({ t: 'ok', m: 'Đã thêm nhân viên' }); setShow(false); await load();
    } catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
  };

  const xoa = async (id) => {
    if (!confirm('Xóa nhân viên này?')) return;
    try { await api.delete(`/nhanvien/${id}`); await load(); }
    catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
  };

  return (
    <div>
      <div className="page-title">Quản lý nhân viên <small>Danh sách & hồ sơ nhân viên</small></div>
      {msg && <div className={`alert ${msg.t === 'ok' ? 'ok' : 'err'}`}>{msg.m}</div>}

      <div className="toolbar">
        <button className="btn" onClick={openAdd}>+ Thêm nhân viên</button>
      </div>

      {loading ? <SkeletonTable rows={8} cols={6} /> : (
      <div className="card">
        <table>
          <thead>
            <tr><th>Mã</th><th>Họ tên</th><th>Phòng ban</th><th>Chức vụ</th><th className="num">Lương CB</th><th>Trạng thái</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((nv) => (
              <tr key={nv.MANV}>
                <td>{nv.MANV}</td><td><b>{nv.HOTEN}</b><br /><small style={{ color: '#64748b' }}>{nv.EMAIL}</small></td>
                <td>{nv.TENPB}</td><td>{nv.TENCV}</td>
                <td className="num">{dinhDangTien(nv.LUONGCOBAN)}</td>
                <td><span className={`tag ${nv.TRANGTHAI === 'Dang lam' ? 'green' : 'gray'}`}>{nv.TRANGTHAI}</span></td>
                <td><button className="btn danger small" onClick={() => xoa(nv.MANV)}>Xóa</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <Modal open={show} title="Thêm nhân viên mới" width={640} onClose={() => setShow(false)}>
        <form onSubmit={them} className="form-grid">
          <label className="field">Họ tên<input value={form.HOTEN} onChange={set('HOTEN')} required /></label>
          <label className="field">Giới tính
            <select value={form.GIOITINH} onChange={set('GIOITINH')}><option>Nam</option><option>Nu</option></select>
          </label>
          <label className="field">Ngày sinh<input type="date" value={form.NGAYSINH} onChange={set('NGAYSINH')} /></label>
          <label className="field">CMND/CCCD<input value={form.CMND} onChange={set('CMND')} /></label>
          <label className="field">Điện thoại<input value={form.DIENTHOAI} onChange={set('DIENTHOAI')} /></label>
          <label className="field">Email<input value={form.EMAIL} onChange={set('EMAIL')} /></label>
          <label className="field">Phòng ban
            <select value={form.MAPB} onChange={set('MAPB')} required>
              <option value="">-- chọn --</option>
              {pb.map((p) => <option key={p.MAPB} value={p.MAPB}>{p.TENPB}</option>)}
            </select>
          </label>
          <label className="field">Chức vụ
            <select value={form.MACV} onChange={set('MACV')} required>
              <option value="">-- chọn --</option>
              {cv.map((c) => <option key={c.MACV} value={c.MACV}>{c.TENCV}</option>)}
            </select>
          </label>
          <label className="field">Số tài khoản<input value={form.SOTAIKHOAN} onChange={set('SOTAIKHOAN')} /></label>
          <label className="field full">Địa chỉ<input value={form.DIACHI} onChange={set('DIACHI')} /></label>
          <div className="full" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost" onClick={() => setShow(false)}>Hủy</button>
            <button className="btn">Lưu nhân viên</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
