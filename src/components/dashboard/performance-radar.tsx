'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export function PerformanceRadar() {
  const { rpgProfile } = useAuth();

  if (!rpgProfile) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#ff4655]" />
      </div>
    );
  }

  // Use actual skills from profile, fallback to base 10 if new
  const skills = rpgProfile.skills || {
    strength: 10, intelligence: 10, charisma: 10, 
    creativity: 10, craftsmanship: 10, willpower: 10
  };

  const data = [
    { subject: 'STR', A: skills.strength, fullMark: 100 },
    { subject: 'INT', A: skills.intelligence, fullMark: 100 },
    { subject: 'CHA', A: skills.charisma, fullMark: 100 },
    { subject: 'CRE', A: skills.creativity, fullMark: 100 },
    { subject: 'CRA', A: skills.craftsmanship, fullMark: 100 },
    { subject: 'WIL', A: skills.willpower, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[300px] relative flex items-center justify-center group">
      {/* Intense Glow effect behind the radar */}
      <div className="absolute inset-0 bg-[#ff4655]/10 blur-3xl rounded-full group-hover:bg-[#ff4655]/20 transition-all duration-700" />
      
      {/* Decorative Cybernetic Rings */}
      <div className="absolute w-[220px] h-[220px] border border-[#ff4655]/20 rounded-full animate-[spin_30s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[260px] h-[260px] border border-dashed border-[#ff4655]/10 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />

      <ResponsiveContainer width="100%" height="100%" className="relative z-10">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#ff4655" strokeOpacity={0.15} strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#a1a1aa', fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          {/* Inner Radar (Actual Stats) */}
          <Radar
            name="Performance"
            dataKey="A"
            stroke="#ff4655"
            strokeWidth={3}
            fill="url(#colorRed)"
            fillOpacity={0.6}
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          />

          <defs>
            <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4655" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ff4655" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
