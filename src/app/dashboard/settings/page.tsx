'use client';

import { motion } from 'framer-motion';
import { Settings, BrainCircuit, ActivitySquare, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [activePersona, setActivePersona] = useState('drill_sergeant');

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
        <Settings className="w-8 h-8 text-zinc-400" />
        <h1 className="text-5xl font-teko text-white uppercase tracking-wider">System Config</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* AI Persona */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4655]/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#ff4655]" /> AI Mentor Persona
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'drill_sergeant', name: 'Drill Sergeant', desc: 'Aggressive accountability. Zero tolerance for excuses.', icon: '🤬' },
              { id: 'socratic', name: 'Socratic Tutor', desc: 'Guides you with questions. Never gives the direct answer.', icon: '🦉' },
              { id: 'hype_man', name: 'The Hype Man', desc: 'Extreme positivity and constant encouragement.', icon: '🔥' },
              { id: 'zen_master', name: 'Zen Master', desc: 'Calm, focused, prioritizes mental health over speed.', icon: '🧘' },
            ].map((persona) => (
              <div 
                key={persona.id}
                onClick={() => setActivePersona(persona.id)}
                className={\`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 relative \${activePersona === persona.id ? 'bg-[#ff4655]/10 border-[#ff4655]' : 'bg-black border-zinc-800 hover:border-zinc-600'}\`}
              >
                {activePersona === persona.id && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#ff4655] animate-pulse" />
                    <span className="text-[8px] text-[#ff4655] uppercase tracking-widest font-bold">Active</span>
                  </div>
                )}
                <div className="text-3xl mb-2">{persona.icon}</div>
                <h3 className="font-teko text-2xl text-white uppercase leading-none">{persona.name}</h3>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-tight">{persona.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Biometrics & Hardware */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <ActivitySquare className="w-5 h-5 text-cyan-500" /> Biometric Uplink
          </h2>

          <div className="space-y-4">
            {[
              { name: 'Apple HealthKit', status: 'Connected', active: true },
              { name: 'Strava API', status: 'Disconnected', active: false },
              { name: 'Oura Ring', status: 'Disconnected', active: false },
              { name: 'WakaTime (IDE Sync)', status: 'Connected', active: true },
            ].map((hardware, i) => (
              <div key={i} className="bg-black border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-teko text-xl text-white uppercase">{hardware.name}</h4>
                  <div className={\`text-[10px] font-mono uppercase tracking-widest \${hardware.active ? 'text-cyan-500' : 'text-zinc-600'}\`}>
                    {hardware.status}
                  </div>
                </div>
                <button className={\`px-4 py-2 rounded text-[10px] font-bold font-mono uppercase tracking-widest transition-colors \${hardware.active ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700' : 'bg-cyan-500 text-black hover:bg-cyan-400'}\`}>
                  {hardware.active ? 'Unlink' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security & Access */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="xl:col-span-2 bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Identity & Access
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest block mb-2">Display Name</label>
                <input type="text" defaultValue="ANKANB2006+TEST1" className="w-full bg-black border border-zinc-700 rounded p-3 text-white font-mono text-sm focus:border-emerald-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest block mb-2">Crypto Wallet (Bounties)</label>
                <input type="text" placeholder="Connect Web3 Wallet..." className="w-full bg-black border border-zinc-700 rounded p-3 text-white font-mono text-sm focus:border-emerald-500 outline-none transition-colors" />
              </div>
            </div>
            
            <div className="flex flex-col justify-end space-y-4">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-black font-teko text-xl uppercase tracking-widest py-3 rounded transition-colors">
                Save Configuration
              </button>
              <button className="bg-zinc-900 border border-zinc-700 hover:border-red-500 hover:text-red-500 text-white font-teko text-xl uppercase tracking-widest py-3 rounded transition-colors">
                Erase Identity (Delete Account)
              </button>
            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
