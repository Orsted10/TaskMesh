import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { GeometricParticles, CustomCursor, MouseGlow } from '@/components/gamified-ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 flex overflow-hidden transition-colors duration-300 relative cursor-none">
      <CustomCursor />
      <MouseGlow />
      <GeometricParticles />
      
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center dark:invert-0 invert" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-zinc-950/50">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
