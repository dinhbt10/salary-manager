// lib/views.js - Cac cau SELECT "view" dung lai o nhieu route
export const NV_VIEW = `
  SELECT nv.manv, nv.hoten, nv.gioitinh, nv.ngaysinh, nv.email, nv.dienthoai, nv.diachi,
         nv.ngayvaolam, nv.trangthai, nv.mapb, pb.tenpb, nv.macv, cv.tencv,
         cv.luongcoban, cv.hesoluong, (cv.luongcoban*cv.hesoluong)::int AS luong_theo_heso
  FROM nhanvien nv LEFT JOIN phongban pb ON nv.mapb=pb.mapb LEFT JOIN chucvu cv ON nv.macv=cv.macv`;

export const LUONG_VIEW = `
  SELECT bl.mabl, bl.manv, nv.hoten, pb.tenpb, cv.tencv, bl.thang, bl.nam,
         bl.luongcoban, bl.luongtangca, bl.tongphucap, bl.tongthuong,
         (bl.luongcoban+bl.luongtangca+bl.tongphucap+bl.tongthuong) AS thunhap_gop,
         bl.bhxh, bl.thuetncn, bl.tongkhautru, bl.luongthuclinh, bl.ngaytao
  FROM bangluong bl JOIN nhanvien nv ON bl.manv=nv.manv
       LEFT JOIN phongban pb ON nv.mapb=pb.mapb LEFT JOIN chucvu cv ON nv.macv=cv.macv`;
