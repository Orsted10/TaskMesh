'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const mockData = [
  { subject: 'Strength', A: 80, fullMark: 100 },
  { subject: 'Intelligence', A: 65, fullMark: 100 },
  { subject: 'Charisma', A: 45, fullMark: 100 },
  { subject: 'Creativity', A: 90, fullMark: 100 },
  { subject: 'Craftsmanship', A: 70, fullMark: 100 },
  { subject: 'Willpower', A: 85, fullMark: 100 },
];

export function PerformanceRadar() {
  return (
    <div className="w-full h-[300px] relative flex items-center justify-center">
      {/* Glow effect behind the radar */}
      <div className="absolute inset-0 bg-[#ff4655]/5 blur-3xl rounded-full" />
      
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockData}>
          <PolarGrid stroke="#333" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace', textAnchor: 'middle' }}
          />
          <Radar
            name="Performance"
            dataKey="A"
            stroke="#ff4655"
            strokeWidth={2}
            fill="#ff4655"
            fillOpacity={0.2}
            isAnimationActive={true}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
