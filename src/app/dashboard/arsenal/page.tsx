'use client';

import { motion } from 'framer-motion';
import { PackageOpen, Hexagon, ShieldAlert, Zap, Flame, Trophy, Gem, Snowflake, Lock } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function ArsenalPage() {
  const { rpgProfile } = useAuth();

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
        <PackageOpen className="w-8 h-8 text-[#ff4655]" />
        <h1 className="text-5xl font-teko text-white uppercase tracking-wider">The Arsenal</h1>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Credits</span>
          <span className="text-2xl font-teko text-yellow-500">14,250</span>
          <Gem className="w-5 h-5 text-yellow-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COL: Inventory */}
        <div className="lg:col-span-8 space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4655]/5 blur-3xl rounded-full" />
            <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ff4655]" /> Tactical Consumables
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Streak Freeze', icon: Snowflake, color: 'text-cyan-400', count: 3, desc: 'Prevents streak loss for 24h' },
                { name: 'EXP Multiplier x2', icon: Flame, color: 'text-orange-500', count: 1, desc: 'Doubles EXP for next 3 quests' },
                { name: 'Bounty Radar', icon: ShieldAlert, color: 'text-emerald-500', count: 0, desc: 'Reveals hidden local bounties' },
                { name: 'Respec Token', icon: Hexagon, color: 'text-purple-500', count: 2, desc: 'Reset one skill branch' },
              ].map((item, i) => (
                <div key={i} className="bg-black border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-zinc-600 transition-all group/item cursor-pointer relative overflow-hidden">
                  <div className={\`absolute inset-0 bg-gradient-to-t from-\${item.color.split('-')[1]}-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity\`} />
                  <div className="relative mb-3">
                    <item.icon className={\`w-10 h-10 \${item.count > 0 ? item.color : 'text-zinc-700'}\`} />
                    <span className="absolute -bottom-2 -right-2 bg-zinc-900 border border-zinc-700 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {item.count}
                    </span>
                  </div>
                  <h3 className={\`font-teko text-xl uppercase leading-none mb-1 \${item.count > 0 ? 'text-white' : 'text-zinc-600'}\`}>{item.name}</h3>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest leading-tight">{item.desc}</p>
                  {item.count === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                      <Lock className="w-6 h-6 text-zinc-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Titles & Auras */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Hexagon className="w-5 h-5 text-purple-500" /> Cosmetic Auras
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Neon Synthwave', active: true, rarity: 'Epic', color: 'from-fuchsia-600 to-purple-600' },
                { name: 'Inferno Core', active: false, rarity: 'Legendary', color: 'from-orange-600 to-red-600' },
                { name: 'Glacial Void', active: false, rarity: 'Rare', color: 'from-cyan-600 to-blue-600' },
              ].map((aura, i) => (
                <div key={i} className={\`p-4 rounded-xl border \${aura.active ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-black'} flex flex-col items-center justify-center cursor-pointer hover:border-zinc-600 transition-all relative overflow-hidden\`}>
                  {aura.active && (
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      <span className="text-[8px] text-purple-400 uppercase tracking-widest font-bold">Equipped</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 text-[9px] text-zinc-500 uppercase tracking-widest">{aura.rarity}</div>
                  
                  <div className="w-16 h-16 rounded-full relative mb-4 mt-4">
                    <div className={\`absolute inset-0 bg-gradient-to-br \${aura.color} opacity-20 blur-md rounded-full\`} />
                    <div className={\`absolute inset-2 bg-gradient-to-br \${aura.color} rounded-full border border-white/20 shadow-inner\`} />
                  </div>
                  <h4 className="font-teko text-2xl text-white uppercase">{aura.name}</h4>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* RIGHT COL: Trophies */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] h-full"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full" />
            <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Trophy className="w-5 h-5 text-yellow-500" /> The Trophy Room
            </h2>

            <div className="space-y-4">
              {[
                { name: '100 Days of Code (Hardcore)', date: '2026.04.12', rarity: 'Mythic' },
                { name: 'Marathon Survivor', date: '2025.11.05', rarity: 'Legendary' },
                { name: 'Civic Hero: Downtown', date: '2026.01.20', rarity: 'Epic' },
              ].map((trophy, i) => (
                <div key={i} className="bg-black border border-yellow-500/20 p-4 rounded-xl flex items-start gap-4 group hover:border-yellow-500/50 transition-colors">
                  <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <Trophy className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-teko text-xl text-white uppercase leading-none mb-1">{trophy.name}</h4>
                    <div className="flex gap-2 text-[10px] uppercase tracking-widest font-mono">
                      <span className="text-zinc-500">{trophy.date}</span>
                      <span className="text-yellow-500 font-bold">{trophy.rarity}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-8 pt-8 border-t border-dashed border-zinc-800 text-center">
                <div className="w-16 h-16 mx-auto rounded-xl border border-dashed border-zinc-700 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-zinc-700" />
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Next Trophy Slot Unlocks at Level 50</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
