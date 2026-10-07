'use client';

import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { useAuth } from '@/context/auth-context';
import { Loader2, Cpu, Sparkles } from 'lucide-react';
import { cyberAudio } from '@/lib/cyber-audio';

export function PerformanceRadar() {
  const { rpgProfile } = useAuth();
  const [mode, setMode] = useState<'core' | 'specialized'>('core');

  if (!rpgProfile) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#ff4655]" />
      </div>
    );
  }

  const skills = rpgProfile.skills || {
    strength: 10, intelligence: 10, charisma: 10, 
    creativity: 10, craftsmanship: 10, willpower: 10
  };

  const specificSkills = rpgProfile.specific_skills || {};
  const skillKeys = Object.keys(specificSkills);

  let data: any[] = [];
  let maxDomain = 100;

  if (mode === 'core') {
    const maxVal = Math.max(
      skills.strength || 10,
      skills.intelligence || 10,
      skills.charisma || 10,
      skills.creativity || 10,
      skills.craftsmanship || 10,
      skills.willpower || 10,
      50
    );
    maxDomain = Math.ceil(maxVal / 10) * 10;

    data = [
      { subject: `STR (${skills.strength || 10})`, A: skills.strength || 10, fullMark: maxDomain },
      { subject: `INT (${skills.intelligence || 10})`, A: skills.intelligence || 10, fullMark: maxDomain },
      { subject: `CHR (${skills.charisma || 10})`, A: skills.charisma || 10, fullMark: maxDomain },
      { subject: `CRE (${skills.creativity || 10})`, A: skills.creativity || 10, fullMark: maxDomain },
      { subject: `CRA (${skills.craftsmanship || 10})`, A: skills.craftsmanship || 10, fullMark: maxDomain },
      { subject: `WIL (${skills.willpower || 10})`, A: skills.willpower || 10, fullMark: maxDomain },
    ];
  } else {
    if (skillKeys.length > 0) {
      const topSkills = skillKeys
        .sort((a, b) => specificSkills[b] - specificSkills[a])
        .slice(0, 8);

      const maxVal = Math.max(...topSkills.map(k => specificSkills[k]), 100);
      maxDomain = Math.ceil(maxVal / 10) * 10;

      data = topSkills.map(skill => ({
        subject: `${skill.length > 8 ? skill.substring(0, 6) + '..' : skill} (${specificSkills[skill]})`,
        A: specificSkills[skill],
        fullMark: maxDomain
      }));
    } else {
      maxDomain = 100;
      data = [
        { subject: 'NO SPECIALTY', A: 10, fullMark: 100 },
        { subject: 'CODE', A: 10, fullMark: 100 },
        { subject: 'AI', A: 10, fullMark: 100 },
        { subject: 'DATA', A: 10, fullMark: 100 },
        { subject: 'DEV', A: 10, fullMark: 100 },
      ];
    }
  }

  const handleModeChange = (newMode: 'core' | 'specialized') => {
    cyberAudio.playClick();
    setMode(newMode);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 p-1 rounded-xl mb-2 z-20">
        <button
          type="button"
          onClick={() => handleModeChange('core')}
          className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
            mode === 'core' 
              ? 'bg-[#ff4655] text-white font-bold shadow-[0_0_12px_rgba(255,70,85,0.4)]' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3 h-3" /> Core (STR/INT/etc)
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('specialized')}
          className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
            mode === 'specialized' 
              ? 'bg-cyan-500 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" /> Specializations ({skillKeys.length})
        </button>
      </div>

      <div className="w-full h-[280px] relative flex items-center justify-center group">
        {/* Intense Glow effect behind the radar */}
        <div className={`absolute inset-0 blur-3xl rounded-full transition-all duration-700 pointer-events-none ${
          mode === 'core' ? 'bg-[#ff4655]/10 group-hover:bg-[#ff4655]/20' : 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
        }`} />
        
        {/* Decorative Cybernetic Rings */}
        <div className={`absolute w-[220px] h-[220px] border rounded-full animate-[spin_30s_linear_infinite] pointer-events-none ${
          mode === 'core' ? 'border-[#ff4655]/20' : 'border-cyan-500/20'
        }`} />
        <div className={`absolute w-[260px] h-[260px] border border-dashed rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none ${
          mode === 'core' ? 'border-[#ff4655]/10' : 'border-cyan-500/10'
        }`} />

        <ResponsiveContainer width="100%" height="100%" className="relative z-10">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke={mode === 'core' ? '#ff4655' : '#06b6d4'} strokeOpacity={0.18} strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#d4d4d8', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}
            />
            <PolarRadiusAxis angle={30} domain={[0, maxDomain]} tick={false} axisLine={false} />
            
            {/* Inner Radar (Actual Stats) */}
            <Radar
              name="Attributes"
              dataKey="A"
              stroke={mode === 'core' ? '#ff4655' : '#06b6d4'}
              strokeWidth={3}
              fill={mode === 'core' ? 'url(#colorCoreRed)' : 'url(#colorSpecCyan)'}
              fillOpacity={0.55}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />

            <defs>
              <linearGradient id="colorCoreRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4655" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ff4655" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorSpecCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
