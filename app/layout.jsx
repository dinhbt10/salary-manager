import './globals.css';

export const metadata = {
  title: 'QL Lương Thưởng | Next.js + Supabase',
  description: 'Hệ thống quản lý lương thưởng nhân viên',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
