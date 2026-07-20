'use client';

import { motion } from 'framer-motion';
import { Shield, Swords, Castle, Flag, Users, Cpu, Server, Box, PlusCircle, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export default function GuildsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'base'>('leaderboard');
  const [guilds, setGuilds] = useState<any[]>([]);
  const [myGuild, setMyGuild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuildData = async () => {
      if (!user) return;
      
      try {
        // Fetch Top Guilds
        const { data: leaderboardData } = await supabase
          .from('guilds')
          .select('*')
          .order('total_exp', { ascending: false })
          .limit(10);
        
        if (leaderboardData) setGuilds(leaderboardData);

        // Fetch My Guild
        const { data: memberData } = await supabase
          .from('guild_members')
          .select('*, guilds(*)')
          .eq('user_id', user.id)
          .single();

        if (memberData?.guilds) {
          setMyGuild(memberData.guilds);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuildData();
  }, [user]);

  const handleCreateGuild = async () => {
    toast.error('Guild Creation requires Level 10 and 5,000 A-Coins.');
  };

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
                  {guilds.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                        NO FACTIONS DETECTED IN SECTOR.
                      </td>
                    </tr>
                  ) : (
                    guilds.map((guild, index) => {
                      const rank = index + 1;
                      const isTop = rank === 1;
                      return (
                        <tr key={guild.id} className={`hover:bg-zinc-900/50 transition-colors ${isTop ? 'border-l-4 border-l-fuchsia-500' : ''}`}>
                          <td className="px-6 py-4">
                            <span className={`font-teko text-2xl ${isTop ? 'text-fuchsia-500' : 'text-zinc-500'}`}>#{rank}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-teko text-2xl text-white uppercase tracking-wider">{guild.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                              LEVEL {guild.level || 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono text-lg text-yellow-500 font-bold">{guild.total_exp?.toLocaleString() || 0}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
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

              {myGuild ? (
                <>
                  <div className="text-center mb-8 relative z-10">
                    <div className="w-24 h-24 mx-auto border-2 border-fuchsia-500 bg-fuchsia-500/20 rotate-45 rounded flex items-center justify-center mb-6">
                      <div className="-rotate-45 font-teko text-5xl text-white">{myGuild.name.substring(0, 2).toUpperCase()}</div>
                    </div>
                    <h3 className="font-teko text-4xl text-fuchsia-500 uppercase tracking-widest leading-none">{myGuild.name}</h3>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mt-2">Level {myGuild.level} • EXP: {myGuild.total_exp}</p>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <button className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-black py-3 rounded font-teko text-xl uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                      Donate Resources
                    </button>
                    <button className="w-full bg-black border border-zinc-800 hover:border-zinc-600 text-white py-3 rounded font-teko text-xl uppercase tracking-widest transition-colors">
                      Guild Chat
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 relative z-10">
                  <Shield className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                  <h3 className="font-teko text-3xl text-white uppercase tracking-widest mb-2">No Faction Assigned</h3>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-8">Join a guild to access Faction Wars and Base Modules.</p>
                  <div className="space-y-4">
                    <button onClick={handleCreateGuild} className="w-full flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-black py-3 rounded font-teko text-xl uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                      <PlusCircle className="w-5 h-5" /> Establish Faction
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 bg-black border border-zinc-800 hover:border-zinc-600 text-white py-3 rounded font-teko text-xl uppercase tracking-widest transition-colors">
                      <LogIn className="w-5 h-5" /> Browse Factions
                    </button>
                  </div>
                </div>
              )}
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
