'use client';
import { motion } from 'framer-motion';
import { Settings, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-emerald-500" />
        <h1 className="font-teko text-5xl text-zinc-900 dark:text-white uppercase tracking-wider">System Settings</h1>
      </div>
      
      <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-12 shadow-xl">
        <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-zinc-800 pb-8">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <Cpu className="w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-teko text-zinc-900 dark:text-white uppercase tracking-widest mb-1">Configuration Matrix</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-mono text-xs">Adjust your HUD, notifications, and cryptographic sync settings.</p>
          </div>
        </div>

        <div className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">Operative Callsign</label>
            <input type="text" placeholder="Update your username..." className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">Theme Override</label>
            <select className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500/50">
              <option value="system">System Default</option>
              <option value="dark">Dark Mode (God Tier)</option>
              <option value="light">Light Mode (Clean)</option>
            </select>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-teko text-xl tracking-widest uppercase mt-4">
            Save Protocol
          </Button>
        </div>
      </div>
    </div>
  );
}
