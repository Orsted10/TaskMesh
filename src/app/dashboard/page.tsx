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
import { getTierAesthetic } from '@/lib/rpg-data';

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
    if (!user || !generatedQuest || !generatedQuest.quests) return;
    setIsAccepting(true);

    try {
      for (const quest of generatedQuest.quests) {
        // Insert Quest
        const { data: questData, error: questError } = await supabase
          .from('quests')
          .insert({
            title: quest.title,
            description: quest.description,
            category: quest.category,
            difficulty: quest.difficulty,
            tier: quest.tier,
            mission_type: quest.mission_type,
            rewards: quest.rewards,
            creator_id: user.id,
          })
          .select()
          .single();
        if (questError) throw questError;

        // Insert Steps
        if (quest.steps && quest.steps.length > 0) {
          const stepsToInsert = quest.steps.map((step: any) => ({
            quest_id: questData.id,
            order_index: step.order_index,
            title: step.title,
            instruction: step.instruction,
            verification_type: 'image',
            ai_validation_prompt: step.ai_validation_prompt,
          }));
          const { error: stepsError } = await supabase.from('quest_steps').insert(stepsToInsert);
          if (stepsError) throw stepsError;
        }

        // Insert Progress
        const { error: progressError } = await supabase
          .from('user_quest_progress')
          .insert({
            user_id: user.id,
            quest_id: questData.id,
            status: 'in_progress',
          });
        if (progressError) throw progressError;
      }

      toast.success('Campaign Accepted!', { description: `${generatedQuest.quests.length} missions added to active operations.` });
      setGeneratedQuest(null);
      setPayload('');
      fetchActiveMissions();

    } catch (err: any) {
      toast.error('Failed to accept campaign', { description: err.message });
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

  // Dynamic Background based on category - Using Abstract/Cyberpunk/Valorant style aesthetic
  const getHeroBackground = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'strength': return 'https://images.unsplash.com/photo-1614850715649-1d0106293cb1?q=80&w=2070&auto=format&fit=crop'; // Red neon abstract
      case 'intelligence': return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'; // Cyber security / neural
      case 'charisma': return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop'; // Neon abstract
      case 'creativity': return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop'; // 3D abstract liquid
      case 'craftsmanship': return 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop'; // Tech / circuit abstract
      case 'willpower': return 'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2070&auto=format&fit=crop'; // Dark geometric monolith
      default: return 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop'; 
    }
  };

  const heroBg = featuredMission ? getHeroBackground(featuredMission.quests?.category) : getHeroBackground('default');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full min-h-[350px] bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden group shadow-[0_0_50px_rgba(255,70,85,0.05)] dark:shadow-[0_0_50px_rgba(255,70,85,0.1)] flex flex-col justify-center"
      >
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40 dark:from-zinc-950 dark:via-zinc-950/90 dark:to-zinc-950/40 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-50 group-hover:scale-105 transition-transform duration-[20s] mix-blend-luminosity ease-linear"
          style={{ backgroundImage: `url('${heroBg}')` }}
        />
        <div className="absolute inset-0 bg-[#ff4655]/5 dark:bg-[#ff4655]/10 z-10 mix-blend-overlay" />
        
        {/* Animated Cyber Grid */}
        <div className="absolute inset-0 z-10 opacity-30 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-20 h-full p-8 md:p-14 flex flex-col justify-center max-w-4xl">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/50 dark:bg-zinc-950/50 w-fit px-4 py-2 rounded-full border border-gray-200 dark:border-zinc-800/80 backdrop-blur-sm">
            <span className="w-2 h-2 bg-[#ff4655] rounded-full animate-pulse shadow-[0_0_10px_#ff4655]" />
            <span className="text-gray-600 dark:text-zinc-300 text-xs font-bold tracking-[0.2em] uppercase">
              {featuredMission ? 'Active Priority Protocol' : 'System Awaiting Directives'}
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-teko text-zinc-900 dark:text-white uppercase leading-none drop-shadow-2xl mb-6 tracking-wide group-hover:text-[#ff4655] dark:group-hover:text-[#ff4655] transition-colors duration-500 line-clamp-3">
            {featuredMission ? featuredMission.quests?.title : 'DEFEAT TUTORIAL HELL'}
          </h1>
          
          <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg mb-10 font-light max-w-xl">
            {featuredMission 
              ? 'Your high-priority mission is currently active. Engage now to secure your EXP and cryptographic proof of action.' 
              : 'Generate your first mission to begin your ascent. Convert any task, tutorial, or goal into a highly structured RPG quest.'}
          </p>

          <button 
            onClick={() => featuredMission ? router.push(`/mission/${featuredMission.quests?.id}`) : null}
            className="group/btn relative w-fit h-14 bg-[#ff4655] text-white font-teko text-2xl tracking-[0.15em] uppercase px-10 overflow-hidden"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            <div className="absolute inset-0 bg-white translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
            <div className="relative z-10 flex items-center gap-3 group-hover/btn:text-[#ff4655] transition-colors duration-300">
              <Play className="w-5 h-5 fill-current" />
              {featuredMission ? 'Resume Operation' : 'Initialize Generator'}
            </div>
            
            {/* Glitch sub-element */}
            <div className="absolute top-0 right-0 w-2 h-2 bg-zinc-950 z-20 group-hover/btn:bg-[#ff4655] transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-zinc-950 z-20 group-hover/btn:bg-[#ff4655] transition-colors" />
          </button>
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
            className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden transition-colors duration-300"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#ff4655]/5 blur-2xl" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#ff4655]" />
                <h2 className="font-teko text-2xl text-zinc-900 dark:text-white uppercase tracking-wider">Mission Generator</h2>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest border border-gray-200 dark:border-zinc-800 px-2 py-1 rounded">GROQ TACTICAL AI</span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 relative z-10">
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="Paste a URL (YouTube, Article, Docs) or type your objective..."
                className="w-full h-32 bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#ff4655]/50 focus:ring-1 focus:ring-[#ff4655]/50 transition-all font-mono text-sm resize-none custom-scrollbar"
              />
              <Button
                type="submit"
                disabled={isProcessing || !payload.trim()}
                className="w-full h-14 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-teko text-2xl tracking-widest uppercase transition-all duration-300 rounded-xl"
              >
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin text-[#ff4655]" /> : 'Extract Mission Protocol'}
              </Button>
            </form>

            {/* Generated Campaign Preview */}
            {generatedQuest && generatedQuest.quests && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800"
              >
                <div className="mb-6 border-l-2 border-[#ff4655] pl-4">
                  <span className="text-[10px] font-bold text-[#ff4655] uppercase tracking-widest bg-[#ff4655]/10 px-2 py-1 rounded">CAMPAIGN BRIEFING</span>
                  <h3 className="font-teko text-4xl text-zinc-900 dark:text-white uppercase leading-none mt-2">{generatedQuest.campaign_title || 'TACTICAL OPERATION'}</h3>
                  <p className="text-zinc-500 text-sm mt-1">{generatedQuest.campaign_description}</p>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 mb-6">
                  {generatedQuest.quests.map((quest: any, qIdx: number) => {
                    const aesthetic = getTierAesthetic(quest.tier);
                    return (
                      <div key={qIdx} className={`bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.01] hover:${aesthetic.glow}`}>
                        {/* Glow / Accent Borders */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-zinc-300 dark:bg-zinc-800 group-hover:${aesthetic.accent} transition-colors duration-500`} />
                        <div className={`absolute right-0 top-0 w-16 h-16 ${aesthetic.bg} blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pl-2 gap-4 relative z-10">
                          <div className="flex gap-2 items-center flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border ${aesthetic.bg} ${aesthetic.textDark} ${aesthetic.border} shadow-inner`}>
                              {quest.tier || 'STANDARD'}
                            </span>
                            <span className="text-[10px] font-bold text-[#ff4655] uppercase tracking-widest bg-[#ff4655]/10 px-3 py-1 rounded border border-[#ff4655]/20 shadow-inner">
                              LVL {quest.difficulty}
                            </span>
                            {quest.mission_type && (
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {quest.mission_type}
                              </span>
                            )}
                          </div>
                          
                          <div className="bg-zinc-900/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 flex items-center gap-3 shadow-inner">
                            <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest">
                              <span className="text-zinc-500 mr-1">GOLD</span> +{quest.rewards?.gold || 10}
                            </span>
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                              <span className="text-zinc-500 mr-1">SHINE</span> +{quest.rewards?.shine || 0}
                            </span>
                            <span className="text-[10px] font-bold text-[#ff4655] uppercase tracking-widest">
                              <span className="text-zinc-500 mr-1">EXP</span> +{quest.rewards?.xp || 100}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                              <span className="text-zinc-500 mr-1">SP</span> +{quest.rewards?.skillpoints || 0}
                            </span>
                          </div>
                        </div>
                        
                        <h4 className={`font-teko text-3xl text-zinc-900 dark:text-white uppercase leading-none pl-2 mb-2 transition-colors duration-300 group-hover:${aesthetic.text}`}>{quest.title}</h4>
                        <p className="text-zinc-500 text-sm pl-2 mb-6 max-w-3xl">{quest.description}</p>
                        
                        {quest.rewards?.specific_skills && quest.rewards.specific_skills.length > 0 && (
                          <div className="pl-2 flex gap-2 flex-wrap mb-6">
                            {quest.rewards.specific_skills.map((skill: any, idx: number) => (
                              <span key={idx} className="text-[10px] font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                +{skill.value} {skill.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pl-2 space-y-2 relative z-10 bg-white/50 dark:bg-zinc-900/30 p-3 rounded-lg border border-gray-100 dark:border-zinc-800/50">
                          <div className="text-[9px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Tactical Objectives</div>
                          {quest.steps?.slice(0, 3).map((step: any, i: number) => (
                            <div key={i} className="flex gap-3 text-xs text-zinc-600 dark:text-zinc-400 items-start">
                              <span className={`font-mono text-[10px] mt-0.5 ${aesthetic.text}`}>0{i+1}</span>
                              <span className="leading-tight">{step.title}</span>
                            </div>
                          ))}
                          {quest.steps?.length > 3 && (
                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 italic pl-6 mt-2">+ {quest.steps.length - 3} more hidden objectives</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => setGeneratedQuest(null)} variant="outline" className="flex-1 bg-transparent border-gray-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest font-bold">Abort</Button>
                  <Button onClick={handleAcceptMission} disabled={isAccepting} className="flex-1 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white uppercase tracking-widest font-bold h-12 shadow-[0_0_20px_rgba(255,70,85,0.3)]">
                    {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accept Campaign'}
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Global Intel Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden transition-colors duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <Activity className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              </div>
              <h2 className="font-teko text-3xl text-zinc-900 dark:text-white uppercase tracking-wider">Global Intel Feed</h2>
            </div>
            
            <div className="space-y-3 relative z-10">
              {[
                { user: 'Kael', action: 'completed mission', quest: 'Advanced Next.js Routing', time: '2m ago', color: 'text-[#ff4655]', bg: 'bg-[#ff4655]/10', border: 'border-[#ff4655]/20' },
                { user: 'Sova', action: 'accepted bounty', quest: 'Fix Postgres RLS Policies', time: '15m ago', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                { user: 'Viper', action: 'leveled up to', quest: 'Level 12', time: '1h ago', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                { user: 'Omen', action: 'gained 500 EXP from', quest: 'Backend Optimization', time: '3h ago', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800/80 rounded-xl hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-zinc-900 dark:text-white ${item.bg} ${item.border} border shadow-inner`}>
                      {item.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-bold text-zinc-900 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">{item.user}</span> {item.action}{' '}
                        <span className={`font-medium ${item.color}`}>{item.quest}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-600 font-mono bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-gray-200 dark:border-zinc-800">{item.time}</span>
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
            className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 transition-colors duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="font-teko text-2xl text-zinc-900 dark:text-white uppercase tracking-wider">Performance Radar</h2>
            </div>
            <p className="text-xs text-zinc-500 mb-4 font-mono">STATISTICAL ANALYSIS OF CORE ATTRIBUTES</p>
            <PerformanceRadar />
          </motion.div>

          {/* Active Operations List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col h-[400px] transition-colors duration-300"
          >
            <div className="flex items-center gap-2 mb-6">
              <Crosshair className="w-5 h-5 text-[#ff4655]" />
              <h2 className="font-teko text-2xl text-zinc-900 dark:text-white uppercase tracking-wider">Active Operations</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {activeMissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center opacity-50 h-full min-h-[150px]">
                  <ShieldAlert className="w-8 h-8 text-zinc-500 dark:text-zinc-600 mb-4" />
                  <p className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">No Active Missions</p>
                </div>
              ) : (
                activeMissions.map((mission) => (
                  <div 
                    key={mission.id} 
                    onClick={() => router.push(`/mission/${mission.quests?.id}`)}
                    className="bg-gray-50 dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 p-4 rounded-xl hover:border-[#ff4655]/50 transition-colors group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff4655] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(255,70,85,0.8)]" />
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <span className="text-[10px] font-bold text-[#ff4655] uppercase tracking-wider bg-[#ff4655]/10 px-2 py-0.5 rounded border border-[#ff4655]/20">
                        LVL {mission.quests?.difficulty || 1}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{mission.quests?.category || 'General'}</span>
                    </div>
                    <h4 className="font-teko text-xl text-zinc-800 dark:text-zinc-200 uppercase leading-none truncate group-hover:text-[#ff4655] dark:group-hover:text-white transition-colors pl-2">{mission.quests?.title || 'Unknown Protocol'}</h4>
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
