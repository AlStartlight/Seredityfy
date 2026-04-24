import Link from 'next/link';

export default function TopBar({ searchPlaceholder = 'Search prompts...', active = '', onMenuClick }) {
  return (
    <header className="flex justify-between items-center w-full px-4 lg:px-8 h-16 lg:h-20 lg:ml-48 lg:max-w-[calc(100%-12rem)] sticky top-0 z-40 bg-[#1f0438]/70 backdrop-blur-3xl shadow-2xl shadow-purple-900/20 transition-all">
      <div className="flex items-center gap-3 lg:gap-8">
        {/* Hamburger — mobile/tablet only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 text-purple-200/70 hover:text-[#d5baff] transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="relative group hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-purple-300/40">search</span>
          <input
            className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/50 w-48 lg:w-64 transition-all"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          <Link
            href="/admin/models"
            className={
              active === 'Models'
                ? 'text-[#d5baff] border-b-2 border-[#ffabf3] pb-1 font-label text-sm font-medium'
                : 'text-purple-200/70 hover:text-[#d5baff] font-label text-sm transition-opacity'
            }
          >
            Models
          </Link>
          <Link href="#" className="text-purple-200/70 hover:text-[#d5baff] font-label text-sm transition-opacity">API</Link>
          <Link href="/admin/gallery" className="text-purple-200/70 hover:text-[#d5baff] font-label text-sm transition-opacity">Community</Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        <div className="flex items-center gap-2 lg:gap-3">
          <button className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center text-purple-200/70 hover:text-[#d5baff] transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
          <Link
            href="/admin/history"
            className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center text-purple-200/70 hover:text-[#d5baff] transition-colors"
          >
            <span className="material-symbols-outlined">history</span>
          </Link>
        </div>
        <Link href="/admin/profile" className="h-9 w-9 lg:h-10 lg:w-10 rounded-full overflow-hidden border border-primary/20 bg-surface-container-highest block shrink-0">
          <img
            alt="User profile"
            className="w-full h-full object-cover"
            src="/assets/zenai.jpg"
          />
        </Link>
      </div>
    </header>
  );
}
