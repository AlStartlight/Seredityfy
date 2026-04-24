'use client';

import { useState, useEffect } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="bg-background text-on-background font-body min-h-screen selection:bg-primary selection:text-on-primary">
      {/* Backdrop overlay — mobile/tablet only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar active={active} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar active={active} onMenuClick={() => setSidebarOpen(true)} />
      <div className="lg:ml-48">{children}</div>
    </div>
  );
}
