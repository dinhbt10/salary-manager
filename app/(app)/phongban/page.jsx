'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Spinner from '@/components/Spinner';
import Pagination from '@/components/Pagination';
import { SkeletonTable } from '@/components/Skeleton';

const empty = { TENPB: '', DIADIEM: '', MATRUONGPHONG: '' };
const PAGE_SIZE = 10;

export default function PhongBan() {
  const [list, setList] = useState([]);
  const [nv, setNv] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null); // null = them moi
  const [show, setShow] = useState(false);
  const [xoaPb, setXoaPb] = useState(null);    // PB cho xac nhan xoa
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyDel, setBusyDel] = useState(false);
  const [page, setPage] = useState(1);

  const load = async () => {
    const [a, b] = await Promise.all([api.get('/danhmuc/phongban'), api.get('/nhanvien')]);
    setList(a.data); setNv(b.data);
  };
  useEffect(() => { load().catch((e) => setMsg({ t: 'err', m: e.message })).finally(() => setLoading(false)); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const openAdd = () => { setForm(empty); setEditId(null); setShow(true); };
  const openEdit = (p) => {
    setForm({ TENPB: p.TENPB || '', DIADIEM: p.DIADIEM || '', MATRUONGPHONG: p.MATRUONGPHONG || '' });
    setEditId(p.MAPB); setShow(true);
  };

  const luu = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (editId) await api.put(`/danhmuc/phongban/${editId}`, form);
      else await api.post('/danhmuc/phongban', form);
      setMsg({ t: 'ok', m: editId ? 'Đã cập nhật phòng ban' : 'Đã thêm phòng ban' });
      setShow(false); await load();
    } catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
    finally { setBusy(false); }
  };

  const xacNhanXoa = async () => {
    setBusyDel(true);
    try { await api.delete(`/danhmuc/phongban/${xoaPb.MAPB}`); setMsg({ t: 'ok', m: 'Đã xóa phòng ban' }); await load(); }
    catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
    finally { setBusyDel(false); setXoaPb(null); }
  };

  // Trưởng phòng chỉ chọn trong nhân viên CÙNG phòng ban + chưa làm trưởng phòng nơi khác (quan hệ 1-1)
  const truongPhongNoiKhac = new Set(
    list.filter((p) => p.MAPB !== editId && p.MATRUONGPHONG != null).map((p) => Number(p.MATRUONGPHONG)));
  const ungVienTP = editId
    ? nv.filter((n) => Number(n.MAPB) === Number(editId) && !truongPhongNoiKhac.has(Number(n.MANV)))
    : [];

  return (
    <div>
      <div className="page-title">Quản lý phòng ban <small>Phòng ban & trưởng phòng (liên kết nhân viên)</small></div>
      {msg && <div className={`alert ${msg.t === 'ok' ? 'ok' : 'err'}`}>{msg.m}</div>}

      <div className="toolbar">
        <button className="btn" onClick={openAdd}>+ Thêm phòng ban</button>
      </div>

      {loading ? <SkeletonTable rows={6} cols={5} /> : (
      <div className="card">
        <table>
          <thead>
            <tr><th>Mã</th><th>Tên phòng ban</th><th>Địa điểm</th><th>Trưởng phòng</th><th className="num">Số NV</th><th></th></tr>
          </thead>
          <tbody>
            {list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((p) => (
              <tr key={p.MAPB}>
                <td>{p.MAPB}</td><td><b>{p.TENPB}</b></td><td>{p.DIADIEM || '--'}</td>
                <td>{p.TENTRUONGPHONG || <span style={{ color: '#94a3b8' }}>Chưa có</span>}</td>
                <td className="num">{p.SONGUOI}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn ghost small" onClick={() => openEdit(p)}>Sửa</button>
                  <button className="btn danger small" onClick={() => setXoaPb(p)}>Xóa</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} style={{ color: '#64748b' }}>Chưa có phòng ban.</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={list.length} onChange={setPage} />
      </div>
      )}

      <Modal
        open={show} width={520} title={editId ? 'Sửa phòng ban' : 'Thêm phòng ban mới'}
        onClose={() => setShow(false)}
        footer={
          <>
            <button type="button" className="btn ghost" onClick={() => setShow(false)} disabled={busy}>Hủy</button>
            <button type="submit" form="form-phongban" className="btn" disabled={busy}>
              {busy && <Spinner />}{editId ? 'Lưu thay đổi' : 'Lưu phòng ban'}
            </button>
          </>
        }
      >
        <form id="form-phongban" onSubmit={luu} className="form-grid">
          <label className="field full">Tên phòng ban<input value={form.TENPB} onChange={set('TENPB')} required /></label>
          <label className="field full">Địa điểm<input value={form.DIADIEM} onChange={set('DIADIEM')} placeholder="VD: Tầng 3" /></label>
          <label className="field full">Trưởng phòng
            <select value={form.MATRUONGPHONG} onChange={set('MATRUONGPHONG')} disabled={!editId}>
              <option value="">-- chưa chỉ định --</option>
              {ungVienTP.map((n) => <option key={n.MANV} value={n.MANV}>{n.HOTEN} ({n.TENCV || 'NV'})</option>)}
            </select>
            {!editId
              ? <small style={{ color: '#94a3b8' }}>Lưu phòng ban trước, gán nhân viên vào phòng, rồi mới chọn trưởng phòng.</small>
              : ungVienTP.length === 0
                ? <small style={{ color: '#94a3b8' }}>Phòng chưa có nhân viên đủ điều kiện (phải thuộc phòng & chưa làm trưởng phòng khác).</small>
                : null}
          </label>
        </form>
      </Modal>

      <ConfirmModal
        open={!!xoaPb} danger busy={busyDel} title="Xóa phòng ban"
        message={xoaPb ? `Bạn chắc chắn muốn xóa phòng ban "${xoaPb.TENPB}"?${xoaPb.SONGUOI > 0 ? ` Phòng đang có ${xoaPb.SONGUOI} nhân viên — hệ thống sẽ chặn nếu chưa chuyển hết.` : ''}` : ''}
        confirmText="Xóa" onConfirm={xacNhanXoa} onClose={() => setXoaPb(null)}
      />
    </div>
  );
}
