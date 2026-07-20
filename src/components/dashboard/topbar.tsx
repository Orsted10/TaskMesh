'use client';

import { Bell, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const { user, rpgProfile } = useAuth();
  const router = useRouter();
  const displayName = rpgProfile?.full_name || user?.user_metadata?.full_name || rpgProfile?.username || 'AGENT';

  return (
    <div className="h-20 w-full bg-white/50 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-900 sticky top-0 z-30 px-8 flex items-center justify-between">
      {/* Left side: Global Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-[#ff4655] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="QUERY GLOBAL MESH..."
            className="w-full bg-gray-100 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-zinc-600 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-[#ff4655]/50 focus:bg-zinc-900 transition-all font-mono text-xs uppercase tracking-widest"
          />
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-6">
        <ThemeToggle />
        <button className="relative text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff4655] rounded-full shadow-[0_0_10px_rgba(255,70,85,0.8)]" />
        </button>

        <div className="w-[1px] h-8 bg-gray-200 dark:bg-zinc-800" />

        <div onClick={() => router.push('/dashboard/profile')} className="flex items-center gap-4 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <div className="text-white font-bold text-sm tracking-wider uppercase group-hover:text-[#ff4655] transition-colors">{displayName}</div>
            <div className="text-zinc-500 text-[10px] font-mono uppercase">Level {rpgProfile?.level || 1} • {rpgProfile?.title || 'Novice'}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden group-hover:border-[#ff4655] transition-colors shadow-lg">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-zinc-400 group-hover:text-[#ff4655] transition-colors" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
