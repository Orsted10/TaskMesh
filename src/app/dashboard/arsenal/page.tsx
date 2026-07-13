'use client';
import { motion } from 'framer-motion';
import { Zap, Backpack } from 'lucide-react';

export default function ArsenalPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Zap className="w-8 h-8 text-yellow-500" />
        <h1 className="font-teko text-5xl text-zinc-900 dark:text-white uppercase tracking-wider">The Arsenal</h1>
      </div>
      
      <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-xl">
        <div className="inline-flex justify-center items-center w-20 h-20 bg-yellow-500/10 rounded-full mb-6 border border-yellow-500/20">
          <Backpack className="w-10 h-10 text-yellow-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-teko text-zinc-900 dark:text-white uppercase tracking-widest mb-4">Armory Locked</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm max-w-lg mx-auto">
          Your digital inventory is being encrypted. Once phase 3 commences, you will be able to equip Mythic loot, Skill Books, and customized loadouts based on your real-world achievements.
        </p>
      </div>
    </div>
  );
}
