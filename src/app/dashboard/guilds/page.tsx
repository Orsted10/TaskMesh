'use client';

import { motion } from 'framer-motion';
import { Shield, Swords, Castle, Flag, Users, Cpu, Server, Box } from 'lucide-react';
import { useState } from 'react';

export default function GuildsPage() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'base'>('leaderboard');

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-4">
          <Shield className="w-8 h-8 text-fuchsia-500" />
          <h1 className="text-5xl font-teko text-white uppercase tracking-wider">Guild Network</h1>
        </div>
        
        <div className="md:ml-auto flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-2 rounded font-teko text-xl uppercase tracking-widest transition-colors ${activeTab === 'leaderboard' ? 'bg-fuchsia-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
          >
            <Swords className="w-4 h-4 inline-block mr-2 -mt-1" />
            Faction Wars
          </button>
          <button 
            onClick={() => setActiveTab('base')}
            className={`px-6 py-2 rounded font-teko text-xl uppercase tracking-widest transition-colors ${activeTab === 'base' ? 'bg-fuchsia-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
          >
            <Castle className="w-4 h-4 inline-block mr-2 -mt-1" />
            Guild Base
          </button>
        </div>
      </div>

      {activeTab === 'leaderboard' ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Global Faction Wars */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Flag className="w-5 h-5 text-fuchsia-500" /> Sector 4 Leaderboard
            </h2>
            
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Guild Name</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4 text-right">Total Power (EXP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {[
                    { rank: 1, name: 'Neon Samurai', spec: 'Cybersecurity', xp: '12.4M', color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
                    { rank: 2, name: 'Iron Forged', spec: 'Fitness', xp: '11.8M', color: 'text-red-500', bg: 'bg-red-500/10' },
                    { rank: 3, name: 'Code Cartel', spec: 'Engineering', xp: '10.2M', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { rank: 4, name: 'Void Walkers', spec: 'General', xp: '8.9M', color: 'text-zinc-300', bg: 'bg-transparent' },
                    { rank: 5, name: 'Synthetix', spec: 'Data Science', xp: '7.5M', color: 'text-zinc-300', bg: 'bg-transparent' },
                  ].map((guild) => (
                    <tr key={guild.rank} className={`hover:bg-zinc-900/50 transition-colors ${guild.rank === 1 ? 'border-l-4 border-l-fuchsia-500' : ''}`}>
                      <td className="px-6 py-4">
                        <span className={`font-teko text-2xl ${guild.color}`}>#{guild.rank}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-teko text-2xl text-white uppercase tracking-wider">{guild.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded ${guild.bg} border ${guild.bg.replace('bg', 'border')}`}>
                          {guild.spec}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-lg text-yellow-500 font-bold">{guild.xp}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Your Guild Stats */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-950/90 border border-fuchsia-500/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(217,70,239,0.15)] h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full" />
              <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4 relative z-10">
                Your Faction
              </h2>

              <div className="text-center mb-8 relative z-10">
                <div className="w-24 h-24 mx-auto border-2 border-fuchsia-500 bg-fuchsia-500/20 rotate-45 rounded flex items-center justify-center mb-6">
                  <div className="-rotate-45 font-teko text-5xl text-white">NS</div>
                </div>
                <h3 className="font-teko text-4xl text-fuchsia-500 uppercase tracking-widest leading-none">Neon Samurai</h3>
                <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mt-2">Rank #1 • 150 Members</p>
              </div>

              <div className="space-y-4 relative z-10">
                <button className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-black py-3 rounded font-teko text-xl uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                  Donate Resources
                </button>
                <button className="w-full bg-black border border-zinc-800 hover:border-zinc-600 text-white py-3 rounded font-teko text-xl uppercase tracking-widest transition-colors">
                  Guild Chat (3 New)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-[url('/grid.svg')] bg-center rounded-2xl border border-zinc-800 relative overflow-hidden h-[600px] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
          
          <div className="relative z-10 text-center space-y-6">
            <Castle className="w-24 h-24 text-fuchsia-500 mx-auto opacity-50" />
            <div>
              <h2 className="font-teko text-5xl text-white uppercase tracking-widest leading-none drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                Level 4 Citadel
              </h2>
              <p className="text-fuchsia-400 font-mono text-sm uppercase tracking-widest mt-2">
                Guild Base Module rendering offline.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-8">
              {[
                { name: 'Server Rack', level: 3, icon: Server, buff: '+10% INT EXP' },
                { name: 'Training DoJo', level: 2, icon: Swords, buff: '+5% STR EXP' },
                { name: '3D Printer', level: 4, icon: Box, buff: '+15% CRA EXP' },
              ].map((module, i) => (
                <div key={i} className="bg-black/80 border border-fuchsia-500/30 p-4 rounded-xl text-center backdrop-blur-sm">
                  <module.icon className="w-6 h-6 text-fuchsia-400 mx-auto mb-2" />
                  <h4 className="font-teko text-xl text-white uppercase">{module.name}</h4>
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">Level {module.level}</div>
                  <div className="text-[10px] font-bold font-mono text-emerald-400 mt-2">{module.buff}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
