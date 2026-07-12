'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Link as LinkIcon, Type, Cpu, Crosshair, ShieldAlert, Activity, User as UserIcon, Zap, Target, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';

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
  const { user, rpgProfile } = useAuth();
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [payload, setPayload] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedQuest, setGeneratedQuest] = useState<GeneratedQuest | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

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
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate. (Did you add GROQ_API_KEY to Vercel?)');

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

    } catch (err: any) {
      toast.error('Failed to accept mission', { description: err.message });
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-[#ff4655]/30 flex flex-col pt-20 overflow-hidden relative">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff4655]/40 to-transparent shadow-[0_0_15px_rgba(255,70,85,0.4)]" />
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#ff4655]/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Main Grid Layout */}
      <div className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Profile & Stats */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff4655]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-zinc-800 border-2 border-[#ff4655]/50 flex items-center justify-center shrink-0 overflow-hidden">
                <UserIcon className="w-8 h-8 text-zinc-400" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-white">
                  {rpgProfile?.username || 'AGENT_UNKNOWN'}
                </h2>
                <p className="text-[#ff4655] text-sm font-semibold tracking-widest">{rpgProfile?.title || 'ROOKIE'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs uppercase tracking-widest font-bold mb-2">
                  <span className="text-zinc-400">Level {rpgProfile?.level || 1}</span>
                  <span className="text-zinc-500">{rpgProfile?.total_exp || 0} EXP</span>
                </div>
                <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((rpgProfile?.total_exp || 0) % 1000) / 10}%` }}
                    className="h-full bg-gradient-to-r from-[#ff4655] to-orange-500 rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3">
                  <Zap className="w-4 h-4 text-yellow-500 mb-1" />
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Streak</div>
                  <div className="text-lg font-black text-white">{rpgProfile?.current_streak || 0} Days</div>
                </div>
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3">
                  <Target className="w-4 h-4 text-cyan-500 mb-1" />
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Multiplier</div>
                  <div className="text-lg font-black text-white">{rpgProfile?.multiplier || 1.0}x</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Placeholder for Stage 4 Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-2xl flex-1 min-h-[300px] flex flex-col items-center justify-center text-center"
          >
            <Activity className="w-12 h-12 text-zinc-700 mb-4 animate-pulse" />
            <h3 className="font-teko text-2xl uppercase tracking-widest text-zinc-500">Radar Calibration</h3>
            <p className="text-zinc-600 text-sm mt-2">Stage 4: Hexagon Chart incoming...</p>
          </motion.div>
        </div>

        {/* MIDDLE COLUMN: Command Center & Active Quests */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-500 font-teko flex items-center gap-3">
              <Cpu className="w-8 h-8 text-[#ff4655]" />
              COMMAND CENTER
            </h1>
            <p className="text-zinc-400 text-sm uppercase tracking-widest">Initialize New Operation</p>
          </motion.div>

          {/* Input Engine */}
          {!generatedQuest ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-2 shadow-2xl relative"
            >
              {isProcessing && (
                <div className="absolute inset-0 z-50 bg-zinc-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <Cpu className="w-16 h-16 text-[#ff4655] animate-pulse" />
                    <div className="absolute inset-0 w-full h-full border-[3px] border-[#ff4655] border-dashed rounded-full animate-[spin_4s_linear_infinite]" />
                  </div>
                  <p className="text-[#ff4655] font-teko text-2xl tracking-widest uppercase animate-pulse">Groq Engine Computing...</p>
                  <p className="text-zinc-500 text-xs tracking-widest uppercase">Converting to Actionable JSON</p>
                </div>
              )}

              <div className="flex p-2 gap-2 bg-zinc-950/50 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setInputType('text')}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${inputType === 'text' ? 'bg-[#ff4655]/10 text-[#ff4655] shadow-[0_0_15px_rgba(255,70,85,0.1)]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                >
                  <Type className="w-4 h-4" /> Raw Intel
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('url')}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${inputType === 'url' ? 'bg-[#ff4655]/10 text-[#ff4655] shadow-[0_0_15px_rgba(255,70,85,0.1)]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                >
                  <LinkIcon className="w-4 h-4" /> Data Link
                </button>
              </div>

              <form onSubmit={handleGenerate} className="px-4 pb-4 space-y-4">
                {inputType === 'text' ? (
                  <Textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    placeholder="Describe your objective in extreme detail... E.g. 'I need to master React Native gestures this weekend.'"
                    className="min-h-[160px] bg-zinc-950/50 border-zinc-800 focus-visible:ring-[#ff4655]/50 text-base resize-none rounded-xl"
                  />
                ) : (
                  <Input
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    placeholder="Paste a URL (YouTube, Article, Documentation)..."
                    className="h-16 bg-zinc-950/50 border-zinc-800 focus-visible:ring-[#ff4655]/50 text-base rounded-xl"
                  />
                )}

                <Button 
                  type="submit" 
                  disabled={!payload.trim() || isProcessing}
                  className="w-full h-16 rounded-xl bg-[#ff4655] hover:bg-[#ff4655]/90 text-white font-teko text-2xl tracking-widest uppercase group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,70,85,0.3)] disabled:opacity-50 disabled:hover:shadow-none"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6" /> Generate Mission Blueprint
                  </span>
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Mission Briefing */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4655]/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <div className="flex justify-between items-start mb-8 relative">
                  <div className="max-w-[70%]">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2 leading-none">{generatedQuest.quest.title}</h2>
                    <p className="text-zinc-400 text-sm">{generatedQuest.quest.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-zinc-950 text-zinc-300 text-[10px] uppercase tracking-[0.2em] font-bold rounded-md border border-zinc-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {generatedQuest.quest.estimated_time_minutes} MIN
                    </span>
                    <span className="px-3 py-1 bg-[#ff4655]/10 text-[#ff4655] text-[10px] uppercase tracking-[0.2em] font-bold rounded-md border border-[#ff4655]/30 flex items-center gap-1">
                      <Target className="w-3 h-3" /> LVL {generatedQuest.quest.difficulty}
                    </span>
                  </div>
                </div>

                {/* Steps Timeline */}
                <div className="space-y-4 mt-8 relative">
                  <div className="absolute left-6 top-4 bottom-4 w-px bg-zinc-800/50" />
                  {generatedQuest.steps.map((step) => (
                    <div key={step.order_index} className="flex gap-4 relative group/step">
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 group-hover/step:border-[#ff4655] transition-colors relative z-10 text-zinc-500 group-hover/step:text-[#ff4655] font-black text-lg">
                        {step.order_index}
                      </div>
                      <div className="flex-1 bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 hover:bg-zinc-900/80 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-lg font-bold text-zinc-200">{step.title}</h3>
                          <span className="text-zinc-600 text-xs font-mono">{Math.round(step.estimated_time_seconds / 60)}m</span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">{step.instruction}</p>
                        
                        <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-[#ff4655]/80 bg-[#ff4655]/5 px-3 py-2 rounded-lg border border-[#ff4655]/10">
                          <ShieldAlert className="w-3 h-3 shrink-0" />
                          <span className="truncate">AI Verify: {step.ai_validation_prompt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    onClick={() => setGeneratedQuest(null)}
                    variant="outline"
                    className="flex-1 h-14 rounded-xl border-zinc-700 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold tracking-wider"
                  >
                    ABORT
                  </Button>
                  <Button
                    onClick={handleAcceptMission}
                    disabled={isAccepting}
                    className="flex-2 w-[60%] h-14 rounded-xl bg-[#ff4655] hover:bg-[#ff4655]/90 text-white font-teko text-2xl tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,70,85,0.4)]"
                  >
                    {isAccepting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Crosshair className="w-5 h-5 mr-2" /> ACCEPT MISSION</>}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN: Activity & Leaderboard */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-2xl h-[400px] flex flex-col"
          >
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-white uppercase tracking-widest text-sm">Active Operations</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <Crosshair className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400 text-sm uppercase tracking-widest font-bold">No Active Missions</p>
              <p className="text-zinc-600 text-xs mt-1">Generate a quest to begin.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-cyan-500" />
              <h3 className="font-bold text-white uppercase tracking-widest text-sm">System Logs</h3>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900/40 z-10 pointer-events-none" />
              <div className="space-y-3 font-mono text-[10px] text-zinc-500">
                <p><span className="text-green-500">[SYS]</span> System nominal.</p>
                <p><span className="text-cyan-500">[AUTH]</span> User {rpgProfile?.username || 'GUEST'} verified.</p>
                <p><span className="text-[#ff4655]">[AI]</span> Groq Engine initialized.</p>
                <p><span className="text-zinc-400">[DAT]</span> Waiting for input...</p>
                {isProcessing && <p className="text-yellow-500 animate-pulse">[AI] Processing raw intel...</p>}
                {generatedQuest && <p className="text-green-500">[AI] Quest payload generated.</p>}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
