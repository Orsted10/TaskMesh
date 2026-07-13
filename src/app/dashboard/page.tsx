'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crosshair, Activity, Target, Zap, ShieldAlert, Loader2, Play, Trash2, 
  Terminal, Cpu, Hexagon, Fingerprint, ScanEye, Flame, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PerformanceRadar } from '@/components/dashboard/performance-radar';
import { getTierAesthetic, SKILL_POOL } from '@/lib/rpg-data';
import { MarqueeTicker } from '@/components/gamified-ui';

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
          category,
          tier
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

  const handleDeleteMission = async (questId: string) => {
    if (!confirm("Are you sure you want to permanently terminate this mission?")) return;
    try {
      const res = await fetch(`/api/mission/${questId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to delete mission');
      }
      toast.success("Mission Terminated", { description: "The operation has been permanently scrubbed from the active matrix." });
      fetchActiveMissions();
    } catch (err: any) {
      toast.error('Termination Failed', { description: err.message });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.trim()) return;
    
    setIsProcessing(true);
    setGeneratedQuest(null);

    try {
      const type = (payload.startsWith('http://') || payload.startsWith('https://')) ? 'url' : 'text';

      const res = await fetch('/api/ai/quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          payload,
          userSkills: rpgProfile?.specific_skills || {}
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Failed to generate mission.');

      setGeneratedQuest(data);
      toast.success('Mission Protocol Synthesized.');
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

        if (quest.steps && quest.steps.length > 0) {
          const stepsToInsert = quest.steps.map((step: any) => ({
            quest_id: questData.id,
            order_index: step.order_index,
            title: step.title,
            instruction: step.instruction,
            verification_type: 'image',
            ai_validation_prompt: step.ai_validation_prompt,
            resources: step.resources || []
          }));
          const { error: stepsError } = await supabase.from('quest_steps').insert(stepsToInsert);
          if (stepsError) throw stepsError;
        }

        const { error: progressError } = await supabase
          .from('user_quest_progress')
          .insert({
            user_id: user.id,
            quest_id: questData.id,
            status: 'in_progress',
          });
        if (progressError) throw progressError;
      }

      toast.success('Campaign Accepted!', { description: `${generatedQuest.quests.length} missions added to active matrix.` });
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
        <div className="relative">
          <Loader2 className="w-12 h-12 text-[#ff4655] animate-spin relative z-10" />
          <div className="absolute inset-0 bg-[#ff4655] blur-xl opacity-50 animate-pulse" />
        </div>
      </div>
    );
  }

  const featuredMission = activeMissions.length > 0 
    ? [...activeMissions].sort((a, b) => (b.quests?.difficulty || 0) - (a.quests?.difficulty || 0))[0]
    : null;

  // Calculate Progress
  const currentXP = rpgProfile?.total_xp || 0;
  const xpForNextLevel = ((rpgProfile?.level || 1) * 1000);
  const progressPercent = Math.min((currentXP / xpForNextLevel) * 100, 100);

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      
      {/* GLOBAL MARQUEE */}
      <div className="w-full bg-[#ff4655]/10 border-y border-[#ff4655]/30 shadow-[0_0_20px_rgba(255,70,85,0.15)] relative z-10 rounded-sm overflow-hidden mt-[-10px]">
        <MarqueeTicker text="ACTIO GLOBAL MATRIX ONLINE // ENFORCING OPERATIONAL DIRECTIVES // PROOF OF ACTION REQUIRED //" />
      </div>

      {/* CORE HUD: PROGRESS & LEVEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        <div className="lg:col-span-8">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
            {/* Animated scanning line */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }} 
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-[#ff4655]/30 shadow-[0_0_10px_#ff4655] z-0" 
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff4655]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                {/* Level Hexagon */}
                <div className="relative flex items-center justify-center w-24 h-24">
                  <Hexagon className="w-24 h-24 text-[#ff4655] absolute inset-0 opacity-20" strokeWidth={1} />
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute inset-[-4px] border-[1px] border-dashed border-[#ff4655]/40 rounded-full" />
                  <div className="text-center relative z-10">
                    <span className="text-[#ff4655] font-bold text-[10px] tracking-widest block uppercase">Level</span>
                    <span className="text-4xl font-teko text-white leading-none">{rpgProfile?.level || 1}</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-4xl md:text-5xl font-teko text-white uppercase tracking-wider mb-1 flex items-center gap-3">
                    {rpgProfile?.username || 'OPERATIVE_01'}
                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] tracking-widest font-mono rounded">
                      TIER {rpgProfile?.mastery_tier || 'NOVICE'}
                    </span>
                  </h1>
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                    <Fingerprint className="w-3 h-3 text-emerald-500" /> Biometric Identity Confirmed
                  </p>
                </div>
              </div>

              {/* EXP Bar */}
              <div className="flex-1 w-full max-w-md">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                  <span>Current EXP: <span className="text-[#ff4655]">{currentXP}</span></span>
                  <span>Next: {xpForNextLevel}</span>
                </div>
                <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: \`\${progressPercent}%\` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#ff4655]/50 to-[#ff4655] relative"
                  >
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
                    <motion.div 
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS MATRIX */}
        <div className="lg:col-span-4 bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
          <h3 className="font-teko text-xl text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> Core Attribute Matrix
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'STR', val: rpgProfile?.attributes?.strength || 10, color: 'text-red-400', bg: 'bg-red-400/10' },
              { label: 'INT', val: rpgProfile?.attributes?.intelligence || 10, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'CHR', val: rpgProfile?.attributes?.charisma || 10, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { label: 'WIL', val: rpgProfile?.attributes?.willpower || 10, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { label: 'CRA', val: rpgProfile?.attributes?.craftsmanship || 10, color: 'text-orange-400', bg: 'bg-orange-400/10' },
              { label: 'AGI', val: rpgProfile?.attributes?.agility || 10, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                <span className={\`text-xl font-teko \${stat.color}\`}>{stat.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Mission Generator */}
        <div className="xl:col-span-8 space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_40px_rgba(255,70,85,0.05)] group"
          >
            {/* Sci-Fi Decorative Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ff4655] opacity-50" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ff4655] opacity-50" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ff4655] opacity-50" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ff4655] opacity-50" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#ff4655]/10 rounded border border-[#ff4655]/20 relative">
                  <ScanEye className="w-6 h-6 text-[#ff4655] relative z-10" />
                  <div className="absolute inset-0 bg-[#ff4655] blur-md opacity-30 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-teko text-3xl text-white uppercase tracking-wider leading-none">Objective Synthesizer</h2>
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">GROQ Llama-3-70B Logic Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest font-mono">Uplink Active</span>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
              <div className="relative group/input">
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder="Input mission parameters, target URL, or unstructured text..."
                  className="w-full h-32 bg-black/50 border border-zinc-800 rounded-xl p-5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655]/50 transition-all font-mono text-sm resize-none custom-scrollbar shadow-inner group-hover/input:border-zinc-700"
                />
                <div className="absolute right-4 bottom-4 flex items-center gap-2 opacity-50">
                  <Terminal className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isProcessing || !payload.trim()}
                className="w-full h-16 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700 hover:border-[#ff4655] hover:bg-[#ff4655]/10 text-white font-teko text-3xl tracking-[0.2em] uppercase transition-all duration-300 rounded-xl relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 group-hover/btn:opacity-20 transition-opacity" />
                <motion.div 
                  className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-[#ff4655]/20 to-transparent skew-x-12 opacity-0 group-hover/btn:opacity-100"
                  animate={{ x: ['-200%', '400%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-[#ff4655]" />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 text-[#ff4655] group-hover/btn:scale-110 transition-transform" />
                      Initialize Protocol
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Generated Campaign Preview */}
            <AnimatePresence>
              {generatedQuest && generatedQuest.quests && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 pt-8 border-t border-zinc-800"
                >
                  <div className="mb-8 p-6 bg-[#ff4655]/5 border border-[#ff4655]/20 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#ff4655] shadow-[0_0_15px_#ff4655]" />
                    <span className="text-[10px] font-bold text-[#ff4655] uppercase tracking-[0.2em] bg-[#ff4655]/10 px-3 py-1 rounded-sm border border-[#ff4655]/30">
                      CAMPAIGN GENERATED
                    </span>
                    <h3 className="font-teko text-5xl text-white uppercase leading-none mt-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                      {generatedQuest.campaign_title || 'TACTICAL OPERATION'}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-3 max-w-2xl font-mono leading-relaxed">
                      {generatedQuest.campaign_description}
                    </p>
                  </div>

                  <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 mb-8">
                    {generatedQuest.quests.map((quest: any, qIdx: number) => {
                      const aesthetic = getTierAesthetic(quest.tier);
                      return (
                        <div key={qIdx} className={\`bg-zinc-950 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group hover:border-\${aesthetic.accent.split('-')[1]}-500/50 transition-all duration-300 shadow-lg\`}>
                          <div className={\`absolute left-0 top-0 bottom-0 w-1 \${aesthetic.bg} opacity-50 group-hover:opacity-100 transition-opacity\`} />
                          
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pl-4 gap-4 relative z-10">
                            <div className="flex gap-3 items-center flex-wrap">
                              <span className={\`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm border \${aesthetic.bg} \${aesthetic.textDark} \${aesthetic.border} shadow-inner\`}>
                                {quest.tier || 'STANDARD'}
                              </span>
                              <span className="text-[10px] font-bold text-[#ff4655] uppercase tracking-widest bg-[#ff4655]/10 px-3 py-1.5 rounded-sm border border-[#ff4655]/20 shadow-inner">
                                LVL {quest.difficulty}
                              </span>
                            </div>
                            
                            <div className="bg-black border border-zinc-800 rounded-lg p-2.5 flex items-center gap-4 shadow-inner">
                              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> +{quest.rewards?.gold || 10}
                              </span>
                              <span className="text-[10px] font-bold text-[#ff4655] uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4655]" /> +{quest.rewards?.xp || 100}
                              </span>
                            </div>
                          </div>
                          
                          <h4 className={\`font-teko text-4xl text-white uppercase leading-none pl-4 mb-3 transition-colors duration-300 group-hover:\${aesthetic.text}\`}>{quest.title}</h4>
                          <p className="text-zinc-400 text-sm pl-4 mb-6 max-w-3xl font-mono">{quest.description}</p>
                          
                          <div className="pl-4 space-y-3 relative z-10 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/80">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2">
                              <Target className="w-3 h-3" /> Tactical Objectives ({quest.steps?.length})
                            </div>
                            {quest.steps?.slice(0, 3).map((step: any, i: number) => (
                              <div key={i} className="flex gap-4 text-sm text-zinc-300 items-start p-2 hover:bg-zinc-800/50 rounded transition-colors">
                                <span className={\`font-mono text-[10px] mt-1 \${aesthetic.text} font-bold\`}>0{i+1}</span>
                                <span className="leading-relaxed font-mono text-xs">{step.title}</span>
                              </div>
                            ))}
                            {quest.steps?.length > 3 && (
                              <div className="text-[10px] text-zinc-500 italic pl-8 mt-2 border-t border-zinc-800 pt-2 font-mono">
                                + {quest.steps.length - 3} classified objectives hidden
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button onClick={() => setGeneratedQuest(null)} variant="outline" className="flex-1 bg-black border border-zinc-800 hover:bg-red-950/20 text-zinc-400 hover:text-red-500 hover:border-red-900 uppercase tracking-[0.2em] font-bold h-14 transition-all">
                      Scrub Data
                    </Button>
                    <Button onClick={handleAcceptMission} disabled={isAccepting} className="flex-[2] bg-[#ff4655] hover:bg-[#ff4655]/90 text-white uppercase tracking-[0.2em] font-bold h-14 shadow-[0_0_30px_rgba(255,70,85,0.4)] text-xl font-teko group">
                      {isAccepting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                          Commit to Matrix <Crosshair className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Performance & Active Ops */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Active Operations List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[500px] shadow-[0_0_30px_rgba(0,0,0,0.5)] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4655]/5 blur-3xl" />
            <div className="flex items-center justify-between mb-6 relative z-10 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-[#ff4655] animate-pulse" />
                <h2 className="font-teko text-3xl text-white uppercase tracking-widest leading-none">Active Ops</h2>
              </div>
              <span className="bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono text-[10px] px-2 py-1 rounded shadow-inner">
                {activeMissions.length} ONLINE
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar relative z-10">
              {activeMissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center opacity-50 h-full border border-dashed border-zinc-800 rounded-xl m-2 bg-black/50">
                  <Flame className="w-8 h-8 text-zinc-600 mb-4" />
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">No Operations Found</p>
                </div>
              ) : (
                activeMissions.map((mission) => {
                  const aesthetic = getTierAesthetic(mission.quests?.tier);
                  return (
                    <div 
                      key={mission.id} 
                      className="bg-black border border-zinc-800 p-4 rounded-xl hover:border-[#ff4655]/50 transition-all duration-300 group/item cursor-pointer relative overflow-hidden shadow-md hover:shadow-[0_0_20px_rgba(255,70,85,0.15)]"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-700 group-hover/item:bg-[#ff4655] transition-colors duration-500" />
                      
                      <div className="flex justify-between items-start mb-3 pl-2">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] border border-zinc-800 px-2 py-0.5 rounded shadow-inner">
                          LVL {mission.quests?.difficulty || 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-mono">{mission.quests?.category || 'General'}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteMission(mission.quests?.id); }}
                            className="text-zinc-600 hover:text-[#ff4655] transition-colors p-1.5 rounded-md hover:bg-[#ff4655]/10 border border-transparent hover:border-[#ff4655]/20"
                            title="Terminate Mission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 
                        onClick={() => router.push(`/mission/${mission.quests?.id}`)} 
                        className="font-teko text-2xl text-zinc-300 uppercase leading-none truncate group-hover/item:text-white transition-colors pl-2 pr-2"
                      >
                        {mission.quests?.title || 'Unknown Protocol'}
                      </h4>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Performance Radar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl" />
            <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="font-teko text-3xl text-white uppercase tracking-widest leading-none">Radar</h2>
            </div>
            <PerformanceRadar />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
