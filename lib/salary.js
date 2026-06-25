// lib/salary.js - Logic tinh luong (port tu PL/SQL Oracle sang JS)
import { getSql, q, q1, run } from './db';
import { addAudit } from './audit';

// So ngay lam viec chuan (Thu 2 -> Thu 6) cua 1 thang => MAU SO tinh luong ngay.
// Tinh theo lich that, KHONG fix cung 26. (Khop helper soNgayLamViec ben lib/api.js cho UI.)
export function soNgayCongChuan(thang, nam) {
  const songay = new Date(nam, thang, 0).getDate(); // ngay cuoi cung cua thang
  let dem = 0;
  for (let d = 1; d <= songay; d++) {
    const thu = new Date(nam, thang - 1, d).getDay(); // 0=CN, 6=Thu7
    if (thu !== 0 && thu !== 6) dem++;
  }
  return dem;
}

// Thue TNCN theo bac (tai lieu moi): Thue = (Thu nhap gop - BHXH) * Thue suat.
// Suat phang theo khoang thu nhap tinh thue (KHONG luy tien tung phan, KHONG giam tru ban than).
export function tinhThueTNCN(thuNhapTinhThue) {
  const v = thuNhapTinhThue > 0 ? thuNhapTinhThue : 0;
  let suat;
  if (v <= 10000000) suat = 0;           // Den 10 trieu: KHONG dong thue
  else if (v <= 30000000) suat = 0.10;   // Tren 10 - 30 trieu
  else if (v <= 60000000) suat = 0.20;   // Tren 30 - 60 trieu
  else if (v <= 100000000) suat = 0.30;  // Tren 60 - 100 trieu
  else suat = 0.35;                       // Tren 100 trieu
  return Math.round(v * suat);
}

// Cong thuc tinh thuan (khong dung DB) - dung chung cho seed va tinh runtime.
// ngayCongChuan = mau so (so ngay lam viec T2-T6 cua thang); songaycong = so ngay thuc di lam.
export function computeBreakdown({ luongcoban, hesoluong, songaycong, sogiotangca, tongphucap, tongthuong, tongkhautru, ngayCongChuan }) {
  const mauSo = ngayCongChuan > 0 ? ngayCongChuan : 1; // tranh chia 0
  const luongNgay = Math.round(luongcoban * hesoluong / mauSo);
  const luongCong = Math.round(luongNgay * songaycong);       // luong thang theo so ngay thuc di lam
  const luongTangca = Math.round(luongNgay / 8 * sogiotangca * 1.5);
  const gross = luongCong + luongTangca + tongphucap + tongthuong;
  const bhxh = Math.round(luongcoban * hesoluong * 0.105);
  const tnThue = Math.max(gross - bhxh, 0);                    // thu nhap tinh thue = gross - BHXH
  const thue = tinhThueTNCN(tnThue);
  const net = gross - bhxh - thue - tongkhautru;
  return { luongCong, luongTangca, bhxh, thue, net };
}

