'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function UserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const menuItems = [
    { label: 'Profile', href: '/admin/profile' },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'Billing', href: '/admin/billing' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="hidden md:block text-sm text-gray-300">
          {user?.name || user?.email?.split('@')[0]}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-20">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
