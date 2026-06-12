// lib/api.js - axios goi API noi bo Next (cung domain nen baseURL '/api')
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const dinhDangTien = (n) => (Number(n) || 0).toLocaleString('vi-VN') + ' đ';

export default api;
