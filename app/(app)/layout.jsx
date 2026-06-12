'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/', label: '📊 Tổng quan' },
  { href: '/nhanvien', label: '👥 Nhân viên' },
  { href: '/bangluong', label: '💰 Bảng lương' },
  { href: '/thuong', label: '🎁 Thưởng / Khấu trừ' },
  { href: '/baocao', label: '📈 Báo cáo' },
];

export default function AppLayout({ children }) {
  const [user, setUser] = useState(undefined); // undefined = đang kiểm tra
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const s = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!s) { setUser(null); router.replace('/login'); return; }
    setUser(JSON.parse(s));
  }, [router]);

  if (!user) return null; // chưa đăng nhập / đang kiểm tra -> không render

  const links = [...LINKS];
  if (user.VAITRO === 'ADMIN') links.push({ href: '/audit', label: '🛡️ Nhật ký (Audit)' });

  const logout = () => { localStorage.removeItem('user'); router.replace('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          QL <span>Lương Thưởng</span>
          <br /><small style={{ fontWeight: 400, fontSize: 11, color: '#64748b' }}>Next.js + Supabase</small>
        </div>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>{l.label}</Link>
        ))}
        <div className="role-badge">Đăng nhập: <b>{user.TENDANGNHAP}</b><br />Vai trò: <b>{user.VAITRO}</b></div>
        <button className="logout" onClick={logout}>Đăng xuất</button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
