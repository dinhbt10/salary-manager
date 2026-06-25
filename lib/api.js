// lib/api.js - axios goi API noi bo Next (cung domain nen baseURL '/api')
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const dinhDangTien = (n) => (Number(n) || 0).toLocaleString('vi-VN') + ' đ';

// Ky luong mac dinh = thang/nam hien tai (KHONG fix cung). Dung cho mac dinh cac trang.
export const kyHienTai = () => {
  const d = new Date();
  return { thang: d.getMonth() + 1, nam: d.getFullYear() };
};

// So ngay lam viec (Thu 2 -> Thu 6) trong 1 thang/nam => so cong chuan toi da cua thang.
// Tinh theo lich that, KHONG fix cung. getDay(): 0=CN, 6=Thu7 -> loai 2 ngay cuoi tuan.
export const soNgayLamViec = (thang, nam) => {
  const songay = new Date(nam, thang, 0).getDate(); // ngay cuoi cung cua thang
  let dem = 0;
  for (let d = 1; d <= songay; d++) {
    const thu = new Date(nam, thang - 1, d).getDay();
    if (thu !== 0 && thu !== 6) dem++;
  }
  return dem;
};

export default api;
