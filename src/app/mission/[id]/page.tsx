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

  // Mouse position for 3D tilt
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
      if (Math.random() > 0.6) {
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

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) - 0.5;
    const y = (clientY / window.innerHeight) - 0.5;
    setMousePosition({ x, y });
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
        <Loader2 className="w-12 h-12 text-[#ff4655] animate-spin z-10" />
        <p className="mt-4 font-mono text-zinc-400 text-xs tracking-[0.3em] uppercase z-10 animate-pulse">Establishing Secure Uplink...</p>
      </div>
    );
  }

  const aesthetic = getTierAesthetic(mission.tier);
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps.size / steps.length) * 100) : 0;

  return (
    <div 
      className="min-h-screen bg-gray-100 dark:bg-[#070707] font-sans text-zinc-900 dark:text-zinc-50 relative overflow-hidden flex flex-col transition-colors duration-500 selection:bg-[#ff4655] selection:text-white"
      onMouseMove={handleMouseMove}
    >
      
      {/* 1. LAYER: HEXAGON MESH BACKGROUND (Clean, high-tech, unobtrusive) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 dark:opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
              <polygon points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <polygon points="49.8,7.6 62.3,14.8 62.3,29.3 49.8,36.5 37.3,29.3 37.3,14.8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <polygon points="-0.2,7.6 12.3,14.8 12.3,29.3 -0.2,36.5 -12.7,29.3 -12.7,14.8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" className="text-zinc-500" />
        </svg>
      </div>

      {/* 2. LAYER: DYNAMIC BACKGROUND GRADIENT (Matches Tier) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply dark:mix-blend-screen opacity-40 dark:opacity-20">
        <motion.div 
          animate={{ x: mousePosition.x * 50, y: mousePosition.y * 50 }}
          className={`absolute top-0 right-0 w-[800px] h-[800px] ${aesthetic.bg} rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4`} 
        />
        <motion.div 
          animate={{ x: mousePosition.x * -50, y: mousePosition.y * -50 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#ff4655]/20 rounded-full blur-[120px] translate-y-1/4 -translate-x-1/4" 
        />
      </div>

      {/* 3. LAYER: FLOATING PARTICLES */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute w-1 h-1 rounded-full ${aesthetic.accent}`}
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: 0
            }}
            animate={{ 
              y: [null, Math.random() * -100 - 50],
              opacity: [0, Math.random() * 0.8 + 0.2, 0],
            }}
            transition={{ 
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* 4. DYNAMIC SIDEBAR DATA STRIPS */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-8 pointer-events-none z-0 opacity-40 dark:opacity-60 hidden xl:flex">
        <div className="flex flex-col items-center gap-4 text-[9px] font-mono tracking-[0.2em] text-zinc-600 dark:text-zinc-400 writing-vertical-rl rotate-180">
          <div className="flex gap-1 animate-pulse mb-2">
            <div className="w-1 h-4 bg-emerald-500" />
            <div className="w-1 h-3 bg-emerald-500" />
            <div className="w-1 h-5 bg-emerald-500" />
          </div>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">SYS.OP.MODE: ACTIVE</span>
          <span className="mt-4 text-[#ff4655]">{currentLog}</span>
        </div>
        <div className="h-48 w-[2px] bg-gradient-to-b from-transparent via-zinc-400 dark:via-zinc-600 to-transparent mx-auto" />
      </div>
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-8 pointer-events-none z-0 opacity-40 dark:opacity-60 hidden xl:flex">
        <div className="flex flex-col items-center gap-4 text-[9px] font-mono tracking-[0.2em] text-zinc-600 dark:text-zinc-400 writing-vertical-rl">
          <Database className="w-5 h-5 mb-2 text-[#ff4655]" />
          <span className="font-bold text-zinc-800 dark:text-zinc-200">DATA_STREAM_ID: {resolvedParams.id.substring(0, 8).toUpperCase()}</span>
          <span className="mt-4">LATENCY: {Math.floor(Math.random() * 20 + 10)}ms</span>
        </div>
        <div className="h-48 w-[2px] bg-gradient-to-b from-transparent via-zinc-400 dark:via-zinc-600 to-transparent mx-auto" />
      </div>

      {/* TOP PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gray-300 dark:bg-zinc-900 z-50">
        <motion.div 
          className={`h-full ${aesthetic.accent} ${aesthetic.glow} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-white/50 blur-sm" />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-6 md:p-12 relative z-10 pt-20 flex-grow flex flex-col xl:flex-row gap-16">
        
        {/* LEFT COLUMN: Mission Briefing & Stats */}
        <div className="flex-1 flex flex-col relative z-20">
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="self-start mb-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800 uppercase tracking-[0.2em] font-bold text-[10px] group transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Abort Operation
          </Button>

          {/* Mission Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            {/* Highly decorative border accent */}
            <div className={`absolute -left-6 md:-left-8 top-0 bottom-0 w-[3px] ${aesthetic.accent} opacity-40`} />
            <div className={`absolute -left-6 md:-left-8 top-0 h-24 w-[3px] ${aesthetic.accent} ${aesthetic.glow} animate-pulse`} />
            
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-md ${aesthetic.bg} ${aesthetic.textDark} ${aesthetic.primaryBorder} border shadow-sm backdrop-blur-md flex items-center gap-2 relative overflow-hidden group`}>
                <ShieldAlert className="w-3.5 h-3.5" />
                {mission.tier || 'STANDARD OPERATION'}
              </div>
              <div className="text-[10px] font-bold text-white uppercase tracking-[0.2em] bg-[#ff4655] px-4 py-2 rounded-md shadow-md backdrop-blur-md">
                LVL {mission.difficulty}
              </div>
              <div className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-[0.2em] flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 px-4 py-2 rounded-md border border-gray-200 dark:border-zinc-700 shadow-sm">
                <Terminal className="w-3.5 h-3.5" />
                {mission.category}
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-teko text-zinc-950 dark:text-white uppercase leading-[0.9] mb-6 drop-shadow-xl tracking-wide">
              {mission.title}
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-medium max-w-2xl leading-relaxed mb-10">
              {mission.description}
            </p>

            {/* Tactical Readout HUD */}
            <div className="flex flex-wrap gap-4 mb-12">
              <div className="flex-1 min-w-[120px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity"><Activity className="w-10 h-10 text-zinc-400" /></div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">Sync Rate</div>
                <div className="font-teko text-5xl text-zinc-900 dark:text-white mb-2">{completionPercentage}%</div>
                <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div className={`h-full ${aesthetic.accent}`} initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} />
                </div>
              </div>

              <div className="flex-1 min-w-[120px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity"><Clock className="w-10 h-10 text-zinc-400" /></div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">Uptime</div>
                <div className="font-teko text-5xl text-zinc-900 dark:text-white">{formatTime(timeSpent)}</div>
                <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 mt-2 font-bold animate-pulse">TIMER ACTIVE</div>
              </div>

              <div className="flex-1 min-w-[120px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity"><Cpu className="w-10 h-10 text-zinc-400" /></div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">Objectives</div>
                <div className="font-teko text-5xl text-zinc-900 dark:text-white">{completedSteps.size} / {steps.length}</div>
                <div className="text-[9px] font-mono text-zinc-500 mt-2 font-bold">REMAINING: {steps.length - completedSteps.size}</div>
              </div>
            </div>

            {/* Loot Pool Display - 3D Tilt Effect */}
            <motion.div 
              style={{
                rotateX: mousePosition.y * 10,
                rotateY: mousePosition.x * -10,
                transformStyle: "preserve-3d"
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-gray-200 dark:border-zinc-700 p-8 rounded-2xl shadow-2xl relative group w-full max-w-3xl"
            >
              <div className={`absolute top-0 left-0 right-0 h-2 ${aesthetic.accent}`} />
              <div className="absolute -right-12 -bottom-12 opacity-5 dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-700" style={{ transform: "translateZ(-20px)" }}>
                <Zap className={`w-64 h-64 ${aesthetic.text}`} />
              </div>
              
              <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-[0.3em] mb-6 font-bold flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${aesthetic.accent} animate-ping`} />
                Authorized Yield Manifest
              </div>
              
              <div className="flex flex-wrap gap-4 relative z-10" style={{ transform: "translateZ(30px)" }}>
                <div className="flex flex-col gap-1 bg-gray-100 dark:bg-zinc-950 px-6 py-4 rounded-xl shadow-inner border border-gray-200 dark:border-zinc-800 min-w-[110px]">
                  <span className="text-[#ff4655] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"><Activity className="w-3.5 h-3.5"/> EXP</span>
                  <span className="text-4xl font-teko text-zinc-900 dark:text-white">+{mission.rewards?.xp || mission.difficulty * 100}</span>
                </div>
                
                <div className="flex flex-col gap-1 bg-gray-100 dark:bg-zinc-950 px-6 py-4 rounded-xl shadow-inner border border-gray-200 dark:border-zinc-800 min-w-[110px]">
                  <span className="text-yellow-600 dark:text-yellow-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"><Database className="w-3.5 h-3.5"/> GOLD</span>
                  <span className="text-4xl font-teko text-zinc-900 dark:text-white">+{mission.rewards?.gold || 0}</span>
                </div>
                
                <div className="flex flex-col gap-1 bg-gray-100 dark:bg-zinc-950 px-6 py-4 rounded-xl shadow-inner border border-gray-200 dark:border-zinc-800 min-w-[110px]">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"><Zap className="w-3.5 h-3.5"/> SHINE</span>
                  <span className="text-4xl font-teko text-zinc-900 dark:text-white">+{mission.rewards?.shine || 0}</span>
                </div>
                
                <div className="flex flex-col gap-1 bg-gray-100 dark:bg-zinc-950 px-6 py-4 rounded-xl shadow-inner border border-gray-200 dark:border-zinc-800 min-w-[110px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5"/> SP</span>
                  <span className="text-4xl font-teko text-zinc-900 dark:text-white">+{mission.rewards?.skillpoints || 0}</span>
                </div>
                
                {mission.rewards?.specific_skills?.map((skill: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-1 bg-cyan-50 dark:bg-cyan-950/30 px-6 py-4 rounded-xl shadow-sm border border-cyan-200 dark:border-cyan-900/50 min-w-[110px]">
                    <span className="text-cyan-700 dark:text-cyan-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"><Cpu className="w-3.5 h-3.5"/> {skill.name}</span>
                    <span className="text-4xl font-teko text-zinc-900 dark:text-white">+{skill.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Objectives & Extraction */}
        <div className="flex-1 flex flex-col w-full relative z-20">
          
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-zinc-800 pb-4">
            <h2 className="font-teko text-4xl md:text-5xl uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-4">
              <Radio className="w-8 h-8 text-[#ff4655] animate-pulse" />
              Objectives
            </h2>
            <div className={`font-mono text-xs font-bold tracking-[0.2em] px-4 py-2 rounded-md border ${completedSteps.size === steps.length ? `bg-[#ff4655] text-white border-[#ff4655]` : 'bg-gray-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800'} shadow-sm transition-colors`}>
              {completedSteps.size} / {steps.length} SECURED
            </div>
          </div>

          <div className="relative space-y-8 mb-16">
            {/* Dynamic Connection Line */}
            <div className="absolute left-[2.25rem] top-8 bottom-8 w-[2px] bg-gray-200 dark:bg-zinc-800 -z-10" />
            <div 
              className={`absolute left-[2.25rem] top-8 w-[2px] ${aesthetic.accent} ${aesthetic.glow} -z-10 transition-all duration-1000`} 
              style={{ height: steps.length > 0 ? `${(completedSteps.size / steps.length) * 100}%` : '0%' }}
            />

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
                    className={`relative p-8 rounded-2xl flex gap-6 cursor-pointer transition-all duration-300 group hover:-translate-y-1 shadow-lg ${
                      isDone 
                        ? `${aesthetic.bg} ${aesthetic.primaryBorder} border shadow-xl` 
                        : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    {isDone && (
                      <div className={`absolute inset-0 ${aesthetic.accent} opacity-5 blur-xl pointer-events-none rounded-2xl`} />
                    )}
                    
                    <div className="flex-shrink-0 relative z-10 bg-white dark:bg-zinc-950 rounded-full p-1 self-start shadow-sm border border-gray-100 dark:border-zinc-800">
                      {isDone ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring" }}
                        >
                          <CheckCircle className={`w-12 h-12 ${aesthetic.text} drop-shadow-[0_0_12px_currentColor]`} />
                        </motion.div>
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-500 font-teko text-3xl group-hover:border-zinc-500 dark:group-hover:border-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="relative z-10 flex-grow pt-1">
                      <h3 className={`text-4xl font-teko uppercase mb-2 tracking-wide transition-colors ${isDone ? 'text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-lg mb-6 leading-relaxed transition-colors ${isDone ? 'text-zinc-800 dark:text-zinc-200 font-medium' : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-300'}`}>
                        {step.instruction}
                      </p>
                      
                      <div className={`inline-flex items-center gap-3 text-xs font-mono px-4 py-2.5 rounded-lg border shadow-sm ${
                        isDone 
                          ? `bg-white dark:bg-zinc-900 ${aesthetic.textDark} border-gray-200 dark:border-zinc-700` 
                          : 'bg-gray-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800'
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
          <div className="relative group mt-auto">
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
                  ? `bg-[#ff4655] hover:bg-[#e03e4b] text-white shadow-[0_0_40px_rgba(255,70,85,0.4)] hover:shadow-[0_0_60px_rgba(255,70,85,0.6)] hover:-translate-y-2 border-0`
                  : 'bg-white dark:bg-zinc-900 text-gray-400 dark:text-zinc-600 cursor-not-allowed border-2 border-gray-200 dark:border-zinc-800 shadow-sm'
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
                    <Crosshair className={`w-12 h-12 md:w-16 md:h-16 ${completedSteps.size === steps.length ? 'text-white' : 'text-gray-400 dark:text-zinc-600'}`} />
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
      <div className="h-2 w-full bg-gradient-to-r from-transparent via-zinc-300 dark:via-[#ff4655] to-transparent mt-12 opacity-50 relative z-10" />
    </div>
  );
}
