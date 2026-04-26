'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', href: '/admin' },
  { icon: 'auto_awesome', label: 'Generator', href: '/admin/generate' },
  { icon: 'photo_library', label: 'Gallery', href: '/admin/gallery' },
  { icon: 'psychology', label: 'Intelligence', href: '/admin/intelligence', disabled: true },
  { icon: 'explore', label: 'Features', href: '/admin/features' },
  { icon: 'model_training', label: 'Models', href: '/admin/models' },
  { icon: 'history', label: 'History', href: '/admin/history' },
  { icon: 'credit_card', label: 'Billing', href: '/admin/billing' },
  { icon: 'settings', label: 'Settings', href: '/admin/settings' },
];

export default function Sidebar({ active = 'Generator', isOpen = false, onClose }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside
      className={`
        h-screen w-64 lg:w-48 fixed left-0 top-0
        bg-[#1f0438]/95 backdrop-blur-3xl
        flex flex-col py-8 px-3 z-50
        overflow-y-auto border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Close button — mobile/tablet only */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-3 p-2 rounded-lg text-purple-300/50 hover:text-purple-100 transition-colors"
        aria-label="Close menu"
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      <div className="mb-10 px-2">
        <Link href="/admin" onClick={handleLinkClick}>
          <h1 className="text-xl font-bold tracking-tight text-[#d5baff] font-headline">Seredityfy AI</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-label text-purple-300/40 mt-1">Electric Precision</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = item.label === active;

          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-300/25 cursor-not-allowed select-none"
                title="Coming soon"
              >
                <span className="material-symbols-outlined opacity-40">{item.icon}</span>
                <span className="font-label flex-1">{item.label}</span>
                <span className="text-[8px] font-label font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-purple-300/30 uppercase tracking-widest">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleLinkClick}
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
          onClick={handleLinkClick}
          className="w-full bg-primary text-on-primary font-label font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Imagination
        </Link>
        <div className="space-y-1">
          <Link href="#" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-2 rounded-lg text-purple-300/50 hover:text-purple-100 font-label text-sm transition-all">
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
