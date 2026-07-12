'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Link as LinkIcon, Type, Cpu, Crosshair, ShieldAlert, 
  Activity, User as UserIcon, Zap, Target, Trophy, Clock, Loader2,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type QuestStep = {
  order_index: number;
  title: string;
  instruction: string;
  estimated_time_seconds: number;
  verification_type: string;
  ai_validation_prompt: string;
};

type GeneratedQuest = {
  quest: {
    title: string;
    description: string;
    category: string;
    difficulty: number;
    estimated_time_minutes: number;
  };
  steps: QuestStep[];
};

export default function Dashboard() {
  const { user, rpgProfile, loading } = useAuth();
  const router = useRouter();
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [payload, setPayload] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedQuest, setGeneratedQuest] = useState<GeneratedQuest | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const [activeMissions, setActiveMissions] = useState<any[]>([]);

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
      const res = await fetch('/api/ai/quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: inputType, payload }),
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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

      const stepsToInsert = generatedQuest.steps.map(step => ({
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully.');
    router.push('/');
  };

  // Determine display name (Google Auth full name -> RPG Username -> fallback)
  const displayName = user?.user_metadata?.full_name || rpgProfile?.username || 'AGENT';
  
  // Calculate Progress
  const currentExp = rpgProfile?.total_exp || 0;
  const currentLevel = rpgProfile?.level || 1;
  const nextLevelExp = currentLevel * 1000;
  const progressPercent = Math.min(100, Math.max(0, (currentExp / nextLevelExp) * 100));

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff4655] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-[#ff4655]/30 pt-24 pb-20 relative overflow-hidden">
      
      {/* GLITCH & GRID EFFECTS (Same as Landing Page) */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none mix-blend-screen" />
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff4655]/40 to-transparent shadow-[0_0_15px_rgba(255,70,85,0.4)]" />
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#ff4655]/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

      {/* TOP DECORATION */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-30 text-[10px] font-mono tracking-[0.3em] text-[#ff4655] pointer-events-none z-0">
        <span className="w-12 h-px bg-[#ff4655]" />
        SYSTEM SECURE /// SESSION ACTIVE
        <span className="w-12 h-px bg-[#ff4655]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-8">
        
        {/* HEADER: MASSIVE TYPOGRAPHY (Like Landing Page) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl lg:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-500 font-teko leading-[0.8]"
            >
              COMMAND<br />
              <span className="text-[#ff4655] inline-block -skew-x-12 px-2 border-l-8 border-[#ff4655] bg-gradient-to-r from-[#ff4655]/20 to-transparent">
                CENTER.
              </span>
            </motion.h1>
            <p className="text-zinc-400 mt-6 max-w-xl text-lg border-l-2 border-zinc-800 pl-4 font-mono text-sm uppercase tracking-widest">
              Welcome back, <span className="text-white font-bold">{displayName}</span>. <br/> Initialize your next operation below.
            </p>
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-zinc-800 hover:bg-[#ff4655]/10 hover:text-[#ff4655] hover:border-[#ff4655]/30 text-zinc-400 font-bold uppercase tracking-widest transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" /> Terminate Session
          </Button>
        </div>

        {/* MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT: PLAYER PROFILE (TECH HUD STYLE) */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900/50 backdrop-blur-xl border-t border-l border-zinc-800/50 rounded-none relative p-8 shadow-2xl group overflow-hidden"
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ff4655]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-700" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden group-hover:border-[#ff4655]/50 transition-colors">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.2]" />
                  <UserIcon className="w-8 h-8 text-zinc-500 group-hover:text-[#ff4655] transition-colors relative z-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wider text-white font-teko">
                    {displayName}
                  </h2>
                  <p className="text-[#ff4655] text-xs font-bold tracking-[0.2em] uppercase">{rpgProfile?.title || 'ROOKIE'}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
                    <span className="text-[#ff4655]">Level {currentLevel}</span>
                    <span className="text-zinc-500">{currentExp} / {nextLevelExp} EXP</span>
                  </div>
                  <div className="h-1 bg-zinc-950 overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="absolute inset-y-0 left-0 bg-[#ff4655] shadow-[0_0_10px_rgba(255,70,85,0.8)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950/80 border border-zinc-800/50 p-4">
                    <Zap className="w-4 h-4 text-yellow-500 mb-2 opacity-50" />
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Streak</div>
                    <div className="text-2xl font-black text-white font-teko mt-1">{rpgProfile?.current_streak || 0}</div>
                  </div>
                  <div className="bg-zinc-950/80 border border-zinc-800/50 p-4">
                    <Target className="w-4 h-4 text-cyan-500 mb-2 opacity-50" />
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Multiplier</div>
                    <div className="text-2xl font-black text-white font-teko mt-1">{rpgProfile?.multiplier || 1.0}x</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RADAR PLACEHOLDER */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 relative p-8 shadow-2xl min-h-[300px] flex flex-col items-center justify-center text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
              <Activity className="w-12 h-12 text-[#ff4655]/20 mb-4 animate-pulse" />
              <h3 className="font-teko text-3xl uppercase tracking-widest text-zinc-600">Radar Offline</h3>
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mt-2 max-w-[200px]">Waiting for Hexagon Chart deployment in Stage 4.</p>
            </motion.div>
          </div>

          {/* MIDDLE: AI ENGINE (Landing Page Card Style) */}
          <div className="xl:col-span-6 flex flex-col gap-6">
            {!generatedQuest ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-1 rounded-3xl relative"
              >
                {/* Neon Border Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#ff4655]/20 to-transparent blur-xl -z-10 rounded-3xl opacity-50" />

                <div className="bg-zinc-950 rounded-[1.4rem] p-6 sm:p-8 relative overflow-hidden">
                  {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <Cpu className="w-16 h-16 text-[#ff4655] animate-pulse" />
                        <div className="absolute inset-0 w-full h-full border-[2px] border-[#ff4655] border-dashed rounded-full animate-[spin_3s_linear_infinite]" />
                      </div>
                      <div className="text-center">
                        <p className="text-[#ff4655] font-teko text-3xl tracking-widest uppercase animate-pulse">Initializing Neural Link...</p>
                        <p className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase">Generating Gamified Protocol</p>
                      </div>
                    </div>
                  )}

                  <div className="flex p-1.5 gap-1.5 bg-zinc-900 rounded-xl mb-6 w-fit">
                    <button
                      type="button"
                      onClick={() => setInputType('text')}
                      className={`px-6 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 ${inputType === 'text' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Type className="w-4 h-4" /> Raw Intel
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputType('url')}
                      className={`px-6 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 ${inputType === 'url' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <LinkIcon className="w-4 h-4" /> Data Link
                    </button>
                  </div>

                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff4655] to-purple-600 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500" />
                      {inputType === 'text' ? (
                        <Textarea
                          value={payload}
                          onChange={(e) => setPayload(e.target.value)}
                          placeholder="Describe your objective. (e.g. 'I want to master Python loops tonight')"
                          className="relative min-h-[160px] bg-zinc-950 border-zinc-800 focus-visible:ring-0 focus-visible:border-transparent text-white text-base resize-none rounded-xl p-4 font-mono text-sm leading-relaxed"
                        />
                      ) : (
                        <Input
                          value={payload}
                          onChange={(e) => setPayload(e.target.value)}
                          placeholder="Paste a URL (Documentation, Video, Article)..."
                          className="relative h-16 bg-zinc-950 border-zinc-800 focus-visible:ring-0 focus-visible:border-transparent text-white text-base rounded-xl px-4 font-mono text-sm"
                        />
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={!payload.trim() || isProcessing}
                      className="w-full h-16 rounded-xl bg-[#ff4655] hover:bg-[#ff4655]/90 text-white font-teko text-2xl tracking-widest uppercase group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,70,85,0.3)] disabled:opacity-50 disabled:hover:shadow-none"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      <span className="relative flex items-center justify-center gap-3">
                        <Sparkles className="w-6 h-6" /> Extract Mission Protocol
                      </span>
                    </Button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900/40 backdrop-blur-md border border-[#ff4655]/30 p-1 rounded-3xl relative shadow-[0_0_50px_rgba(255,70,85,0.1)]"
              >
                <div className="bg-zinc-950 rounded-[1.4rem] p-6 sm:p-8 relative overflow-hidden">
                  
                  {/* Mission Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4 border-b border-zinc-800 pb-8">
                    <div>
                      <div className="flex gap-2 mb-3">
                        <span className="px-3 py-1 bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] text-[10px] font-black uppercase tracking-[0.2em] rounded-md">LVL {generatedQuest.quest.difficulty}</span>
                        <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-md">{generatedQuest.quest.category}</span>
                      </div>
                      <h2 className="text-4xl font-black text-white font-teko uppercase tracking-wide leading-none">{generatedQuest.quest.title}</h2>
                      <p className="text-zinc-400 text-sm mt-3 font-mono leading-relaxed">{generatedQuest.quest.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-4xl font-black text-white font-teko">{generatedQuest.quest.estimated_time_minutes}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Minutes</div>
                    </div>
                  </div>

                  {/* Steps Timeline */}
                  <div className="space-y-4 mb-8">
                    {generatedQuest.steps.map((step) => (
                      <div key={step.order_index} className="flex gap-4 group/step">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover/step:border-[#ff4655] group-hover/step:bg-[#ff4655]/10 transition-colors">
                          <span className="font-teko text-2xl text-zinc-500 group-hover/step:text-[#ff4655]">{step.order_index}</span>
                        </div>
                        <div className="flex-1 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 group-hover/step:border-zinc-700 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-bold tracking-wide uppercase text-sm">{step.title}</h4>
                            <span className="text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2 py-1 rounded">{Math.round(step.estimated_time_seconds / 60)}m</span>
                          </div>
                          <p className="text-zinc-400 text-sm leading-relaxed mb-3">{step.instruction}</p>
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-1.5 rounded-md">
                            <ShieldAlert className="w-3 h-3" /> VERIFY: {step.ai_validation_prompt}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-zinc-800">
                    <Button
                      onClick={() => setGeneratedQuest(null)}
                      variant="outline"
                      className="flex-1 h-14 rounded-xl border-zinc-700 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold tracking-[0.1em] uppercase"
                    >
                      Abort
                    </Button>
                    <Button
                      onClick={handleAcceptMission}
                      disabled={isAccepting}
                      className="flex-[2] h-14 rounded-xl bg-[#ff4655] hover:bg-[#ff4655]/90 text-white font-teko text-2xl tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,70,85,0.4)]"
                    >
                      {isAccepting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Crosshair className="w-5 h-5 mr-2" /> Accept Mission</>}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT: SYSTEM LOGS & LEADERBOARD */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900/50 backdrop-blur-xl border-t border-r border-zinc-800/50 rounded-none p-6 shadow-2xl h-[300px] flex flex-col relative"
            >
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff4655]" />
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-4 h-4 text-zinc-400" />
                <h3 className="font-bold text-white uppercase tracking-[0.2em] text-xs">Active Operations</h3>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-track]:bg-transparent">
                {activeMissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center opacity-50 h-full min-h-[150px]">
                    <Crosshair className="w-8 h-8 text-zinc-600 mb-4" />
                    <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">No Active Missions</p>
                  </div>
                ) : (
                  activeMissions.map((mission) => (
                    <div key={mission.id} className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-lg hover:border-[#ff4655]/50 transition-colors group cursor-pointer relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff4655] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(255,70,85,0.8)]" />
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <span className="text-[9px] font-bold text-[#ff4655] uppercase tracking-wider bg-[#ff4655]/10 px-1.5 py-0.5 rounded border border-[#ff4655]/20">LVL {mission.quests?.difficulty || 1}</span>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest">{mission.quests?.category || 'General'}</span>
                      </div>
                      <h4 className="font-teko text-xl text-zinc-200 uppercase leading-none truncate group-hover:text-white transition-colors pl-2">{mission.quests?.title || 'Unknown Protocol'}</h4>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-6 shadow-2xl flex-1 flex flex-col relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <Activity className="w-4 h-4 text-[#ff4655]" />
                <h3 className="font-bold text-white uppercase tracking-[0.2em] text-xs">System Terminal</h3>
              </div>
              
              <div className="flex-1 relative z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900/50 pointer-events-none z-10" />
                <div className="space-y-3 font-mono text-[10px] leading-relaxed">
                  <p className="text-zinc-500">[{new Date().toLocaleTimeString()}] <span className="text-green-500">SYS_OK</span> Auth verified for {displayName}.</p>
                  <p className="text-zinc-500">[{new Date().toLocaleTimeString()}] <span className="text-cyan-500">NET_OK</span> Connected to global mesh.</p>
                  <p className="text-zinc-500">[{new Date().toLocaleTimeString()}] <span className="text-[#ff4655]">AI_READY</span> Groq tactical core initialized.</p>
                  <p className="text-zinc-600 animate-pulse">_ waiting for input sequence...</p>
                  
                  {isProcessing && (
                    <p className="text-yellow-500 mt-4">
                      {'> '}EXTRACTING PROTOCOL FROM INTEL...
                    </p>
                  )}
                  {generatedQuest && (
                    <p className="text-green-400 mt-4">
                      {'> '}PROTOCOL GENERATED SUCCESSFULLY. AWAITING CONFIRMATION.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
