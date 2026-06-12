// lib/seed.js - Tao bang + nap du lieu mau + tinh san luong 5/2026 (Postgres/Supabase)
import { getSql } from './db';
import { DROP_STATEMENTS, SCHEMA_STATEMENTS } from './schema';
import { computeAndStoreMonth } from './salary';

const PHONGBAN = [
  { tenpb: 'Ban Giám đốc', diadiem: 'Tầng 5' }, { tenpb: 'Phòng Kỹ thuật', diadiem: 'Tầng 3' },
  { tenpb: 'Phòng Kinh doanh', diadiem: 'Tầng 2' }, { tenpb: 'Phòng Nhân sự', diadiem: 'Tầng 1' },
  { tenpb: 'Phòng Kế toán', diadiem: 'Tầng 1' },
];
const CHUCVU = [
  { tencv: 'Giám đốc', luongcoban: 30000000, hesoluong: 3.0 },
  { tencv: 'Trưởng phòng', luongcoban: 18000000, hesoluong: 2.0 },
  { tencv: 'Trưởng nhóm', luongcoban: 14000000, hesoluong: 1.5 },
  { tencv: 'Nhân viên', luongcoban: 10000000, hesoluong: 1.0 },
  { tencv: 'Thực tập sinh', luongcoban: 5000000, hesoluong: 0.7 },
];
// [hoten, gioitinh, ngaysinh, email, dienthoai, diachi, ngayvaolam, mapb, macv]
const NV = [
  ['Nguyễn Văn An', 'Nam', '1980-05-12', 'an.nv@congty.com', '0901000001', 'Hà Nội', '2015-01-05', 1, 1],
  ['Trần Thị Bình', 'Nu', '1985-08-20', 'binh.tt@congty.com', '0901000002', 'Hà Nội', '2016-03-01', 2, 2],
  ['Lê Văn Cường', 'Nam', '1990-02-15', 'cuong.lv@congty.com', '0901000003', 'Bắc Ninh', '2018-06-10', 2, 3],
  ['Phạm Thị Dung', 'Nu', '1993-11-30', 'dung.pt@congty.com', '0901000004', 'Hà Nội', '2019-09-01', 2, 4],
  ['Hoàng Văn Em', 'Nam', '1995-07-07', 'em.hv@congty.com', '0901000005', 'Hải Phòng', '2020-01-15', 2, 4],
  ['Vũ Thị Phương', 'Nu', '1992-04-18', 'phuong.vt@congty.com', '0901000006', 'Hà Nội', '2017-08-20', 3, 2],
  ['Đặng Văn Giang', 'Nam', '1994-12-25', 'giang.dv@congty.com', '0901000007', 'Nam Định', '2021-02-01', 3, 4],
  ['Bùi Thị Hoa', 'Nu', '1996-06-09', 'hoa.bt@congty.com', '0901000008', 'Hà Nội', '2021-07-12', 3, 4],
  ['Đỗ Văn Khánh', 'Nam', '1991-03-03', 'khanh.dv@congty.com', '0901000009', 'Hà Nội', '2018-11-05', 4, 2],
  ['Ngô Thị Lan', 'Nu', '1997-10-22', 'lan.nt@congty.com', '0901000010', 'Hà Nội', '2022-03-01', 4, 4],
  ['Trịnh Văn Minh', 'Nam', '1989-09-14', 'minh.tv@congty.com', '0901000011', 'Hà Nội', '2016-05-09', 5, 2],
  ['Cao Thị Nga', 'Nu', '2000-01-01', 'nga.ct@congty.com', '0901000012', 'Hà Nội', '2023-09-01', 5, 5],
];
const PHUCAP = [
  { tenpc: 'Ăn trưa', sotien: 730000 }, { tenpc: 'Xăng xe', sotien: 500000 },
  { tenpc: 'Điện thoại', sotien: 300000 }, { tenpc: 'Trách nhiệm', sotien: 2000000 },
  { tenpc: 'Đi lại xa', sotien: 400000 },
];
// [manv, songaycong, songaynghi, sogiotangca]
const CHAMCONG = [
  [1, 26, 0, 0], [2, 26, 0, 8], [3, 25, 1, 12], [4, 26, 0, 10], [5, 24, 2, 5], [6, 26, 0, 4],
  [7, 26, 0, 15], [8, 23, 3, 0], [9, 26, 0, 6], [10, 26, 0, 0], [11, 26, 0, 2], [12, 22, 4, 0],
];
const THUONG = [
  { manv: 1, thang: 5, nam: 2026, lydo: 'Thưởng KPI quý', sotien: 10000000 },
  { manv: 3, thang: 5, nam: 2026, lydo: 'Hoàn thành dự án sớm', sotien: 5000000 },
  { manv: 7, thang: 5, nam: 2026, lydo: 'Vượt doanh số', sotien: 8000000 },
  { manv: 4, thang: 5, nam: 2026, lydo: 'Sáng kiến cải tiến', sotien: 2000000 },
];
const KHAUTRU = [
  { manv: 5, thang: 5, nam: 2026, lydo: 'Tạm ứng lương', sotien: 2000000 },
  { manv: 8, thang: 5, nam: 2026, lydo: 'Đi muộn nhiều lần', sotien: 500000 },
];
const APP_USER = [
  { tendangnhap: 'admin', matkhau: '123456', vaitro: 'ADMIN', manv: null },
  { tendangnhap: 'hr', matkhau: '123456', vaitro: 'HR', manv: 9 },
  { tendangnhap: 'an', matkhau: '123456', vaitro: 'EMPLOYEE', manv: 1 },
];

export async function resetAndSeed() {
  const sql = getSql();

  // Tao lai bang (1 round-trip, nhieu lenh DDL, khong tham so)
  await sql.unsafe([...DROP_STATEMENTS, ...SCHEMA_STATEMENTS].join(';\n'));

  // Nap du lieu (moi bang 1 cau insert nhieu dong)
  await sql`insert into phongban ${sql(PHONGBAN)}`;
  await sql`insert into chucvu ${sql(CHUCVU)}`;

  const nvRows = NV.map((r) => ({
    hoten: r[0], gioitinh: r[1], ngaysinh: r[2], email: r[3], dienthoai: r[4],
    diachi: r[5], ngayvaolam: r[6], mapb: r[7], macv: r[8], cmnd: '0010' + r[3],
    sotaikhoan: '111000' + (NV.indexOf(r) + 1),
  }));
  await sql`insert into nhanvien ${sql(nvRows)}`;
  await sql`insert into phucap ${sql(PHUCAP)}`;

  // Gan phu cap: ai cung an trua(1) + xang xe(2); chuc vu 1,2 them trach nhiem(4)
  const nvpc = [];
  NV.forEach((r, i) => {
    const manv = i + 1, macv = r[8];
    nvpc.push({ manv, mapc: 1 }, { manv, mapc: 2 });
    if (macv === 1 || macv === 2) nvpc.push({ manv, mapc: 4 });
  });
  await sql`insert into nhanvien_phucap ${sql(nvpc)}`;

  const ccRows = CHAMCONG.map((r) => ({ manv: r[0], thang: 5, nam: 2026, songaycong: r[1], songaynghi: r[2], sogiotangca: r[3] }));
  await sql`insert into chamcong ${sql(ccRows)}`;
  await sql`insert into thuong ${sql(THUONG)}`;
  await sql`insert into khautru ${sql(KHAUTRU)}`;
  await sql`insert into app_user ${sql(APP_USER)}`;

  // Tinh san luong thang 5/2026 -> dashboard co du lieu ngay
  const res = await computeAndStoreMonth(5, 2026);
  return res;
}
