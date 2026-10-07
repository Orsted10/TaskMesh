'use client';

import { motion } from 'framer-motion';
import { 
  User as UserIcon, Activity, Star, Award, Shield, Sword, 
  Hexagon, TrendingUp, Zap, Clock, Package, Flame, Sparkles, Cpu, ChevronRight, FileCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { PerformanceRadar } from '@/components/dashboard/performance-radar';
import { CompletionCertificate, CertificateData } from '@/components/mission/completion-certificate';
import { cyberAudio } from '@/lib/cyber-audio';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfilePage() {
  const { user, rpgProfile } = useAuth();
  const [recentMissions, setRecentMissions] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
  const [showCert, setShowCert] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_quest_progress')
        .select(`
          id, status, started_at, completed_at,
          quests (title, category, tier, difficulty, rewards, campaign_title)
        `)
        .eq('user_id', user.id)
        .in('status', ['completed', 'verifying'])
        .order('completed_at', { ascending: false })
        .limit(10);
      
      if (data) setRecentMissions(data);
    };
    fetchHistory();
  }, [user]);

  // Mock leveling data for the curve
  const generateLevelCurve = () => {
    let xp = 0;
    const data = [];
    for (let i = 1; i <= 30; i++) {
      xp += (i * 100);
      data.push({
        day: `Day ${i}`,
        xp: xp + Math.floor(Math.random() * 50)
      });
    }
    return data;
  };
  const levelCurveData = generateLevelCurve();

  const currentXP = rpgProfile?.total_exp || 0;
  const xpForNextLevel = ((rpgProfile?.level || 1) * 1000);
  const progressPercent = Math.min((currentXP / xpForNextLevel) * 100, 100);
  
  const displayName = rpgProfile?.full_name || user?.user_metadata?.full_name || rpgProfile?.username || 'AGENT';

  const skills = rpgProfile?.skills || {
    strength: 10, intelligence: 10, charisma: 10,
    creativity: 10, craftsmanship: 10, willpower: 10
  };

  const specificSkills = rpgProfile?.specific_skills || {};
  const specificSkillEntries = Object.entries(specificSkills);

  const handleOpenCertificate = (mission: any) => {
    cyberAudio.playSuccess();
    const q = mission.quests || {};
    const rewards = q.rewards || {};
    const diff = q.difficulty || 1;
    const cert: CertificateData = {
      operativeName: displayName,
      operativeLevel: rpgProfile?.level || 1,
      operativeTitle: rpgProfile?.title || 'AGENT',
      missionTitle: q.title || 'Classified Tactical Operation',
      campaignTitle: q.campaign_title || 'Tactical Operations Matrix',
      tier: q.tier || 'STANDARD MISSION',
      category: q.category || 'INTELLIGENCE',
      difficulty: diff,
      timeSpentSeconds: 420,
      rewards: {
        xp: rewards.xp || (diff * 100),
        gold: rewards.gold || 50,
        shine: rewards.shine || 0,
        skillpoints: rewards.skillpoints || 2,
        coreStatName: (q.category || 'INTELLIGENCE').toLowerCase(),
        coreStatGain: Math.max(1, Math.min(10, diff)),
        specific_skills: rewards.specific_skills || []
      },
      personaId: rpgProfile?.preferences?.ai_persona
    };
    setSelectedCert(cert);
    setShowCert(true);
  };

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      {/* Header Profile Section */}
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4655]/5 blur-[100px] rounded-full" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4655] to-purple-500 shadow-[0_0_15px_#ff4655]" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-black border-2 border-zinc-800 p-1 relative z-10 overflow-hidden group">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-zinc-900 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-zinc-500 group-hover:text-[#ff4655] transition-colors" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#ff4655] rounded-lg border-2 border-black flex items-center justify-center shadow-lg rotate-12">
              <span className="font-teko font-bold text-white text-xl">{rpgProfile?.level || 1}</span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-5xl font-teko text-white uppercase tracking-wider leading-none">
                {displayName}
              </h1>
              <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs px-3 py-1 rounded uppercase tracking-[0.2em] font-mono font-bold">
                {rpgProfile?.title || 'NOVICE'}
              </span>
              <span className="bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] text-xs px-3 py-1 rounded uppercase tracking-[0.15em] font-mono font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> {rpgProfile?.current_streak || 0} DAY STREAK
              </span>
              <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs px-3 py-1 rounded uppercase tracking-[0.15em] font-mono font-bold">
                {rpgProfile?.multiplier || 1.0}x MULTIPLIER
              </span>
            </div>
            <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-6">
              OPERATIVE ID: {user?.id.split('-')[0] || '000000'} // CLASS: VANGUARD // PROTOCOL: ZERO-TRUST
            </p>
            
            <div className="w-full max-w-2xl">
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                <span>Rank Progression</span>
                <span className="text-white">{currentXP} / <span className="text-zinc-600">{xpForNextLevel} XP</span></span>
              </div>
              <div className="h-3 bg-black rounded-full overflow-hidden border border-zinc-800">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1.5 }}
                  className="h-full bg-gradient-to-r from-[#ff4655]/50 to-[#ff4655] relative"
                >
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
                </motion.div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-black/50 border border-zinc-800 p-4 rounded-xl text-center min-w-[100px]">
              <div className="text-3xl font-teko text-yellow-500">{rpgProfile?.gold || 0}</div>
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold">Credits (Gold)</div>
            </div>
            <div className="bg-black/50 border border-zinc-800 p-4 rounded-xl text-center min-w-[100px]">
              <div className="text-3xl font-teko text-purple-400">{rpgProfile?.shine || 0}</div>
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold">Shine</div>
            </div>
            <div className="bg-black/50 border border-zinc-800 p-4 rounded-xl text-center min-w-[100px]">
              <div className="text-3xl font-teko text-emerald-400">{rpgProfile?.skillpoints || 0}</div>
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold">Skill Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE ATTRIBUTES BREAKDOWN GRID */}
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center justify-between border-b border-zinc-800 pb-3">
          <span className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" /> Core Attribute Telemetry
          </span>
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-950/30 uppercase">
            LIVE SUPABASE SYNC
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              code: 'STR', 
              name: 'Strength', 
              val: skills.strength || 10, 
              desc: 'Physical endurance, execution stamina & heavy lift capacity.',
              color: 'text-red-400',
              bar: 'from-red-600 to-red-400',
              border: 'border-red-500/30'
            },
            { 
              code: 'INT', 
              name: 'Intelligence', 
              val: skills.intelligence || 10, 
              desc: 'Algorithmic deduction, systems architecture & problem solving.',
              color: 'text-blue-400',
              bar: 'from-blue-600 to-blue-400',
              border: 'border-blue-500/30'
            },
            { 
              code: 'CHR', 
              name: 'Charisma', 
              val: skills.charisma || 10, 
              desc: 'Social leadership, guild influence & team synchronization.',
              color: 'text-yellow-400',
              bar: 'from-yellow-600 to-yellow-400',
              border: 'border-yellow-500/30'
            },
            { 
              code: 'WIL', 
              name: 'Willpower', 
              val: skills.willpower || 10, 
              desc: 'Mental discipline, deep focus stamina & friction resilience.',
              color: 'text-purple-400',
              bar: 'from-purple-600 to-purple-400',
              border: 'border-purple-500/30'
            },
            { 
              code: 'CRA', 
              name: 'Craftsmanship', 
              val: skills.craftsmanship || 10, 
              desc: 'Code elegance, refactoring precision & robust engineering.',
              color: 'text-orange-400',
              bar: 'from-orange-600 to-orange-400',
              border: 'border-orange-500/30'
            },
            { 
              code: 'CRE', 
              name: 'Creativity', 
              val: skills.creativity || 10, 
              desc: 'Design innovation, lateral thinking & product vision.',
              color: 'text-emerald-400',
              bar: 'from-emerald-600 to-emerald-400',
              border: 'border-emerald-500/30'
            },
          ].map((stat, i) => {
            const pct = Math.min(100, Math.round(((stat.val % 100) / 100) * 100));
            return (
              <div 
                key={i} 
                className={`bg-black/60 border ${stat.border} rounded-xl p-4 flex flex-col justify-between hover:bg-zinc-900/40 transition-colors group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-400">{stat.code}</span>
                    <span className="text-white font-teko text-2xl uppercase tracking-wider leading-none">{stat.name}</span>
                  </div>
                  <span className={`text-3xl font-teko ${stat.color} leading-none font-bold`}>
                    {stat.val}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-500 mb-3 leading-snug">
                  {stat.desc}
                </p>
                <div>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 mb-1">
                    <span>PROGRESSION</span>
                    <span>{pct}% to Tier Next</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.bar}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Specializations / Specific Skills Chips */}
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Learned Specializations & Disciplines ({specificSkillEntries.length})
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Auto-gained from verified objectives</span>
          </div>

          {specificSkillEntries.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl text-zinc-600 font-mono text-xs uppercase">
              No specializations logged yet. Complete coding and tactical missions to unlock verified skill tags.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {specificSkillEntries.map(([skillName, points]) => (
                <div 
                  key={skillName}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-2 hover:border-cyan-400 transition-colors"
                >
                  <span className="font-mono text-xs text-white uppercase font-bold">{skillName}</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                    +{points} PTS
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Core Stats Radar */}
        <div className="xl:col-span-1 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 relative shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col">
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Hexagon className="w-5 h-5 text-cyan-400" /> Skill Matrix
          </h2>
          <div className="flex-1 min-h-[300px]">
            <PerformanceRadar />
          </div>
        </div>

        {/* Leveling Curve */}
        <div className="xl:col-span-2 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> EXP Trajectory (30 Days)</span>
            <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-mono">LIVE SYNC</span>
          </h2>
          <div className="w-full h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={levelCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#52525b" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981', fontFamily: 'monospace', fontSize: '12px' }}
                  labelStyle={{ color: '#a1a1aa', fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="xp" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Loadout / Equipment Placeholder */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Sword className="w-5 h-5 text-orange-400" /> Active Loadout
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Weapon', 'Armor', 'Relic', 'Aura'].map((slot, i) => (
              <div key={i} className="aspect-square bg-black border border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center text-zinc-600 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer group">
                <Package className="w-8 h-8 mb-2 group-hover:text-orange-400 transition-colors" />
                <span className="text-[10px] font-mono uppercase tracking-widest">{slot}</span>
                <span className="text-[8px] text-zinc-700 font-mono mt-1">EMPTY</span>
              </div>
            ))}
          </div>
        </div>

        {/* Combat Log & Official Certificates of Execution */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-purple-400" /> Combat Log & Proof Archive</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">VERIFIED TOKENS</span>
          </h2>
          <div className="space-y-4">
            {recentMissions.length === 0 ? (
              <div className="text-center p-8 text-zinc-500 font-mono text-[10px] uppercase tracking-widest border border-dashed border-zinc-800 rounded-xl">
                No recent activity logged in the matrix.
              </div>
            ) : (
              recentMissions.map((mission, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-black p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="w-10 h-10 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-teko text-xl uppercase leading-none mb-1 truncate">{mission.quests?.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                      {new Date(mission.completed_at || mission.started_at).toLocaleDateString()} // STATUS: {mission.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-[#ff4655] font-bold text-xs font-mono uppercase">+{mission.quests?.rewards?.xp || 0} EXP</div>
                      <div className="text-yellow-500 font-bold text-[10px] font-mono uppercase">+{mission.quests?.rewards?.gold || 0} CRD</div>
                    </div>
                    {mission.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => handleOpenCertificate(mission)}
                        className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400 font-mono text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                      >
                        <Award className="w-3.5 h-3.5 text-yellow-500" /> View Cert
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Render Certificate Modal when selected */}
      {selectedCert && (
        <CompletionCertificate
          isOpen={showCert}
          data={selectedCert}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
