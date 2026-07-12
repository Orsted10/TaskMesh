import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950/50">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
