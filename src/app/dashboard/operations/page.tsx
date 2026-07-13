'use client';

import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, Clock, AlertTriangle, Play, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function ActiveOperationsPage() {
  const [hardcoreMode, setHardcoreMode] = useState(false);

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
        <Activity className="w-8 h-8 text-[#ff4655]" />
        <h1 className="text-5xl font-teko text-white uppercase tracking-wider">Active Operations</h1>
        
        <div className="ml-auto flex items-center gap-3 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
          <ShieldAlert className={\`w-5 h-5 \${hardcoreMode ? 'text-red-500 animate-pulse' : 'text-zinc-600'}\`} />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">
            Permadeath Mode
          </span>
          <button 
            onClick={() => setHardcoreMode(!hardcoreMode)}
            className={\`w-12 h-6 rounded-full relative transition-colors \${hardcoreMode ? 'bg-red-500/20 border border-red-500/50' : 'bg-zinc-800 border border-zinc-700'}\`}
          >
            <motion.div 
              animate={{ x: hardcoreMode ? 24 : 2 }}
              className={\`absolute top-1 bottom-1 w-4 rounded-full \${hardcoreMode ? 'bg-red-500' : 'bg-zinc-500'}\`}
            />
          </button>
        </div>
      </div>

      {hardcoreMode && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-4"
        >
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-red-500 font-teko text-2xl uppercase leading-none">Hardcore Mode Engaged</h3>
            <p className="text-red-400/80 font-mono text-[10px] uppercase tracking-widest mt-1">A single missed day or failed verification will permanently wipe all stack progress. EXP Rewards x3.</p>
          </div>
        </motion.div>
      )}

      {/* Tactical Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Pending */}
        <div className="space-y-4">
          <h2 className="font-teko text-2xl text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
            <LayoutDashboard className="w-5 h-5" /> Pending Init
            <span className="ml-auto text-[10px] bg-zinc-900 px-2 py-1 rounded">2</span>
          </h2>
          
          {[
            { title: 'Deploy Production Build', skill: 'Intelligence', xp: 500, time: '2hrs' },
            { title: 'Draft Strategy Doc', skill: 'Creativity', xp: 200, time: '1hr' },
          ].map((op, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-black/50 border border-zinc-800 p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono border border-zinc-800 px-2 py-0.5 rounded">
                  {op.skill}
                </span>
                <span className="text-[10px] text-yellow-500 font-mono font-bold">+{op.xp} EXP</span>
              </div>
              <h3 className="font-teko text-2xl text-white uppercase leading-none mb-4">{op.title}</h3>
              <div className="flex items-center gap-2">
                <button className="flex-1 bg-zinc-900 hover:bg-[#ff4655]/20 text-[#ff4655] hover:border-[#ff4655]/50 border border-zinc-800 py-2 rounded text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 transition-colors">
                  <Play className="w-3 h-3" /> Engage
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Column 2: In Progress */}
        <div className="space-y-4">
          <h2 className="font-teko text-2xl text-blue-500 uppercase tracking-widest flex items-center gap-2 border-b border-blue-900/30 pb-2">
            <Clock className="w-5 h-5" /> In Progress
            <span className="ml-auto text-[10px] bg-blue-900/20 border border-blue-900/50 px-2 py-1 rounded">1</span>
          </h2>

          <motion.div 
            className="bg-blue-950/10 border border-blue-500/30 p-4 rounded-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="flex justify-between items-start mb-3 relative z-10">
              <span className="text-[9px] text-blue-400 uppercase tracking-widest font-mono border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/10">
                Strength
              </span>
              <span className="text-[10px] text-yellow-500 font-mono font-bold">+{hardcoreMode ? '900' : '300'} EXP</span>
            </div>
            <h3 className="font-teko text-2xl text-white uppercase leading-none mb-4 relative z-10">Complete 50 Pushups</h3>
            
            <div className="space-y-2 relative z-10">
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>Time Remaining</span>
                <span className="text-blue-400">14:59</span>
              </div>
              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/2" />
              </div>
            </div>

            <button className="w-full mt-4 bg-blue-500 hover:bg-blue-400 text-black py-2 rounded text-[10px] uppercase tracking-widest font-bold transition-colors">
              Submit Proof
            </button>
          </motion.div>
        </div>

        {/* Column 3: Verification */}
        <div className="space-y-4">
          <h2 className="font-teko text-2xl text-emerald-500 uppercase tracking-widest flex items-center gap-2 border-b border-emerald-900/30 pb-2">
            <CheckCircle2 className="w-5 h-5" /> Awaiting Intel
            <span className="ml-auto text-[10px] bg-emerald-900/20 border border-emerald-900/50 px-2 py-1 rounded">1</span>
          </h2>

          <motion.div 
            className="bg-emerald-950/10 border border-emerald-500/30 p-4 rounded-xl opacity-75"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] text-emerald-500 uppercase tracking-widest font-mono border border-emerald-500/30 px-2 py-0.5 rounded">
                Civic
              </span>
            </div>
            <h3 className="font-teko text-2xl text-white uppercase leading-none mb-4 line-through decoration-emerald-500/50">Clean Local Park</h3>
            
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 p-2 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              AI Vision Model processing Proof...
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
