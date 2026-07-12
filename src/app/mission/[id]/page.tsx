'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ShieldAlert, CheckCircle, Crosshair, Zap, Activity, Clock, Terminal, AlertTriangle, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getTierAesthetic } from '@/lib/rpg-data';
import { motion, AnimatePresence } from 'framer-motion';

export default function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [mission, setMission] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchMission = async () => {
      if (!user) return;
      
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();
        
      if (questError || !questData) {
        toast.error('Mission not found');
        router.push('/dashboard');
        return;
      }

      const { data: stepsData } = await supabase
        .from('quest_steps')
        .select('*')
        .eq('quest_id', resolvedParams.id)
        .order('order_index', { ascending: true });

      setMission(questData);
      if (stepsData) setSteps(stepsData);
      setLoading(false);
    };

    if (user) {
      fetchMission();
    }
  }, [user, resolvedParams.id, router]);

  // Timer for immersion
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleStep = (stepId: string) => {
    const newSet = new Set(completedSteps);
    if (newSet.has(stepId)) {
      newSet.delete(stepId);
    } else {
      newSet.add(stepId);
    }
    setCompletedSteps(newSet);
  };

  const handleCompleteMission = async () => {
    if (completedSteps.size < steps.length) {
      toast.error('Complete all steps before extracting!');
      return;
    }
    
    setCompleting(true);
    try {
      await supabase
        .from('user_quest_progress')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('quest_id', mission.id)
        .eq('user_id', user!.id);
        
      const expReward = mission.rewards?.xp || (mission.difficulty * 100);
      const goldReward = mission.rewards?.gold || 0;
      const shineReward = mission.rewards?.shine || 0;
      const skillpointsReward = mission.rewards?.skillpoints || 0;
      const earnedSkills = mission.rewards?.specific_skills || [];
      
      const { data: profile } = await supabase
        .from('users')
        .select('total_exp, gold, shine, skillpoints, specific_skills')
        .eq('id', user!.id)
        .single();
        
      if (profile) {
        let updatedSkills = profile.specific_skills || {};
        earnedSkills.forEach((skill: any) => {
          updatedSkills[skill.name] = (updatedSkills[skill.name] || 0) + skill.value;
        });

        await supabase
          .from('users')
          .update({ 
            total_exp: (profile.total_exp || 0) + expReward,
            gold: (profile.gold || 0) + goldReward,
            shine: (profile.shine || 0) + shineReward,
            skillpoints: (profile.skillpoints || 0) + skillpointsReward,
            specific_skills: updatedSkills
          })
          .eq('id', user!.id);
      }
      
      toast.success('MISSION ACCOMPLISHED', { description: `+${expReward} EXP | +${goldReward} GOLD | +${shineReward} SHINE Gained!` });
      router.push('/dashboard');
    } catch (err) {
      toast.error('Failed to complete mission');
    } finally {
      setCompleting(false);
    }
  };

  if (loading || authLoading || !mission) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute w-96 h-96 border-[1px] border-[#ff4655]/20 rounded-full border-dashed"
        />
        <Loader2 className="w-12 h-12 text-[#ff4655] animate-spin z-10" />
        <p className="mt-4 font-mono text-zinc-400 text-xs tracking-[0.3em] uppercase z-10 animate-pulse">Establishing Secure Uplink...</p>
      </div>
    );
  }

  const aesthetic = getTierAesthetic(mission.tier);
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps.size / steps.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] font-sans text-zinc-900 dark:text-zinc-200 relative overflow-hidden flex flex-col transition-colors duration-500">
      
      {/* 1. LAYER: Base Dynamic Gradients (Light/Dark mode supported via aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute -inset-[50%] ${aesthetic.bg} opacity-30 dark:opacity-20 blur-[120px] rounded-[100%] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10s]`} />
      </div>

      {/* 2. LAYER: Masked Grid lines for Depth (Not blending text!) */}
      <div className="fixed inset-0 pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_100%)] opacity-30 dark:opacity-40">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center bg-[length:50px_50px]" />
      </div>

      {/* 3. LAYER: Ambient Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-5 dark:opacity-[0.03] bg-[url('/scanline.png')] bg-repeat" />

      {/* 4. LAYER: Floating Particles (Framer Motion) */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute w-1 h-1 rounded-full ${aesthetic.accent} opacity-40`}
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) 
            }}
            animate={{ 
              y: [null, Math.random() * -200],
              opacity: [0.4, 0, 0.4]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* PROGRESS BAR (TOP) */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gray-200 dark:bg-zinc-900 z-50">
        <motion.div 
          className={`h-full ${aesthetic.accent} ${aesthetic.glow}`}
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="max-w-6xl mx-auto w-full p-4 md:p-12 relative z-10 pt-20 flex-grow flex flex-col xl:flex-row gap-12">
        
        {/* LEFT COLUMN: Mission Briefing & Stats */}
        <div className="flex-1 flex flex-col">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="self-start mb-10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-900 uppercase tracking-widest font-bold text-[10px]"
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            Abort Operation
          </Button>

          {/* Mission Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`mb-12 border-l-[3px] ${aesthetic.primaryBorder} pl-8 relative`}
          >
            <div className={`absolute -left-[3px] top-0 bottom-0 w-[3px] ${aesthetic.accent} animate-pulse ${aesthetic.glow}`} />
            
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border ${aesthetic.bgSoft} ${aesthetic.textDark} ${aesthetic.border} shadow-sm backdrop-blur-sm flex items-center gap-2`}>
                <ShieldAlert className="w-3 h-3" />
                {mission.tier || 'STANDARD OPERATION'}
              </div>
              <div className="text-[10px] font-bold text-[#ff4655] uppercase tracking-widest bg-[#ff4655]/5 dark:bg-[#ff4655]/10 px-3 py-1 rounded border border-[#ff4655]/20 shadow-sm backdrop-blur-sm">
                LVL {mission.difficulty}
              </div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                {mission.category}
              </div>
            </div>
            
            <h1 className={`text-6xl md:text-8xl font-teko text-zinc-900 dark:text-white uppercase leading-[0.9] mb-6 drop-shadow-sm dark:drop-shadow-2xl ${aesthetic.glow}`}>
              {mission.title}
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-light max-w-2xl leading-relaxed mb-8">
              {mission.description}
            </p>

            {/* Tactical Readout HUD */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-gray-200 dark:border-zinc-800/80 p-3 rounded-lg flex items-center gap-3 shadow-sm min-w-[140px]">
                <Activity className="w-5 h-5 text-zinc-400" />
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Progress</div>
                  <div className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-200">{completionPercentage}%</div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-gray-200 dark:border-zinc-800/80 p-3 rounded-lg flex items-center gap-3 shadow-sm min-w-[140px]">
                <Clock className="w-5 h-5 text-zinc-400" />
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Time Elapsed</div>
                  <div className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-200">{formatTime(timeSpent)}</div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-gray-200 dark:border-zinc-800/80 p-3 rounded-lg flex items-center gap-3 shadow-sm min-w-[140px]">
                <Fingerprint className="w-5 h-5 text-zinc-400" />
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Auth ID</div>
                  <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1 truncate max-w-[80px]">{user?.id?.split('-')[0]}</div>
                </div>
              </div>
            </div>

            {/* Loot Pool Display */}
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-gray-200 dark:border-zinc-800/80 p-6 rounded-xl inline-block shadow-xl relative overflow-hidden group w-full max-w-2xl">
              <div className={`absolute top-0 left-0 right-0 h-1 ${aesthetic.accent} opacity-80`} />
              <div className="absolute -right-10 -bottom-10 opacity-5">
                <Zap className={`w-40 h-40 ${aesthetic.text}`} />
              </div>
              
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-4 font-bold flex items-center gap-2">
                <Zap className={`w-3 h-3 ${aesthetic.text}`} /> Authorized Yield Manifest
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-950 px-4 py-2 rounded shadow-inner border border-gray-200 dark:border-zinc-800/80">
                  <span className="text-[#ff4655] font-bold text-xs uppercase tracking-widest">EXP</span>
                  <span className="text-xl font-teko text-zinc-800 dark:text-white">+{mission.rewards?.xp || mission.difficulty * 100}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-950 px-4 py-2 rounded shadow-inner border border-gray-200 dark:border-zinc-800/80">
                  <span className="text-yellow-600 dark:text-yellow-500 font-bold text-xs uppercase tracking-widest">GOLD</span>
                  <span className="text-xl font-teko text-zinc-800 dark:text-white">+{mission.rewards?.gold || 0}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-950 px-4 py-2 rounded shadow-inner border border-gray-200 dark:border-zinc-800/80">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-widest">SHINE</span>
                  <span className="text-xl font-teko text-zinc-800 dark:text-white">+{mission.rewards?.shine || 0}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-950 px-4 py-2 rounded shadow-inner border border-gray-200 dark:border-zinc-800/80">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest">SP</span>
                  <span className="text-xl font-teko text-zinc-800 dark:text-white">+{mission.rewards?.skillpoints || 0}</span>
                </div>
                
                {mission.rewards?.specific_skills?.map((skill: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-950/30 px-4 py-2 rounded shadow-sm border border-cyan-200 dark:border-cyan-900/50">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-widest">{skill.name}</span>
                    <span className="text-xl font-teko text-zinc-800 dark:text-white">+{skill.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Objectives & Extraction */}
        <div className="flex-1 flex flex-col max-w-2xl w-full">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-teko text-3xl uppercase tracking-widest text-zinc-800 dark:text-zinc-200">Tactical Objectives</h2>
            <div className="font-mono text-xs text-zinc-500 bg-white/50 dark:bg-zinc-900/50 px-3 py-1 rounded-full border border-gray-200 dark:border-zinc-800">
              {completedSteps.size} / {steps.length} SECURED
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <AnimatePresence>
              {steps.map((step, idx) => {
                const isDone = completedSteps.has(step.id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className={`p-6 border-2 rounded-xl flex gap-5 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] ${
                      isDone 
                        ? `bg-white dark:${aesthetic.bg.split(' ')[0]} ${aesthetic.border} shadow-md` 
                        : 'bg-white/60 dark:bg-zinc-900/40 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 backdrop-blur-sm'
                    }`}
                  >
                    {/* Hover Glitch Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    
                    {isDone && (
                      <div className={`absolute inset-0 ${aesthetic.accent} opacity-5 blur-xl`} />
                    )}
                    
                    <div className="flex-shrink-0 mt-1 relative z-10">
                      {isDone ? (
                        <CheckCircle className={`w-8 h-8 ${aesthetic.text} drop-shadow-[0_0_8px_currentColor]`} />
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-zinc-700 flex items-center justify-center text-gray-400 dark:text-zinc-500 font-teko text-xl group-hover:border-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="relative z-10 flex-grow">
                      <h3 className={`text-2xl font-teko uppercase mb-1 transition-colors ${isDone ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm mb-4 leading-relaxed transition-colors ${isDone ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400'}`}>
                        {step.instruction}
                      </p>
                      
                      <div className={`inline-flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded border ${
                        isDone 
                          ? `${aesthetic.bgSoft} ${aesthetic.textDark} ${aesthetic.border}` 
                          : 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-500 border-cyan-200 dark:border-cyan-900/30 group-hover:border-cyan-300 dark:group-hover:border-cyan-800'
                      } transition-colors`}>
                        <AlertTriangle className="w-3 h-3" /> 
                        <span>AI VERIFY: {step.ai_validation_prompt}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Completion Button */}
          <div className="relative group mt-auto">
            {/* Ambient glow behind button when ready */}
            {completedSteps.size === steps.length && (
              <div className={`absolute -inset-1 ${aesthetic.accent} opacity-30 blur-2xl rounded-2xl group-hover:opacity-60 transition-opacity duration-500`} />
            )}
            
            <Button
              onClick={handleCompleteMission}
              disabled={completing || completedSteps.size < steps.length}
              className={`w-full h-24 rounded-2xl font-teko text-4xl md:text-5xl tracking-[0.15em] uppercase transition-all duration-500 relative overflow-hidden z-10 ${
                completedSteps.size === steps.length
                  ? `${aesthetic.accent} hover:opacity-95 text-white shadow-xl hover:scale-[1.02] border-0`
                  : 'bg-gray-200 dark:bg-zinc-900/80 text-gray-400 dark:text-zinc-600 cursor-not-allowed border-2 border-gray-300 dark:border-zinc-800'
              }`}
            >
              {/* Button Inner Scanline for Ready State */}
              {completedSteps.size === steps.length && (
                <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-20 pointer-events-none mix-blend-overlay" />
              )}
              
              {completing ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-4 relative z-10">
                  <Crosshair className={`w-8 h-8 md:w-10 md:h-10 ${completedSteps.size === steps.length ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
                  {completedSteps.size === steps.length ? 'EXTRACT LOOT' : 'SECURE ALL OBJECTIVES'}
                </div>
              )}
            </Button>
            
            {/* Warning Text when not ready */}
            {completedSteps.size < steps.length && (
              <div className="absolute top-full left-0 right-0 mt-3 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold animate-pulse">
                Extraction Protocol Locked. Complete {steps.length - completedSteps.size} remaining objectives.
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      {/* Decorative Bottom Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-800 to-transparent mt-12 opacity-50" />
    </div>
  );
}
