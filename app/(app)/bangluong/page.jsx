'use client';
import { useEffect, useState } from 'react';
import api, { dinhDangTien, kyHienTai, soNgayLamViec } from '@/lib/api';
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import Pagination from '@/components/Pagination';
import { SkeletonTable } from '@/components/Skeleton';

const KY = kyHienTai();
const PAGE_SIZE = 10;
// Hien tien neu da co du lieu, nguoc lai hien "--"
const tien = (v, co) => (co ? dinhDangTien(v) : <span style={{ color: '#94a3b8' }}>--</span>);

export default function BangLuong() {
  const [thang, setThang] = useState(KY.thang);
  const [nam, setNam] = useState(KY.nam);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const [chitiet, setChitiet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyTinh, setBusyTinh] = useState(false); // dang tinh luong
  const [busyCC, setBusyCC] = useState(false);     // dang luu cham cong
  const [page, setPage] = useState(1);
  const [chon, setChon] = useState(new Set());      // MANV duoc tick
  const [ccModal, setCcModal] = useState(false);    // modal cham cong
  const [cong, setCong] = useState({});             // { manv: so cong nhap }

  const congChuan = soNgayLamViec(thang, nam);       // so ngay lam viec T2-T6 cua thang dang xem

  const load = async () => {
    const { data } = await api.get(`/luong?thang=${thang}&nam=${nam}`);
    setRows(data); setChon(new Set()); setPage(1);
  };
  useEffect(() => { load().catch(() => {}).finally(() => setLoading(false)); }, []);
  const xem = async () => { setLoading(true); try { await load(); } catch {} finally { setLoading(false); } };

  const toggle = (manv) => {
    const s = new Set(chon);
    s.has(manv) ? s.delete(manv) : s.add(manv);
    setChon(s);
  };
  const toggleAll = () => setChon(chon.size === rows.length ? new Set() : new Set(rows.map((r) => r.MANV)));

  // Mo modal cham cong cho cac NV da tick (mac dinh = cong da co, neu chua co lay cong chuan cua thang)
  const moChamCong = () => {
    if (chon.size === 0) { setMsg({ t: 'err', m: 'Hãy tích chọn ít nhất 1 nhân viên để chấm công' }); return; }
    const init = {};
    rows.filter((r) => chon.has(r.MANV)).forEach((r) => {
      init[r.MANV] = r.SONGAYCONG != null ? r.SONGAYCONG : congChuan;
    });
    setCong(init); setCcModal(true);
  };

  const luuChamCong = async (e) => {
    e.preventDefault();
    if (busyCC) return;
    setBusyCC(true);
    try {
      const ds = rows.filter((r) => chon.has(r.MANV));
      for (const r of ds) {
        const sc = Number(cong[r.MANV]);
        const songhi = Math.max(congChuan - sc, 0);
        await api.post('/danhmuc/chamcong', {
          MANV: r.MANV, THANG: thang, NAM: nam,
          SONGAYCONG: sc, SONGAYNGHI: songhi, SOGIOTANGCA: r.SOGIOTANGCA || 0,
        });
      }
      setMsg({ t: 'ok', m: `Đã chấm công cho ${ds.length} nhân viên kỳ ${thang}/${nam}. Bấm "Tính lương" để cập nhật bảng lương.` });
      setCcModal(false); await load();
    } catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
    finally { setBusyCC(false); }
  };

  const tinhThang = async () => {
    if (busyTinh) return;
    setBusyTinh(true);
    setMsg({ t: 'ok', m: 'Đang tính lương...' });
    try {
      const { data } = await api.post('/luong/tinh-thang', { thang, nam });
      setMsg({ t: 'ok', m: `${data.message}. Thành công: ${data.thanhcong}, Lỗi: ${data.loi}` });
      await load();
    } catch (e) { setMsg({ t: 'err', m: e.response?.data?.error || e.message }); }
    finally { setBusyTinh(false); }
  };

  const allChecked = rows.length > 0 && chon.size === rows.length;
  const dsChon = rows.filter((r) => chon.has(r.MANV));
  const rowsTrang = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE); // dong hien thi trang hien tai

  return (
    <div>
      <div className="page-title">Bảng lương <small>Chấm công & tính lương kỳ {thang}/{nam}</small></div>
      {msg && <div className={`alert ${msg.t === 'ok' ? 'ok' : 'err'}`}>{msg.m}</div>}

      <div className="toolbar">
        <label className="field">Tháng
          <select value={thang} onChange={(e) => setThang(+e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="field">Năm<input type="number" value={nam} onChange={(e) => setNam(+e.target.value)} style={{ width: 100 }} /></label>
        <button className="btn ghost" style={{ alignSelf: 'end' }} onClick={xem} disabled={loading}>
          {loading && <Spinner />}Xem
        </button>
        <button className="btn" style={{ alignSelf: 'end' }} onClick={moChamCong} disabled={busyCC || busyTinh}>🗓 Chấm công ({chon.size})</button>
        <button className="btn" style={{ alignSelf: 'end' }} onClick={tinhThang} disabled={busyTinh}>
          {busyTinh && <Spinner />}⚙ Tính lương tháng {thang}/{nam}
        </button>
      </div>

      {loading ? <SkeletonTable rows={8} cols={9} /> : (
      <div className="card">
        <table>
          <thead>
            <tr>
              <th style={{ width: 34 }}><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
              <th>Nhân viên</th><th>Phòng ban</th><th className="num">Số công</th>
              <th className="num">Lương cơ bản</th><th className="num">Phụ cấp</th><th className="num">Thưởng</th>
              <th className="num">BHXH</th><th className="num">Thuế</th><th className="num">Thực lĩnh</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rowsTrang.map((r) => (
              <tr key={r.MANV}>
                <td><input type="checkbox" checked={chon.has(r.MANV)} onChange={() => toggle(r.MANV)} /></td>
                <td><b>{r.HOTEN}</b><br /><small style={{ color: '#64748b' }}>{r.TENCV}</small></td>
                <td>{r.TENPB || '--'}</td>
                <td className="num">{r.SONGAYCONG != null ? r.SONGAYCONG : <span style={{ color: '#94a3b8' }}>--</span>}</td>
                <td className="num">{dinhDangTien(r.LUONGCOBAN_GOC)}</td>
                <td className="num">{tien(r.TONGPHUCAP, r.DA_TINH)}</td>
                <td className="num">{tien(r.TONGTHUONG, r.DA_TINH)}</td>
                <td className="num" style={{ color: r.DA_TINH ? '#dc2626' : undefined }}>{r.DA_TINH ? '-' + dinhDangTien(r.BHXH) : <span style={{ color: '#94a3b8' }}>--</span>}</td>
                <td className="num" style={{ color: r.DA_TINH ? '#dc2626' : undefined }}>{r.DA_TINH ? '-' + dinhDangTien(r.THUETNCN) : <span style={{ color: '#94a3b8' }}>--</span>}</td>
                <td className="num"><b style={{ color: '#16a34a' }}>{tien(r.LUONGTHUCLINH, r.DA_TINH)}</b></td>
                <td><button className="btn ghost small" disabled={!r.DA_TINH} onClick={() => setChitiet(r)}>Phiếu</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={11} style={{ color: '#64748b' }}>Chưa có nhân viên đang làm việc.</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onChange={setPage} />
      </div>
      )}

      {/* Modal cham cong */}
      <Modal
        open={ccModal} width={560} title={`🗓 Chấm công kỳ ${thang}/${nam}`} onClose={() => setCcModal(false)}
        footer={
          <>
            <button type="button" className="btn ghost" onClick={() => setCcModal(false)} disabled={busyCC}>Hủy</button>
            <button type="submit" form="form-chamcong" className="btn" disabled={busyCC}>
              {busyCC && <Spinner />}Lưu chấm công ({dsChon.length})
            </button>
          </>
        }
      >
        <form id="form-chamcong" onSubmit={luuChamCong}>
          <p style={{ color: '#64748b', marginBottom: 12 }}>
            Số ngày làm việc chuẩn của tháng (Thứ 2 → Thứ 6): <b>{congChuan} ngày</b>.
            Nhập số ngày công thực tế đã đi làm của từng nhân viên (0 → {congChuan}).
          </p>
          <table>
            <thead><tr><th>Nhân viên</th><th>Phòng ban</th><th className="num" style={{ width: 130 }}>Số ngày công</th></tr></thead>
            <tbody>
              {dsChon.map((r) => (
                <tr key={r.MANV}>
                  <td><b>{r.HOTEN}</b></td><td>{r.TENPB || '--'}</td>
                  <td className="num">
                    <input type="number" min={0} max={congChuan} required style={{ width: 90, textAlign: 'right' }}
                      value={cong[r.MANV] ?? ''} onChange={(e) => setCong({ ...cong, [r.MANV]: e.target.value })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </Modal>

      {/* Modal phieu luong */}
      <Modal
        open={!!chitiet} width={460} title={chitiet ? `🧾 Phiếu lương — ${chitiet.HOTEN}` : ''}
        onClose={() => setChitiet(null)}
        footer={<button type="button" className="btn" onClick={() => setChitiet(null)}>Đóng</button>}
      >
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
