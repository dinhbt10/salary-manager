'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
  const [tendangnhap, setU] = useState('admin');
  const [matkhau, setP] = useState('123456');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { tendangnhap, matkhau });
      localStorage.setItem('user', JSON.stringify(data.user));
      router.replace('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Không đăng nhập được (kiểm tra DB / biến môi trường)');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={submit}>
        <h1>Quản lý Lương Thưởng</h1>
        <p className="sub">Hệ thống nhân sự — Next.js + Supabase</p>
        {err && <div className="error-msg">⚠ {err}</div>}
        <div className="field">
          <label className="field">Tên đăng nhập
            <input value={tendangnhap} onChange={(e) => setU(e.target.value)} placeholder="admin" />
          </label>
        </div>
        <div className="field">
          <label className="field">Mật khẩu
            <input type="password" value={matkhau} onChange={(e) => setP(e.target.value)} placeholder="••••••" />
          </label>
        </div>
        <button className="btn" disabled={loading}>{loading && <Spinner />}{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        <div className="login-hint">
          <b>Tài khoản demo:</b><br />
          • admin / 123456 (toàn quyền)<br />
          • hr / 123456 (nhân sự)<br />
          • an / 123456 (nhân viên)
        </div>
      </form>
    </div>
  );
}
