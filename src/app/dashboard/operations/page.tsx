'use client';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function OperationsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-[#ff4655]" />
        <h1 className="font-teko text-5xl text-zinc-900 dark:text-white uppercase tracking-wider">Active Operations</h1>
      </div>
      
      <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-xl">
        <div className="inline-flex justify-center items-center w-20 h-20 bg-[#ff4655]/10 rounded-full mb-6 border border-[#ff4655]/20">
          <ShieldAlert className="w-10 h-10 text-[#ff4655] animate-pulse" />
        </div>
        <h2 className="text-2xl font-teko text-zinc-900 dark:text-white uppercase tracking-widest mb-4">Operations Matrix Syncing...</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm max-w-lg mx-auto">
          The tactical overview is currently being established. Future iterations will display a full cryptographic ledger of all past and present missions across the network.
        </p>
      </div>
    </div>
  );
}
