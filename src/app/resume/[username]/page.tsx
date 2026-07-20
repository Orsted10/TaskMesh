'use client';

import { motion } from 'framer-motion';
import { Shield, Fingerprint, Hexagon, Crosshair, MapPin, ExternalLink, Activity } from 'lucide-react';
import { useParams } from 'next/navigation';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function ResumePage() {
  const params = useParams();
  const username = params.username as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        // 1. Fetch user by username
        const { data: user, error: userErr } = await supabase
          .from('users')
          .select('*, guilds(name)')
          .eq('username', username)
          .single();

        if (userErr || !user) {
          setError('User not found.');
          setLoading(false);
          return;
        }

        // 2. Fetch completed bounties
        const { data: completedQuests, error: qErr } = await supabase
          .from('user_quest_progress')
          .select('*, quests(title, category)')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        const bounties_cleared = completedQuests?.length || 0;
        
        // Convert JSONB skills to array for Radar Chart
        const rawSkills = user.skills || { strength: 10, intelligence: 10, charisma: 10, creativity: 10, craftsmanship: 10, willpower: 10 };
        const radarSkills = [
          { subject: 'Strength', A: rawSkills.strength || 10, fullMark: 100 },
          { subject: 'Intel', A: rawSkills.intelligence || 10, fullMark: 100 },
          { subject: 'Charisma', A: rawSkills.charisma || 10, fullMark: 100 },
          { subject: 'Creativity', A: rawSkills.creativity || 10, fullMark: 100 },
          { subject: 'Craft', A: rawSkills.craftsmanship || 10, fullMark: 100 },
          { subject: 'Willpower', A: rawSkills.willpower || 10, fullMark: 100 },
        ];

        // Format recent bounties
        const recentBounties = (completedQuests || []).slice(0, 5).map(q => ({
          id: q.id.split('-')[0].toUpperCase(),
          title: q.quests?.title || 'Unknown Classified Quest',
          cat: q.quests?.category || 'General',
          date: q.completed_at ? new Date(q.completed_at).toLocaleDateString() : 'Unknown Date'
        }));

        setProfile({
          username: user.username,
          level: user.level,
          title: user.title,
          guild: user.guilds?.name || 'Unaffiliated',
          total_exp: user.total_exp,
          bounties_cleared,
          join_date: new Date(user.created_at).toLocaleDateString(),
          skills: radarSkills,
          recentBounties
        });

      } catch (err) {
        console.error(err);
        setError('Database connection error.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return <div className="min-h-screen bg-[#0B0C10] text-fuchsia-500 flex items-center justify-center font-teko text-4xl uppercase tracking-widest">Decrypting Identity...</div>;
  }

  if (error || !profile) {
    return <div className="min-h-screen bg-[#0B0C10] text-red-500 flex items-center justify-center font-teko text-4xl uppercase tracking-widest">Error 404 // Operative Not Found</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white p-4 md:p-12 selection:bg-fuchsia-500/30 selection:text-fuchsia-100">
      
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <div className="max-w-[1000px] mx-auto relative z-10">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-12">
          <div className="font-teko text-3xl tracking-widest uppercase flex items-center gap-2 text-zinc-500">
            <Crosshair className="w-6 h-6 text-fuchsia-500" /> ACTIO
          </div>
          <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded flex items-center gap-2">
            <Shield className="w-3 h-3" /> Cryptographically Verified
          </div>
        </div>

        {/* Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          <div className="md:col-span-2">
            <h1 className="font-teko text-7xl uppercase leading-none tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mb-2">
              {profile.username}
            </h1>
            <h2 className="font-mono text-fuchsia-400 uppercase tracking-[0.3em] text-sm mb-6 flex items-center gap-2">
              <Hexagon className="w-4 h-4" /> {profile.title}
            </h2>
            
            <div className="flex flex-wrap gap-6 text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-black/50 border border-zinc-800 p-4 rounded-xl w-max backdrop-blur-md">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-600">Level</span>
                <span className="text-white text-lg">{profile.level}</span>
              </div>
              <div className="w-[1px] bg-zinc-800" />
              <div className="flex flex-col gap-1">
                <span className="text-zinc-600">Faction</span>
                <span className="text-fuchsia-500">{profile.guild}</span>
              </div>
              <div className="w-[1px] bg-zinc-800" />
              <div className="flex flex-col gap-1">
                <span className="text-zinc-600">Bounties Cleared</span>
                <span className="text-blue-400">{profile.bounties_cleared}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center">
            {/* Hexagon Avatar placeholder */}
            <div className="relative w-48 h-48">
               <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-blue-500 opacity-20 blur-xl rounded-full" />
               <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                  <polygon points="50 1 95 25 95 75 50 99 5 75 5 25" fill="#0B0C10" stroke="#d946ef" strokeWidth="1" />
                  <image href="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80" x="5" y="5" width="90" height="90" clipPath="url(#hex)" preserveAspectRatio="xMidYMid slice" />
                  <defs>
                    <clipPath id="hex">
                      <polygon points="50 1 95 25 95 75 50 99 5 75 5 25" />
                    </clipPath>
                  </defs>
               </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Skill Radar */}
          <div className="bg-black/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="font-teko text-2xl uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-fuchsia-500" /> Operational Capacity
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={profile.skills}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="User" dataKey="A" stroke="#d946ef" fill="#d946ef" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Verified Ledger */}
          <div className="bg-black/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md">
             <h3 className="font-teko text-2xl uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-500" /> The Ledger (Proof of Work)
            </h3>
            
            <div className="space-y-4">
              {profile.recentBounties.map((b: any) => (
                <div key={b.id} className="border border-zinc-800/50 bg-zinc-950/50 p-4 rounded-xl flex flex-col gap-2 relative group hover:border-zinc-700 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{b.id}</span>
                    <span className="text-[9px] font-mono text-zinc-600">{b.date}</span>
                  </div>
                  <h4 className="font-teko text-xl uppercase tracking-wide leading-none">{b.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded text-zinc-400 border border-zinc-800">
                      {b.cat}
                    </span>
                    <a href="#" className="flex items-center gap-1 text-[10px] font-mono text-blue-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Proof <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
              
              {profile.recentBounties.length === 0 && (
                 <div className="text-zinc-500 text-sm font-mono uppercase tracking-widest p-4 text-center border border-dashed border-zinc-800 rounded">
                    No verified bounties on ledger.
                 </div>
              )}
            </div>

            <button className="w-full mt-6 bg-transparent border border-zinc-800 hover:border-zinc-600 text-zinc-400 font-teko text-lg uppercase tracking-widest py-2 rounded transition-colors">
              View Full History ({profile.bounties_cleared} Records)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
