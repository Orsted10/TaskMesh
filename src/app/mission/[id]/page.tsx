'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ShieldAlert, CheckCircle, Crosshair, Zap, Activity, Clock, Terminal, AlertTriangle, Fingerprint, Database, Cpu, Wifi, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getTierAesthetic } from '@/lib/rpg-data';
import { motion, AnimatePresence } from 'framer-motion';

const SYSTEM_LOGS = [
  "INITIALIZING NEURAL LINK...",
  "BYPASSING SECURITY PROTOCOLS...",
  "ESTABLISHING SECURE CONNECTION...",
  "DECRYPTING MISSION DATA...",
  "SYNCING BIOMETRICS...",
  "CALIBRATING HUD OVERLAY...",
  "UPLINK STABLE.",
  "MONITORING VITALS...",
  "REROUTING POWER TO SUBSYSTEMS...",
  "ANALYZING TACTICAL ENVIRONMENT...",
  "WARNING: ANOMALY DETECTED.",
  "SCANNING FOR THREATS...",
  "ALL SYSTEMS NOMINAL."
];

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
  const [currentLog, setCurrentLog] = useState(SYSTEM_LOGS[0]);

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

  // Timer and Logs
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      if (Math.random() > 0.7) {
        setCurrentLog(SYSTEM_LOGS[Math.floor(Math.random() * SYSTEM_LOGS.length)]);
      }
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
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute w-96 h-96 border-[1px] border-[#ff4655]/20 rounded-full border-dashed"
        />
        <motion.div 
          animate={{ rotate: -360 }} 
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute w-[400px] h-[400px] border-[1px] border-cyan-500/20 rounded-full border-dotted"
        />
        <Loader2 className="w-12 h-12 text-[#ff4655] animate-spin z-10" />
        <p className="mt-4 font-mono text-zinc-400 text-xs tracking-[0.3em] uppercase z-10 animate-pulse">Establishing Secure Uplink...</p>
      </div>
    );
  }

  const aesthetic = getTierAesthetic(mission.tier);
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps.size / steps.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] font-sans text-zinc-900 dark:text-zinc-200 relative overflow-hidden flex flex-col transition-colors duration-500 selection:bg-[#ff4655] selection:text-white">
      
      {/* 1. DYNAMIC ORB BACKGROUNDS (Landing Page Style) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] ${aesthetic.bg} rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-40`} 
        />
        <motion.div 
          animate={{ 
            x: [0, -150, 100, 0],
            y: [0, 150, -50, 0],
            scale: [1, 0.9, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-30" 
        />
        <motion.div 
          animate={{ 
            x: [0, 200, -200, 0],
            y: [0, 200, -200, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 dark:bg-cyan-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-20" 
        />
      </div>

      {/* 2. MASSIVE HUD PARTICLES & GLYPHS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Floating Orbs */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute w-1.5 h-1.5 rounded-full ${aesthetic.accent}`}
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: 0
            }}
            animate={{ 
              y: [null, Math.random() * -300],
              opacity: [0, Math.random() * 0.8 + 0.2, 0],
              scale: [0, Math.random() * 2 + 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
        {/* Falling Tech Data */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`data-${i}`}
            className="absolute text-[8px] font-mono text-zinc-400 dark:text-zinc-600 opacity-20"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: -100
            }}
            animate={{ 
              y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100,
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
          >
            {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </motion.div>
        ))}
        {/* Scanning Laser Line */}
        <motion.div
          animate={{ y: ['0vh', '100vh', '0vh'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`absolute left-0 right-0 h-[2px] ${aesthetic.accent} opacity-20 ${aesthetic.glow} w-full`}
        />
      </div>

      {/* 3. ROTATING TACTICAL RINGS (Corner Accents) */}
      <div className="fixed top-0 left-0 pointer-events-none z-0 opacity-20 dark:opacity-40 -translate-x-1/2 -translate-y-1/2">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="w-[600px] h-[600px] rounded-full border-[1px] border-zinc-300 dark:border-zinc-700 border-dashed" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-8 rounded-full border-[1px] border-zinc-200 dark:border-zinc-800 border-dotted" />
      </div>
      <div className="fixed bottom-0 right-0 pointer-events-none z-0 opacity-20 dark:opacity-40 translate-x-1/3 translate-y-1/3">
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className={`w-[800px] h-[800px] rounded-full border-[1px] ${aesthetic.primaryBorder} opacity-20 border-dashed`} />
      </div>

      {/* 4. DYNAMIC SIDEBAR DATA STRIPS */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-8 pointer-events-none z-0 opacity-30 dark:opacity-50">
        <div className="flex flex-col items-center gap-2 text-[8px] font-mono tracking-widest text-zinc-500 writing-vertical-rl rotate-180">
          <Activity className="w-4 h-4 mb-2 animate-pulse" />
          <span>SYS.OP.MODE: ACTIVE</span>
          <span className="mt-4">{currentLog}</span>
        </div>
        <div className="h-32 w-[1px] bg-gradient-to-b from-transparent via-zinc-400 dark:via-zinc-600 to-transparent mx-auto" />
      </div>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-8 pointer-events-none z-0 opacity-30 dark:opacity-50">
        <div className="flex flex-col items-center gap-2 text-[8px] font-mono tracking-widest text-zinc-500 writing-vertical-rl">
          <Database className="w-4 h-4 mb-2" />
          <span>DATA_STREAM_ID: {resolvedParams.id.substring(0, 8).toUpperCase()}</span>
          <span className="mt-4">LATENCY: {Math.floor(Math.random() * 20 + 10)}ms</span>
        </div>
        <div className="h-32 w-[1px] bg-gradient-to-b from-transparent via-zinc-400 dark:via-zinc-600 to-transparent mx-auto" />
      </div>

      {/* PROGRESS BAR (TOP) */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gray-200 dark:bg-zinc-900 z-50">
        <motion.div 
          className={`h-full ${aesthetic.accent} ${aesthetic.glow} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-r from-transparent to-white opacity-50" />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-4 md:p-12 relative z-10 pt-24 flex-grow flex flex-col xl:flex-row gap-16">
        
        {/* LEFT COLUMN: Mission Briefing & Stats */}
        <div className="flex-1 flex flex-col relative">
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="self-start mb-12 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 uppercase tracking-[0.2em] font-bold text-[10px] group transition-all"
          >
            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
            Abort Operation
          </Button>

          {/* Mission Header */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            {/* Highly decorative border accent */}
            <div className={`absolute -left-8 top-0 bottom-0 w-1 ${aesthetic.accent} opacity-50`} />
            <div className={`absolute -left-8 top-0 h-16 w-1 ${aesthetic.accent} ${aesthetic.glow} animate-pulse`} />
            <div className={`absolute -left-8 bottom-0 h-8 w-1 ${aesthetic.accent}`} />
            
            <div className="flex items-center gap-4 mb-8 flex-wrap">
              <div className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-sm border-l-2 ${aesthetic.bgSoft} ${aesthetic.textDark} ${aesthetic.primaryBorder} shadow-sm backdrop-blur-md flex items-center gap-2 relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-white/20 dark:bg-white/5 -translate-x-full animate-[shimmer_2s_infinite]" />
                <ShieldAlert className="w-3 h-3" />
                {mission.tier || 'STANDARD OPERATION'}
              </div>
              <div className="text-[10px] font-bold text-[#ff4655] uppercase tracking-[0.2em] bg-[#ff4655]/5 dark:bg-[#ff4655]/10 px-4 py-1.5 rounded-sm border-l-2 border-[#ff4655] shadow-sm backdrop-blur-md">
                LVL {mission.difficulty}
              </div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 bg-gray-100 dark:bg-zinc-900/50 px-4 py-1.5 rounded-sm border-l-2 border-zinc-400 dark:border-zinc-700">
                <Terminal className="w-3 h-3" />
                {mission.category}
              </div>
            </div>
            
            <h1 className="text-7xl md:text-8xl lg:text-[100px] font-teko text-zinc-900 dark:text-white uppercase leading-[0.85] mb-8 drop-shadow-lg tracking-tight relative inline-block">
              {mission.title}
              <motion.div 
                className={`absolute -bottom-4 left-0 h-1 ${aesthetic.accent} ${aesthetic.glow}`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </h1>
            
            <p className="text-lg md:text-2xl text-zinc-600 dark:text-zinc-400 font-light max-w-2xl leading-relaxed mb-12">
              {mission.description}
            </p>

            {/* Tactical Readout HUD */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent blur-xl pointer-events-none" />
              
              <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border-l-2 border-t border-r border-b border-gray-200 dark:border-zinc-800/80 p-4 flex flex-col gap-1 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity"><Activity className="w-8 h-8 text-zinc-400" /></div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] z-10">Sync Rate</div>
                <div className="font-teko text-4xl text-zinc-900 dark:text-white z-10">{completionPercentage}%</div>
                <motion.div className="h-1 bg-zinc-200 dark:bg-zinc-800 mt-2 rounded-full overflow-hidden z-10">
                  <motion.div className={`h-full ${aesthetic.accent}`} initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} />
                </motion.div>
              </div>

              <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border-l-2 border-t border-r border-b border-gray-200 dark:border-zinc-800/80 p-4 flex flex-col gap-1 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity"><Clock className="w-8 h-8 text-zinc-400" /></div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] z-10">Uptime</div>
                <div className="font-teko text-4xl text-zinc-900 dark:text-white z-10">{formatTime(timeSpent)}</div>
                <div className="text-[8px] font-mono text-emerald-500 mt-2 z-10 animate-pulse">TIMER ACTIVE</div>
              </div>

              <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border-l-2 border-t border-r border-b border-gray-200 dark:border-zinc-800/80 p-4 flex flex-col gap-1 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity"><Cpu className="w-8 h-8 text-zinc-400" /></div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] z-10">Objectives</div>
                <div className="font-teko text-4xl text-zinc-900 dark:text-white z-10">{completedSteps.size} / {steps.length}</div>
                <div className="text-[8px] font-mono text-zinc-400 mt-2 z-10">REMAINING: {steps.length - completedSteps.size}</div>
              </div>
              
              <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border-l-2 border-t border-r border-b border-gray-200 dark:border-zinc-800/80 p-4 flex flex-col gap-1 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity"><Wifi className="w-8 h-8 text-zinc-400" /></div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] z-10">Signal</div>
                <div className="font-teko text-4xl text-zinc-900 dark:text-white z-10">STRONG</div>
                <div className="text-[8px] font-mono text-blue-500 mt-2 z-10 animate-pulse">CONNECTED</div>
              </div>
            </div>

            {/* Loot Pool Display */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 dark:bg-zinc-900/80 backdrop-blur-2xl border border-gray-200 dark:border-zinc-800/80 p-8 rounded-2xl shadow-2xl relative overflow-hidden group w-full max-w-3xl"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${aesthetic.accent} opacity-80`} />
              <div className="absolute -right-12 -bottom-12 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                <Zap className={`w-64 h-64 ${aesthetic.text}`} />
              </div>
              
              <div className="text-xs text-zinc-500 uppercase tracking-[0.3em] mb-6 font-bold flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${aesthetic.accent} animate-ping`} />
                Authorized Yield Manifest
              </div>
              
              <div className="flex flex-wrap gap-4 relative z-10">
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-1 bg-gray-50 dark:bg-zinc-950/80 px-6 py-4 rounded-xl shadow-inner border border-gray-200 dark:border-zinc-800/80 min-w-[120px]">
                  <span className="text-[#ff4655] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"><Activity className="w-3 h-3"/> EXP</span>
                  <span className="text-3xl font-teko text-zinc-900 dark:text-white">+{mission.rewards?.xp || mission.difficulty * 100}</span>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-1 bg-gray-50 dark:bg-zinc-950/80 px-6 py-4 rounded-xl shadow-inner border border-gray-200 dark:border-zinc-800/80 min-w-[120px]">
                  <span className="text-yellow-600 dark:text-yellow-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"><Database className="w-3 h-3"/> GOLD</span>
                  <span className="text-3xl font-teko text-zinc-900 dark:text-white">+{mission.rewards?.gold || 0}</span>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-1 bg-gray-50 dark:bg-zinc-950/80 px-6 py-4 rounded-xl shadow-inner border border-gray-200 dark:border-zinc-800/80 min-w-[120px]">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"><Zap className="w-3 h-3"/> SHINE</span>
                  <span className="text-3xl font-teko text-zinc-900 dark:text-white">+{mission.rewards?.shine || 0}</span>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-1 bg-gray-50 dark:bg-zinc-950/80 px-6 py-4 rounded-xl shadow-inner border border-gray-200 dark:border-zinc-800/80 min-w-[120px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"><ShieldAlert className="w-3 h-3"/> SP</span>
                  <span className="text-3xl font-teko text-zinc-900 dark:text-white">+{mission.rewards?.skillpoints || 0}</span>
                </motion.div>
                
                {mission.rewards?.specific_skills?.map((skill: any, idx: number) => (
                  <motion.div whileHover={{ scale: 1.05 }} key={idx} className="flex flex-col gap-1 bg-cyan-50 dark:bg-cyan-950/20 px-6 py-4 rounded-xl shadow-sm border border-cyan-200 dark:border-cyan-900/50 min-w-[120px]">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"><Cpu className="w-3 h-3"/> {skill.name}</span>
                    <span className="text-3xl font-teko text-zinc-900 dark:text-white">+{skill.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Objectives & Extraction */}
        <div className="flex-1 flex flex-col w-full relative">
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-teko text-4xl md:text-5xl uppercase tracking-widest text-zinc-900 dark:text-zinc-100 flex items-center gap-4">
              <Radio className="w-8 h-8 animate-pulse text-zinc-400" />
              Objectives
            </h2>
            <div className={`font-mono text-sm px-4 py-1.5 rounded-full border ${completedSteps.size === steps.length ? `${aesthetic.bgSoft} ${aesthetic.textDark} ${aesthetic.primaryBorder}` : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-500 border-gray-200 dark:border-zinc-800'} backdrop-blur-md shadow-sm transition-colors`}>
              {completedSteps.size} / {steps.length} SECURED
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <AnimatePresence>
              {steps.map((step, idx) => {
                const isDone = completedSteps.has(step.id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className={`p-6 border-l-4 rounded-r-2xl flex gap-6 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] shadow-lg ${
                      isDone 
                        ? `bg-white dark:${aesthetic.bg.split(' ')[0]} ${aesthetic.primaryBorder} shadow-${aesthetic.accent.split('-')[1]}-500/10` 
                        : 'bg-white/80 dark:bg-zinc-900/60 border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 backdrop-blur-xl'
                    }`}
                  >
                    {/* Hover Glitch / Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    
                    {isDone && (
                      <div className={`absolute inset-0 ${aesthetic.accent} opacity-[0.03] dark:opacity-5 blur-xl`} />
                    )}
                    
                    <div className="flex-shrink-0 mt-2 relative z-10">
                      {isDone ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring" }}
                        >
                          <CheckCircle className={`w-10 h-10 ${aesthetic.text} drop-shadow-[0_0_12px_currentColor]`} />
                        </motion.div>
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-500 font-teko text-2xl group-hover:border-zinc-500 dark:group-hover:border-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="relative z-10 flex-grow">
                      <h3 className={`text-3xl font-teko uppercase mb-2 tracking-wide transition-colors ${isDone ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-base mb-5 leading-relaxed transition-colors ${isDone ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}>
                        {step.instruction}
                      </p>
                      
                      <div className={`inline-flex items-center gap-3 text-xs font-mono px-4 py-2 rounded-md border ${
                        isDone 
                          ? `${aesthetic.bgSoft} ${aesthetic.textDark} ${aesthetic.border}` 
                          : 'bg-zinc-100 dark:bg-zinc-950/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-700'
                      } transition-colors`}>
                        <Fingerprint className={`w-4 h-4 ${isDone ? aesthetic.text : 'text-zinc-400'}`} /> 
                        <span><span className="font-bold opacity-50 mr-2">VERIFY:</span> {step.ai_validation_prompt}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Completion Button */}
          <div className="relative group mt-auto pt-8">
            {completedSteps.size === steps.length && (
              <motion.div 
                animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 ${aesthetic.accent} blur-3xl rounded-3xl -z-10`} 
              />
            )}
            
            <Button
              onClick={handleCompleteMission}
              disabled={completing || completedSteps.size < steps.length}
              className={`w-full h-32 rounded-3xl font-teko text-5xl md:text-6xl tracking-[0.2em] uppercase transition-all duration-500 relative overflow-hidden z-10 group ${
                completedSteps.size === steps.length
                  ? `${aesthetic.accent} hover:opacity-95 text-white shadow-2xl hover:scale-[1.03] border-0`
                  : 'bg-gray-200 dark:bg-zinc-900/80 text-gray-400 dark:text-zinc-600 cursor-not-allowed border-2 border-gray-300 dark:border-zinc-800 shadow-inner'
              }`}
            >
              {/* Button Glitch / Scanline overlay */}
              {completedSteps.size === steps.length && (
                <>
                  <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-30 pointer-events-none mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                </>
              )}
              
              {completing ? (
                <Loader2 className="w-12 h-12 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-6 relative z-10 w-full px-8">
                  <motion.div 
                    animate={completedSteps.size === steps.length ? { rotate: 360 } : {}} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Crosshair className={`w-12 h-12 md:w-16 md:h-16`} />
                  </motion.div>
                  <span className="mt-2">
                    {completedSteps.size === steps.length ? 'EXTRACT LOOT' : 'SECURE OBJECTIVES'}
                  </span>
                </div>
              )}
            </Button>
            
            {/* Warning Text when not ready */}
            {completedSteps.size < steps.length && (
              <div className="absolute top-full left-0 right-0 mt-6 text-center text-xs text-zinc-500 uppercase tracking-[0.3em] font-mono font-bold animate-pulse">
                Extraction Protocol Locked. Complete {steps.length - completedSteps.size} remaining objectives.
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      {/* Decorative Bottom Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mt-12 opacity-50 relative z-10" />
    </div>
  );
}
