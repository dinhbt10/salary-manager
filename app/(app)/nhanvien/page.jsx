'use client';
import { useEffect, useState } from 'react';
import api, { dinhDangTien } from '@/lib/api';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Spinner from '@/components/Spinner';
import Pagination from '@/components/Pagination';
import { SkeletonTable } from '@/components/Skeleton';

const empty = { HOTEN: '', GIOITINH: 'Nam', NGAYSINH: '', CMND: '', DIENTHOAI: '', EMAIL: '', DIACHI: '', MAPB: '', MACV: '', SOTAIKHOAN: '', TRANGTHAI: 'Dang lam' };
const TRANG_THAI = ['Dang lam', 'Tam nghi', 'Nghi viec'];
const PAGE_SIZE = 10;

export default function NhanVien() {
  const [list, setList] = useState([]);
  const [pb, setPb] = useState([]);
  const [cv, setCv] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null); // null = them moi
  const [show, setShow] = useState(false);
  const [xoaNv, setXoaNv] = useState(null);    // NV cho xac nhan xoa
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);     // dang luu (them/sua)
  const [busyDel, setBusyDel] = useState(false); // dang xoa
  const [page, setPage] = useState(1);

  const load = async () => {
    const [a, b, c] = await Promise.all([
      api.get('/nhanvien'), api.get('/danhmuc/phongban'), api.get('/danhmuc/chucvu'),
    ]);
    setList(a.data); setPb(b.data); setCv(c.data);
  };
  useEffect(() => { load().catch((e) => setMsg({ t: 'err', m: e.message })).finally(() => setLoading(false)); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const openAdd = () => { setForm(empty); setEditId(null); setShow(true); };
  const openEdit = (nv) => {
    setForm({
      HOTEN: nv.HOTEN || '', GIOITINH: nv.GIOITINH || 'Nam', NGAYSINH: nv.NGAYSINH || '', CMND: nv.CMND || '',
      DIENTHOAI: nv.DIENTHOAI || '', EMAIL: nv.EMAIL || '', DIACHI: nv.DIACHI || '',
      MAPB: nv.MAPB || '', MACV: nv.MACV || '', SOTAIKHOAN: nv.SOTAIKHOAN || '', TRANGTHAI: nv.TRANGTHAI || 'Dang lam',
    });
    setEditId(nv.MANV); setShow(true);
  };

  const luu = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const payload = { ...form, MAPB: +form.MAPB, MACV: +form.MACV };
      if (editId) { await api.put(`/nhanvien/${editId}`, payload); setMsg({ t: 'ok', m: 'Đã cập nhật nhân viên' }); }
      else { await api.post('/nhanvien', payload); setMsg({ t: 'ok', m: 'Đã thêm nhân viên' }); }
      setShow(false); await load();
    } catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
    finally { setBusy(false); }
  };

  const xacNhanXoa = async () => {
    setBusyDel(true);
    try { await api.delete(`/nhanvien/${xoaNv.MANV}`); setMsg({ t: 'ok', m: 'Đã xóa nhân viên' }); await load(); }
    catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
    finally { setBusyDel(false); setXoaNv(null); }
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
            {list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((nv) => (
              <tr key={nv.MANV}>
                <td>{nv.MANV}</td><td><b>{nv.HOTEN}</b><br /><small style={{ color: '#64748b' }}>{nv.EMAIL}</small></td>
                <td>{nv.TENPB}</td><td>{nv.TENCV}</td>
                <td className="num">{dinhDangTien(nv.LUONGCOBAN)}</td>
                <td><span className={`tag ${nv.TRANGTHAI === 'Dang lam' ? 'green' : 'gray'}`}>{nv.TRANGTHAI}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn ghost small" onClick={() => openEdit(nv)}>Sửa</button>
                  <button className="btn danger small" onClick={() => setXoaNv(nv)}>Xóa</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} style={{ color: '#64748b' }}>Chưa có nhân viên.</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={list.length} onChange={setPage} />
      </div>
      )}

      <Modal
        open={show} title={editId ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'} width={640}
        onClose={() => setShow(false)}
        footer={
          <>
            <button type="button" className="btn ghost" onClick={() => setShow(false)} disabled={busy}>Hủy</button>
            <button type="submit" form="form-nhanvien" className="btn" disabled={busy}>
              {busy && <Spinner />}{editId ? 'Lưu thay đổi' : 'Lưu nhân viên'}
            </button>
          </>
        }
      >
        <form id="form-nhanvien" onSubmit={luu} className="form-grid">
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
          {editId && (
            <label className="field">Trạng thái
              <select value={form.TRANGTHAI} onChange={set('TRANGTHAI')}>
                {TRANG_THAI.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          )}
          <label className="field full">Địa chỉ<input value={form.DIACHI} onChange={set('DIACHI')} /></label>
        </form>
      </Modal>

      <ConfirmModal
        open={!!xoaNv} danger busy={busyDel} title="Xóa nhân viên"
        message={xoaNv ? `Bạn chắc chắn muốn xóa nhân viên "${xoaNv.HOTEN}" (mã ${xoaNv.MANV})? Thao tác không thể hoàn tác.` : ''}
        confirmText="Xóa" onConfirm={xacNhanXoa} onClose={() => setXoaNv(null)}
      />
    </div>
  );
}
