'use client';

import Sidebar from '@/src/components/ui/Sidebar';
import TopBar from '@/src/components/ui/TopBar';
import { usePathname } from 'next/navigation';

function labelFromPath(pathname) {
  if (!pathname) return 'Generator';
  if (pathname.startsWith('/admin/generate')) return 'Generator';
  if (pathname.startsWith('/admin/gallery')) return 'Gallery';
  if (pathname.startsWith('/admin/compare')) return 'Gallery';
  if (pathname.startsWith('/admin/models')) return 'Models';
  if (pathname.startsWith('/admin/history')) return 'History';
  if (pathname.startsWith('/admin/billing')) return 'Billing';
  if (pathname.startsWith('/admin/settings')) return 'Settings';
  if (pathname.startsWith('/admin/profile')) return 'Dashboard';
  return 'Dashboard';
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const active = labelFromPath(pathname);

  return (
    <div className="bg-background text-on-background font-body min-h-screen selection:bg-primary selection:text-on-primary">
      <Sidebar active={active} />
      <TopBar active={active} />
      <div className="ml-64">{children}</div>
    </div>
  );
}
