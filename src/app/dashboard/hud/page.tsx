'use client';

import { motion } from 'framer-motion';
import { Crosshair, Cpu, Fingerprint, Activity, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

export default function HUDPage() {
  const { user, rpgProfile } = useAuth();
  
  // Terminal text effect
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [time, setTime] = useState(new Date());
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro
  useEffect(() => {
    let interval: any;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(s => s - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Terminal Simulator
  useEffect(() => {
    const messages = [
      '[SYS] INITIALIZING SAT-LINK...',
      '[SYS] NEURAL HANDSHAKE ESTABLISHED.',
      `[OP] OPERATIVE ${rpgProfile?.username?.toUpperCase() || 'GHOST'} ONLINE.`,
      '[INTEL] 4,208 LOCAL BOUNTIES DETECTED.',
      '[WARN] HOSTILE AI ACTIVITY SPOTTED IN SECTOR 7.',
      '[INTEL] FACTION "NEON SAMURAI" DEPLOYED OVERWATCH.',
      '[SYS] WAITING FOR DIRECTIVE...'
    ];
    
    let i = 0;
    const terminalInterval = setInterval(() => {
      if (i < messages.length) {
        setTerminalOutput(prev => [...prev, messages[i]]);
        i++;
      } else {
        // Random ambient intel
        const ambient = [
          '[NET] Handshake with remote server successful.',
          '[OP] Viper_09 claimed bounty "Daily Workout".',
          '[OP] Cipher deployed smart contract.',
          '[SYS] Ping: 14ms',
          '[WARN] Focus levels dropping. Initiate protocol.'
        ];
        setTerminalOutput(prev => [...prev, ambient[Math.floor(Math.random() * ambient.length)]].slice(-12));
      }
    }, 2500);

    return () => clearInterval(terminalInterval);
  }, [rpgProfile]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-[#ff4655] font-mono overflow-hidden">
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-50 opacity-20" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-40" />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,70,85,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,70,85,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-start border-b border-[#ff4655]/30 pb-4">
          <div className="flex items-center gap-4">
            <Crosshair className="w-8 h-8 text-[#ff4655] animate-pulse" />
            <div>
              <h1 className="font-teko text-5xl uppercase leading-none tracking-widest">ACTIO // SYSTEM_HUD</h1>
              <div className="flex items-center gap-4 text-xs mt-1">
                <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> UID: {user?.id.split('-')[0] || 'NULL'}</span>
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> STATUS: OPERATIONAL</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-teko text-6xl leading-none">{time.toLocaleTimeString('en-US', { hour12: false })}</div>
            <div className="text-xs uppercase tracking-widest">{time.toLocaleDateString()} // LOCAL</div>
          </div>
        </div>

        {/* Main Center (Timer) */}
        <div className="flex-1 flex items-center justify-center relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#ff4655]/10 rounded-full flex items-center justify-center">
             <div className="w-[400px] h-[400px] border border-[#ff4655]/20 rounded-full animate-[spin_60s_linear_infinite]" />
             <div className="absolute w-[500px] h-[500px] border border-dashed border-[#ff4655]/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
           </div>

           <div className="text-center z-10">
              <div className="text-[10px] uppercase tracking-[0.5em] text-[#ff4655]/60 mb-4 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" /> Focus Protocol Active
              </div>
              <div className="font-teko text-[12rem] leading-none text-[#ff4655] drop-shadow-[0_0_30px_rgba(255,70,85,0.5)]">
                {formatTimer(timerSeconds)}
              </div>
              <div className="mt-8 flex gap-4 justify-center">
                <button 
                  onClick={() => setTimerActive(!timerActive)}
                  className="border border-[#ff4655] px-8 py-3 text-xl font-teko uppercase tracking-widest hover:bg-[#ff4655] hover:text-black transition-colors"
                >
                  {timerActive ? 'PAUSE PROTOCOL' : 'ENGAGE PROTOCOL'}
                </button>
                <button 
                  onClick={() => { setTimerSeconds(25 * 60); setTimerActive(false); }}
                  className="border border-zinc-800 text-zinc-500 px-8 py-3 text-xl font-teko uppercase tracking-widest hover:border-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ABORT
                </button>
              </div>
           </div>
        </div>

        {/* Bottom Dock */}
        <div className="grid grid-cols-3 gap-8 border-t border-[#ff4655]/30 pt-4 h-48">
          
          {/* Terminal */}
          <div className="col-span-1 flex flex-col justify-end text-xs leading-relaxed overflow-hidden">
            <div className="text-[#ff4655]/50 border-b border-[#ff4655]/20 pb-1 mb-2 uppercase tracking-widest">
              Live Comms //
            </div>
            {terminalOutput.map((line, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className={line.includes('WARN') ? 'text-yellow-500' : ''}
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* Active Directive */}
          <div className="col-span-1 border-x border-[#ff4655]/30 px-8 flex flex-col justify-center">
            <div className="text-[#ff4655]/50 uppercase tracking-widest text-xs mb-2">Current Directive //</div>
            <h3 className="font-teko text-3xl uppercase leading-none mb-1">Deep Work Block: Architecture</h3>
            <p className="text-xs text-zinc-400">Avoid all social media. Draft the system architecture for Phase 6. Verification requires PDF upload of system diagram.</p>
          </div>

          {/* Biometrics / Stats */}
          <div className="col-span-1 flex flex-col justify-center pl-4">
            <div className="text-[#ff4655]/50 uppercase tracking-widest text-xs mb-4">Operative Status //</div>
            <div className="space-y-3">
               <div className="flex items-center gap-4">
                 <span className="w-24 text-xs uppercase text-zinc-500">Exp Level</span>
                 <div className="flex-1 h-1 bg-zinc-900"><div className="h-full bg-[#ff4655] w-3/4" /></div>
                 <span className="text-xs">{rpgProfile?.level || 1}</span>
               </div>
               <div className="flex items-center gap-4">
                 <span className="w-24 text-xs uppercase text-zinc-500">Streak</span>
                 <div className="flex-1 h-1 bg-zinc-900"><div className="h-full bg-cyan-500 w-[15%]" /></div>
                 <span className="text-xs text-cyan-500">{rpgProfile?.current_streak || 0}</span>
               </div>
               <div className="flex items-center gap-4">
                 <span className="w-24 text-xs uppercase text-zinc-500">Heart Rate</span>
                 <div className="flex-1 flex items-center text-emerald-500 text-xs gap-1">
                   <Activity className="w-3 h-3 animate-pulse" /> 68 BPM (Simulated)
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
