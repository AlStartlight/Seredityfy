'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', href: '/admin' },
  { icon: 'auto_awesome', label: 'Generator', href: '/admin/generate' },
  { icon: 'photo_library', label: 'Gallery', href: '/admin/gallery' },
  { icon: 'model_training', label: 'Models', href: '/admin/models' },
  { icon: 'history', label: 'History', href: '/admin/history' },
  { icon: 'credit_card', label: 'Billing', href: '/admin/billing' },
  { icon: 'settings', label: 'Settings', href: '/admin/settings' },
];

export default function Sidebar({ active = 'Generator' }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  return (
    <aside className="h-screen w-48 fixed left-0 top-0 bg-[#1f0438]/70 backdrop-blur-3xl flex flex-col py-8 px-3 z-50 overflow-y-auto border-r border-white/5">
      <div className="mb-10 px-2">
        <Link href="/admin">
          <h1 className="text-xl font-bold tracking-tight text-[#d5baff] font-headline">Seredityfy AI</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-label text-purple-300/40 mt-1">Electric Precision</p>
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = item.label === active;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                isActive
                  ? 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#d5baff] font-bold border-r-2 border-[#d5baff] bg-white/5'
                  : 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-purple-300/60 font-medium hover:text-purple-100 hover:bg-white/10 group'
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-4 pt-8">
        <Link
          href="/admin/generate"
          className="w-full bg-primary text-on-primary font-label font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create New Image
        </Link>
        <div className="space-y-1">
          <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-purple-300/50 hover:text-purple-100 font-label text-sm transition-all">
            <span className="material-symbols-outlined text-[18px]">help</span>
            Help Center
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-purple-300/50 hover:text-red-400 font-label text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {isLoggingOut ? 'Signing out...' : 'Log Out'}
          </button>
        </div>
      </div>
    </aside>
  );
}