// Tinh luong CA CONG TY trong 1 ky - toi uu (it round-trip), dung cho seed va nut "Tinh luong"
export async function computeAndStoreMonth(thang, nam) {
  const sql = getSql();
  const emps = await q(`SELECT nv.manv, cv.luongcoban, cv.hesoluong
                          FROM nhanvien nv JOIN chucvu cv ON nv.macv=cv.macv
                         WHERE nv.trangthai='Dang lam'`);
  const cc = await q(`SELECT manv, songaycong, sogiotangca FROM chamcong WHERE thang=$1 AND nam=$2`, [thang, nam]);
  const pc = await q(`SELECT nvpc.manv, COALESCE(SUM(pc.sotien),0)::int AS tong
                        FROM nhanvien_phucap nvpc JOIN phucap pc ON nvpc.mapc=pc.mapc GROUP BY nvpc.manv`);
  const th = await q(`SELECT manv, COALESCE(SUM(sotien),0)::int AS tong FROM thuong WHERE thang=$1 AND nam=$2 GROUP BY manv`, [thang, nam]);
  const kt = await q(`SELECT manv, COALESCE(SUM(sotien),0)::int AS tong FROM khautru WHERE thang=$1 AND nam=$2 GROUP BY manv`, [thang, nam]);

  const ccMap = new Map(cc.map((r) => [r.MANV, r]));
  const pcMap = new Map(pc.map((r) => [r.MANV, r.TONG]));
  const thMap = new Map(th.map((r) => [r.MANV, r.TONG]));
  const ktMap = new Map(kt.map((r) => [r.MANV, r.TONG]));

  await run(`DELETE FROM bangluong WHERE thang=$1 AND nam=$2`, [thang, nam]);

  const ngayCongChuan = soNgayCongChuan(thang, nam); // mau so chung cho ca ky
  const ngaytao = new Date().toISOString().slice(0, 10);
  const rows = [];
  let ok = 0, loi = 0;
  for (const e of emps) {
    const c = ccMap.get(e.MANV);
    if (!c) { loi++; continue; }
    const tongphucap = pcMap.get(e.MANV) || 0;
    const tongthuong = thMap.get(e.MANV) || 0;
    const tongkhautru = ktMap.get(e.MANV) || 0;
    const b = computeBreakdown({
      luongcoban: e.LUONGCOBAN, hesoluong: e.HESOLUONG,
      songaycong: c.SONGAYCONG, sogiotangca: c.SOGIOTANGCA, tongphucap, tongthuong, tongkhautru, ngayCongChuan,
    });
    rows.push({
      manv: e.MANV, thang, nam, luongcoban: b.luongCong, tongphucap, tongthuong,
      luongtangca: b.luongTangca, bhxh: b.bhxh, thuetncn: b.thue, tongkhautru,
      luongthuclinh: b.net, ngaytao,
    });
    ok++;
  }
  if (rows.length) {
    await sql`insert into bangluong ${sql(rows)}`;
    const thoigian = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const aud = rows.map((r) => ({
      tenbang: 'BANGLUONG', hanhdong: 'INSERT', khoachinh: String(r.manv),
      nguoithuchien: 'SYSTEM', thoigian,
      noidung: `Tinh luong NV ${r.manv} thang ${thang}/${nam} = ${r.luongthuclinh}`,
    }));
    await sql`insert into audit_log ${sql(aud)}`;
  }
  return { ok, loi };
}

// Tinh luong 1 nhan vien (cho nut tinh rieng tung nguoi)
export async function tinhLuongNhanVien(manv, thang, nam) {
  const c = await q1(`SELECT songaycong, sogiotangca FROM chamcong WHERE manv=$1 AND thang=$2 AND nam=$3`, [manv, thang, nam]);
  if (!c) throw new Error(`Nhân viên ${manv} chưa chấm công tháng ${thang}/${nam}`);
  const e = await q1(`SELECT cv.luongcoban, cv.hesoluong FROM nhanvien nv JOIN chucvu cv ON nv.macv=cv.macv WHERE nv.manv=$1`, [manv]);
  if (!e) throw new Error(`Không thấy nhân viên ${manv}`);
  const tongphucap = (await q1(`SELECT COALESCE(SUM(pc.sotien),0)::int AS tong FROM nhanvien_phucap nvpc JOIN phucap pc ON nvpc.mapc=pc.mapc WHERE nvpc.manv=$1`, [manv])).TONG;
  const tongthuong = (await q1(`SELECT COALESCE(SUM(sotien),0)::int AS tong FROM thuong WHERE manv=$1 AND thang=$2 AND nam=$3`, [manv, thang, nam])).TONG;
  const tongkhautru = (await q1(`SELECT COALESCE(SUM(sotien),0)::int AS tong FROM khautru WHERE manv=$1 AND thang=$2 AND nam=$3`, [manv, thang, nam])).TONG;
  const b = computeBreakdown({
    luongcoban: e.LUONGCOBAN, hesoluong: e.HESOLUONG,
    songaycong: c.SONGAYCONG, sogiotangca: c.SOGIOTANGCA, tongphucap, tongthuong, tongkhautru,
    ngayCongChuan: soNgayCongChuan(thang, nam),
  });
  await run(`DELETE FROM bangluong WHERE manv=$1 AND thang=$2 AND nam=$3`, [manv, thang, nam]);
  await run(
    `INSERT INTO bangluong (manv, thang, nam, luongcoban, tongphucap, tongthuong, luongtangca, bhxh, thuetncn, tongkhautru, luongthuclinh, ngaytao)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [manv, thang, nam, b.luongCong, tongphucap, tongthuong, b.luongTangca, b.bhxh, b.thue, tongkhautru, b.net, new Date().toISOString().slice(0, 10)]
  );
  await addAudit('BANGLUONG', 'INSERT', manv, `Tinh luong NV ${manv} thang ${thang}/${nam} = ${b.net}`);
  return b.net;
}
