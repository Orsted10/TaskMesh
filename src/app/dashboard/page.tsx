'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crosshair, Activity, Target, Zap, ShieldAlert, Loader2, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PerformanceRadar } from '@/components/dashboard/performance-radar';

export default function Dashboard() {
  const { user, rpgProfile, loading } = useAuth();
  const router = useRouter();
  
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [payload, setPayload] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedQuest, setGeneratedQuest] = useState<any>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const fetchActiveMissions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_quest_progress')
      .select(`
        id,
        status,
        quests (
          id,
          title,
          difficulty,
          category
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false });
    
    if (!error && data) {
      setActiveMissions(data);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActiveMissions();
    }
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.trim()) return;
    
    setIsProcessing(true);
    setGeneratedQuest(null);

    try {
      // Auto detect if it's a URL
      const type = (payload.startsWith('http://') || payload.startsWith('https://')) ? 'url' : 'text';

      const res = await fetch('/api/ai/quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Failed to generate mission.');

      setGeneratedQuest(data);
      toast.success('Mission Generated Successfully.');
    } catch (err: any) {
      toast.error('AI Engine Error', { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptMission = async () => {
    if (!user || !generatedQuest) return;
    setIsAccepting(true);

    try {
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .insert({
          title: generatedQuest.quest.title,
          description: generatedQuest.quest.description,
          category: generatedQuest.quest.category,
          difficulty: generatedQuest.quest.difficulty,
          creator_id: user.id,
        })
        .select()
        .single();
      if (questError) throw questError;

      const stepsToInsert = generatedQuest.steps.map((step: any) => ({
        quest_id: questData.id,
        order_index: step.order_index,
        title: step.title,
        instruction: step.instruction,
        estimated_time_seconds: step.estimated_time_seconds,
        verification_type: step.verification_type,
        ai_validation_prompt: step.ai_validation_prompt,
      }));

      const { error: stepsError } = await supabase.from('quest_steps').insert(stepsToInsert);
      if (stepsError) throw stepsError;

      const { error: progressError } = await supabase
        .from('user_quest_progress')
        .insert({
          user_id: user.id,
          quest_id: questData.id,
          status: 'in_progress',
        });
      if (progressError) throw progressError;

      toast.success('Mission Accepted!', { description: 'Added to your active operations.' });
      setGeneratedQuest(null);
      setPayload('');
      fetchActiveMissions();

    } catch (err: any) {
      toast.error('Failed to accept mission', { description: err.message });
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff4655] animate-spin" />
      </div>
    );
  }

  // Find the highest level active mission to feature in the Hero Banner
  const featuredMission = activeMissions.length > 0 
    ? [...activeMissions].sort((a, b) => (b.quests?.difficulty || 0) - (a.quests?.difficulty || 0))[0]
    : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full h-[300px] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group shadow-2xl"
      >
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-1000 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-[#ff4655]/10 z-10 mix-blend-overlay" />

        {/* Content */}
        <div className="relative z-20 h-full p-8 md:p-12 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#ff4655] rounded-full animate-pulse shadow-[0_0_10px_#ff4655]" />
            <span className="text-[#ff4655] text-xs font-bold tracking-[0.2em] uppercase">Priority Protocol</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-teko text-white uppercase leading-none drop-shadow-lg mb-2">
            {featuredMission ? featuredMission.quests?.title : 'DEFEAT TUTORIAL HELL'}
          </h1>
          
          <p className="text-zinc-400 max-w-xl text-sm md:text-base mb-8">
            {featuredMission 
              ? 'Your high-priority mission is currently active. Engage now to secure your EXP and cryptographic proof of action.' 
              : 'Generate your first mission to begin your ascent. Convert any task, tutorial, or goal into a highly structured RPG quest.'}
          </p>

          <Button 
            onClick={() => featuredMission ? router.push(`/mission/${featuredMission.quests?.id}`) : null}
            className="w-fit bg-[#ff4655] hover:bg-[#ff4655]/90 text-white font-bold tracking-widest uppercase rounded-lg px-8 h-12"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            {featuredMission ? 'Resume Operation' : 'Initialize Generator'}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Intel & Generator */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* AI Mission Generator */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#ff4655]/5 blur-2xl" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#ff4655]" />
                <h2 className="font-teko text-2xl text-white uppercase tracking-wider">Mission Generator</h2>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest border border-zinc-800 px-2 py-1 rounded">GROQ TACTICAL AI</span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 relative z-10">
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="Paste a URL (YouTube, Article, Docs) or type your objective..."
                className="w-full h-32 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff4655]/50 focus:ring-1 focus:ring-[#ff4655]/50 transition-all font-mono text-sm resize-none custom-scrollbar"
              />
              <Button
                type="submit"
                disabled={isProcessing || !payload.trim()}
                className="w-full h-14 bg-zinc-800 hover:bg-zinc-700 text-white font-teko text-2xl tracking-widest uppercase transition-all duration-300 rounded-xl"
              >
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin text-[#ff4655]" /> : 'Extract Mission Protocol'}
              </Button>
            </form>

            {/* Generated Quest Preview */}
            {generatedQuest && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-zinc-800"
              >
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#ff4655] uppercase tracking-widest bg-[#ff4655]/10 px-2 py-1 rounded border border-[#ff4655]/20">
                          LVL {generatedQuest.quest.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          {generatedQuest.quest.category}
                        </span>
                      </div>
                      <h3 className="font-teko text-3xl text-white uppercase leading-none">{generatedQuest.quest.title}</h3>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm mb-6">{generatedQuest.quest.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {generatedQuest.steps.slice(0, 3).map((step: any, i: number) => (
                      <div key={i} className="flex gap-3 text-sm text-zinc-500">
                        <span className="text-zinc-700 font-mono">0{i+1}</span>
                        <span className="truncate">{step.title}</span>
                      </div>
                    ))}
                    {generatedQuest.steps.length > 3 && (
                      <div className="text-xs text-zinc-600 italic pl-7">+ {generatedQuest.steps.length - 3} more steps</div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => setGeneratedQuest(null)} variant="outline" className="flex-1 bg-transparent border-zinc-700 text-zinc-400 hover:text-white uppercase tracking-widest font-bold">Abort</Button>
                    <Button onClick={handleAcceptMission} disabled={isAccepting} className="flex-1 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white uppercase tracking-widest font-bold">
                      {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accept Mission'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Global Intel Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-cyan-500" />
              <h2 className="font-teko text-2xl text-white uppercase tracking-wider">Global Intel Feed</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { user: 'Kael', action: 'completed mission', quest: 'Advanced Next.js Routing', time: '2m ago', color: 'text-[#ff4655]' },
                { user: 'Sova', action: 'accepted bounty', quest: 'Fix Postgres RLS Policies', time: '15m ago', color: 'text-cyan-500' },
                { user: 'Viper', action: 'leveled up to', quest: 'Level 12', time: '1h ago', color: 'text-green-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl hover:bg-zinc-900 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                      {item.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-300">
                        <span className="font-bold text-white">{item.user}</span> {item.action} <span className={item.color}>{item.quest}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-600 font-mono">{item.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: Active Operations & Radar */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Performance Radar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="font-teko text-2xl text-white uppercase tracking-wider">Performance Radar</h2>
            </div>
            <p className="text-xs text-zinc-500 mb-4 font-mono">STATISTICAL ANALYSIS OF CORE ATTRIBUTES</p>
            <PerformanceRadar />
          </motion.div>

          {/* Active Operations List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 flex flex-col h-[400px]"
          >
            <div className="flex items-center gap-2 mb-6">
              <Crosshair className="w-5 h-5 text-[#ff4655]" />
              <h2 className="font-teko text-2xl text-white uppercase tracking-wider">Active Operations</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {activeMissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center opacity-50 h-full min-h-[150px]">
                  <ShieldAlert className="w-8 h-8 text-zinc-600 mb-4" />
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">No Active Missions</p>
                </div>
              ) : (
                activeMissions.map((mission) => (
                  <div 
                    key={mission.id} 
                    onClick={() => router.push(`/mission/${mission.quests?.id}`)}
                    className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl hover:border-[#ff4655]/50 transition-colors group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff4655] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(255,70,85,0.8)]" />
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <span className="text-[10px] font-bold text-[#ff4655] uppercase tracking-wider bg-[#ff4655]/10 px-2 py-0.5 rounded border border-[#ff4655]/20">
                        LVL {mission.quests?.difficulty || 1}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{mission.quests?.category || 'General'}</span>
                    </div>
                    <h4 className="font-teko text-xl text-zinc-200 uppercase leading-none truncate group-hover:text-white transition-colors pl-2">{mission.quests?.title || 'Unknown Protocol'}</h4>
                  </div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
