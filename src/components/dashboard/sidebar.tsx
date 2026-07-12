'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Crosshair, Activity, Target, Zap, ShieldAlert, Settings, LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { name: 'Command Center', path: '/dashboard', icon: Crosshair },
  { name: 'Active Operations', path: '/dashboard/operations', icon: Activity },
  { name: 'Global Intel', path: '/dashboard/intel', icon: Target },
  { name: 'The Arsenal', path: '/dashboard/arsenal', icon: Zap },
  { name: 'Guilds', path: '/dashboard/guilds', icon: ShieldAlert },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully.');
    router.push('/');
  };

  return (
    <div className="w-[280px] h-screen bg-gray-50 dark:bg-zinc-950/80 border-r border-gray-200 dark:border-zinc-900 flex flex-col relative z-20 transition-colors duration-300">
      <div className="p-8 pb-4">
        <Link href="/" className="inline-block group cursor-pointer relative z-20">
          <div className="absolute -inset-2 bg-[#ff4655]/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500 rounded-full" />
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:scale-110 transition-transform duration-300">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ff4655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#ff4655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#ff4655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-teko text-3xl font-bold tracking-widest text-zinc-900 dark:text-white group-hover:text-[#ff4655] dark:group-hover:text-[#ff4655] transition-colors">
              TASK<span className="text-[#ff4655] group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">MESH</span>
            </span>
          </div>
        </Link>
        <div className="mt-8 mb-4 h-[1px] bg-gradient-to-r from-[#ff4655]/50 to-transparent" />
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path}>
              <div
                className={`relative flex items-center gap-4 px-4 py-3 rounded-lg group transition-all duration-300 overflow-hidden ${
                  isActive ? 'bg-[#ff4655]/10 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-zinc-900/50'
                }`}
              >
                {/* Active Indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-[#ff4655] transition-all duration-300 shadow-[0_0_10px_rgba(255,70,85,0.8)] ${isActive ? 'opacity-100 h-full' : 'opacity-0 h-0 group-hover:opacity-50 group-hover:h-full'}`} />
                
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-[#ff4655]' : 'group-hover:text-[#ff4655] group-hover:scale-110'}`} />
                <span className="font-teko text-xl uppercase tracking-widest mt-1">
                  {item.name}
                </span>
                
                {/* Glitch Overlay on Hover */}
                {!isActive && (
                  <div className="absolute inset-0 bg-[#ff4655]/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out pointer-events-none" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-zinc-900">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-lg text-zinc-500 hover:text-[#ff4655] hover:bg-gray-200/50 dark:hover:bg-zinc-900/50 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-teko text-xl uppercase tracking-widest mt-1">Terminate Session</span>
        </button>
      </div>
    </div>
  );
}
