'use client';

import { motion } from 'framer-motion';
import { Radar, Crosshair, Globe, AlertTriangle, Fingerprint, MapPin, Zap } from 'lucide-react';
import { MarqueeTicker } from '@/components/gamified-ui';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function GlobalIntelPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [bountyTotal, setBountyTotal] = useState(4281); // Mock for now until we aggregate real bounties

  useEffect(() => {
    const fetchFeed = async () => {
      const { data } = await supabase
        .from('feed_events')
        .select(`
          id, event_type, title, color, created_at,
          users ( username )
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setFeed(data);
    };
    
    fetchFeed();

    const channel = supabase.channel('public:feed_events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_events' }, payload => {
        supabase.from('feed_events').select(`id, event_type, title, color, created_at, users(username)`).eq('id', payload.new.id).single().then(({ data }) => {
          if (data) {
            setFeed(prev => [data, ...prev].slice(0, 50));
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      <div className="w-full bg-[#10b981]/10 border-y border-[#10b981]/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative z-10 rounded-sm overflow-hidden mt-[-10px]">
        <MarqueeTicker text="GLOBAL NETWORK TRAFFIC: SECURE // 4,209 BOUNTIES ACTIVE // 12,042 OPERATIVES ONLINE //" reverse />
      </div>

      <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
        <Radar className="w-8 h-8 text-[#10b981] animate-spin-slow" />
        <h1 className="text-5xl font-teko text-white uppercase tracking-wider">Global Intel</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COL: The Proof Feed */}
        <div className="xl:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] h-[800px] flex flex-col"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
            <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Globe className="w-5 h-5 text-blue-500" /> The Proof Feed
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {feed.length === 0 ? (
                <div className="text-center p-8 text-zinc-500 font-mono text-[10px] uppercase tracking-widest border border-dashed border-zinc-800 rounded-xl">
                  AWAITING INTEL... NO EVENTS FOUND.
                </div>
              ) : (
                feed.map((log) => (
                  <div key={log.id} className="bg-black/50 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2 relative group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1">
                        <Fingerprint className="w-3 h-3 text-zinc-700" /> {log.users?.username || 'GHOST_OPERATIVE'}
                      </span>
                      <span className="text-[9px] text-zinc-600 font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="font-teko text-xl text-white uppercase tracking-wider flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${log.color.replace('text', 'bg')}`} />
                      {log.title}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COL: Bounties & World Boss */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* World Boss */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-black border border-red-900/50 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.1)] group"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl rounded-full" />
            
            <div className="flex justify-between items-start relative z-10 mb-8">
              <div>
                <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest font-mono mb-3 inline-block">
                  WORLD BOSS EVENT
                </span>
                <h2 className="font-teko text-5xl text-white uppercase tracking-wider leading-none">Operation: Clean Oceans</h2>
                <p className="text-zinc-400 font-mono text-sm mt-2">Global directive to map and clear 10,000 lbs of shoreline debris.</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-teko text-red-500">4,281 / 10,000</span>
                <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-mono">LBS CLEARED</span>
              </div>
            </div>

            <div className="h-6 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative z-10">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: '42%' }} transition={{ duration: 2 }}
                className="h-full bg-gradient-to-r from-red-900 to-red-500 relative"
              >
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Local Bounty Radar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-emerald-500" /> Local Bounty Board
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Audit Wheelchair Ramps', corp: 'City Council', reward: '$50 + 500 EXP', loc: 'Downtown', rarity: 'border-emerald-500/50' },
                { title: 'Translate Legal Docs', corp: 'NGO Legal Aid', reward: '$120 + 1000 EXP', loc: 'Remote', rarity: 'border-purple-500/50' },
                { title: 'Fix Pothole #402', corp: 'Civic Guild', reward: '300 EXP', loc: 'Northside', rarity: 'border-blue-500/50' },
                { title: 'Security Audit', corp: 'Tech Corp', reward: '$500 + 2500 EXP', loc: 'Remote', rarity: 'border-yellow-500/50' },
              ].map((bounty, i) => (
                <div key={i} className={`bg-black border ${bounty.rarity} p-6 rounded-xl relative overflow-hidden group hover:bg-zinc-900/50 transition-colors cursor-pointer`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {bounty.loc}
                    </span>
                    <span className="bg-zinc-900 px-2 py-1 rounded text-[9px] text-zinc-400 font-mono border border-zinc-800">
                      {bounty.corp}
                    </span>
                  </div>
                  <h3 className="font-teko text-2xl text-white uppercase mb-2 group-hover:text-emerald-400 transition-colors">{bounty.title}</h3>
                  <div className="text-[12px] font-bold text-yellow-500 uppercase tracking-widest font-mono">
                    Reward: {bounty.reward}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
