'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ShieldAlert, CheckCircle, Crosshair, Zap, Activity, Clock, Terminal, AlertTriangle, Fingerprint, Database, Cpu, Wifi, Radio, BookOpen, PenLine, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getTierAesthetic } from '@/lib/rpg-data';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const { user, rpgProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [mission, setMission] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  
  // Persistence & Action Bar States
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [progressId, setProgressId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<Record<string, 'teach' | 'notes' | 'resources' | null>>({});
  const [teachData, setTeachData] = useState<Record<string, { loading: boolean, data: string | null }>>({});
  const [notesData, setNotesData] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<Record<string, boolean>>({});

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

      // Fetch progress and verifications to persist state
      const { data: progressData } = await supabase
        .from('user_quest_progress')
        .select('id')
        .eq('quest_id', resolvedParams.id)
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .single();

      if (progressData) {
        setProgressId(progressData.id);
        const { data: verifications } = await supabase
          .from('user_step_verifications')
          .select('step_id, metadata, status')
          .eq('progress_id', progressData.id);

        if (verifications) {
          const completed = new Set<string>();
          const loadedNotes: Record<string, string> = {};
          verifications.forEach(v => {
            if (v.status === 'verified') completed.add(v.step_id);
            if (v.metadata && (v.metadata as any).notes) {
              loadedNotes[v.step_id] = (v.metadata as any).notes;
            }
          });
          setCompletedSteps(completed);
          setNotesData(loadedNotes);
        }
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

  const toggleStep = async (stepId: string) => {
    if (!progressId) return;

    const newSet = new Set(completedSteps);
    const isCurrentlyDone = newSet.has(stepId);
    
    if (isCurrentlyDone) {
      newSet.delete(stepId);
    } else {
      newSet.add(stepId);
    }
    setCompletedSteps(newSet); // Optimistic UI update

    // Upsert into DB (manually via select then update/insert to avoid unique constraint errors)
    const currentNotes = notesData[stepId] || '';
    const newStatus = isCurrentlyDone ? 'pending' : 'verified';
    
    const { data: existing } = await supabase
      .from('user_step_verifications')
      .select('id')
      .eq('progress_id', progressId)
      .eq('step_id', stepId)
      .maybeSingle();

    if (existing) {
      await supabase.from('user_step_verifications').update({
        status: newStatus,
        metadata: { notes: currentNotes }
      }).eq('id', existing.id);
    } else {
      await supabase.from('user_step_verifications').insert({
        progress_id: progressId,
        step_id: stepId,
        status: newStatus,
        metadata: { notes: currentNotes }
      });
    }
  };

  const handleSaveNote = async (stepId: string, note: string) => {
    if (!progressId) return;
    setSavingNote(prev => ({ ...prev, [stepId]: true }));
    const isDone = completedSteps.has(stepId);
    const newStatus = isDone ? 'verified' : 'pending';

    const { data: existing } = await supabase
      .from('user_step_verifications')
      .select('id')
      .eq('progress_id', progressId)
      .eq('step_id', stepId)
      .maybeSingle();

    if (existing) {
      await supabase.from('user_step_verifications').update({
        status: newStatus,
        metadata: { notes: note }
      }).eq('id', existing.id);
    } else {
      await supabase.from('user_step_verifications').insert({
        progress_id: progressId,
        step_id: stepId,
        status: newStatus,
        metadata: { notes: note }
      });
    }
    toast.success('Notes Secured!');
    setSavingNote(prev => ({ ...prev, [stepId]: false }));
  };

  const handleTeachMe = async (step: any) => {
    if (teachData[step.id]?.loading) return;
    
    setTeachData(prev => ({ ...prev, [step.id]: { loading: true, data: null } }));
    
    try {
       const res = await fetch('/api/ai/teach', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           stepTitle: step.title,
           stepInstruction: step.instruction,
           userSkills: rpgProfile?.specific_skills || {}
         })
       });
       const json = await res.json();
       setTeachData(prev => ({ ...prev, [step.id]: { loading: false, data: json.response } }));
    } catch (e) {
       setTeachData(prev => ({ ...prev, [step.id]: { loading: false, data: 'Error establishing teacher link.' } }));
    }
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

      <div className="max-w-7xl mx-auto w-full p-6 md:p-12 relative z-10 pt-20 flex-grow grid grid-cols-1 xl:grid-cols-2 gap-16">
        
        {/* LEFT COLUMN: Mission Briefing & Stats */}
        <div className="flex flex-col relative z-20 w-full min-w-0">
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="self-start mb-8 text-[#ff4655] hover:text-white border-[#ff4655] hover:bg-[#ff4655] uppercase tracking-[0.2em] font-bold text-xs group transition-all rounded-sm shadow-[0_0_15px_rgba(255,70,85,0.2)] hover:shadow-[0_0_25px_rgba(255,70,85,0.6)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,70,85,0.1)_5px,rgba(255,70,85,0.1)_10px)] pointer-events-none" />
            <AlertTriangle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">EMERGENCY ABORT</span>
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
        <div className="flex flex-col relative z-20 w-full min-w-0">
          
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-zinc-800 pb-4">
            <h2 className="font-teko text-4xl md:text-5xl uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-4">
              <Radio className={`w-8 h-8 ${aesthetic.text} animate-pulse`} />
              Objectives
            </h2>
            <div className={`font-mono text-xs font-bold tracking-[0.2em] px-4 py-2 rounded-md border ${completedSteps.size === steps.length ? `${aesthetic.accent} text-white ${aesthetic.primaryBorder}` : 'bg-gray-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800'} shadow-sm transition-colors`}>
              {completedSteps.size} / {steps.length} SECURED
            </div>
          </div>

          <div className="relative space-y-8 mb-16">
            {/* Dynamic Connection Line */}
            {steps.length > 1 && (
              <>
                <div className="absolute left-[3.75rem] top-14 bottom-14 w-[2px] bg-gray-200 dark:bg-zinc-800 -z-10" />
                <div 
                  className={`absolute left-[3.75rem] top-14 w-[2px] ${aesthetic.accent} ${aesthetic.glow} -z-10 transition-all duration-1000`} 
                  style={{ height: `${(completedSteps.size / (steps.length - 1)) * 100}%`, maxHeight: 'calc(100% - 3.5rem)' }}
                />
              </>
            )}

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
                    className={`relative p-8 rounded-2xl flex gap-6 cursor-pointer transition-all duration-500 group hover:-translate-y-1 shadow-2xl border ${
                      isDone 
                        ? `bg-zinc-50 dark:bg-zinc-950/90 ${aesthetic.primaryBorder} shadow-[0_0_30px_rgba(var(--color),0.1)] backdrop-blur-xl` 
                        : 'bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border-gray-300 dark:border-zinc-700/50 hover:border-gray-400 dark:hover:border-zinc-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                    }`}
                  >
                    {isDone && (
                      <div className={`absolute inset-0 ${aesthetic.accent} opacity-[0.04] dark:opacity-[0.07] blur-2xl pointer-events-none rounded-2xl`} />
                    )}
                    
                    <div className="flex-shrink-0 relative z-10 bg-white/50 dark:bg-zinc-950/80 rounded-full p-1 self-start shadow-inner border border-gray-200 dark:border-zinc-800 backdrop-blur-md">
                      {isDone ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring" }}
                        >
                          <CheckCircle className={`w-12 h-12 ${aesthetic.text} drop-shadow-[0_0_15px_currentColor]`} />
                        </motion.div>
                      ) : (
                        <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-gray-600 dark:text-zinc-400 font-teko text-3xl group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                          <motion.div 
                            animate={{ rotate: 360 }} 
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-2 border-gray-400 dark:border-zinc-600 border-dashed opacity-50 group-hover:opacity-100 group-hover:border-zinc-400"
                          />
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="relative z-10 flex-grow pt-1">
                      <h3 className={`text-4xl font-teko uppercase mb-2 tracking-wide transition-colors ${isDone ? 'text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-lg mb-6 leading-relaxed transition-colors ${isDone ? 'text-zinc-800 dark:text-zinc-200 font-medium' : 'text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-800 dark:group-hover:text-zinc-200'}`}>
                        {step.instruction}
                      </p>
                      
                      <div className={`inline-flex items-center gap-3 text-xs font-mono px-4 py-2.5 rounded-lg border shadow-sm mb-6 ${
                        isDone 
                          ? `bg-white dark:bg-zinc-900 ${aesthetic.textDark} border-gray-200 dark:border-zinc-700` 
                          : 'bg-gray-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border-gray-300 dark:border-zinc-700'
                      } transition-colors`}>
                        <Fingerprint className={`w-4 h-4 ${isDone ? aesthetic.text : 'text-zinc-600 dark:text-zinc-400'}`} /> 
                        <span><span className="font-bold opacity-60 mr-2">VERIFY:</span> {step.ai_validation_prompt}</span>
                      </div>

                      {/* ACTION BAR */}
                      <div className="flex flex-col gap-4 mt-4 relative z-20" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setActiveAction(prev => ({ ...prev, [step.id]: prev[step.id] === 'teach' ? null : 'teach' }));
                              if (!teachData[step.id]?.data && activeAction[step.id] !== 'teach') {
                                handleTeachMe(step);
                              }
                            }}
                            className={`text-xs uppercase tracking-widest font-bold ${activeAction[step.id] === 'teach' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500' : 'text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                          >
                            <BookOpen className="w-3.5 h-3.5 mr-2" /> Teach Me
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveAction(prev => ({ ...prev, [step.id]: prev[step.id] === 'notes' ? null : 'notes' }))}
                            className={`text-xs uppercase tracking-widest font-bold ${activeAction[step.id] === 'notes' ? 'bg-amber-500/10 text-amber-500 border-amber-500' : 'text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                          >
                            <PenLine className="w-3.5 h-3.5 mr-2" /> Mission Logs
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveAction(prev => ({ ...prev, [step.id]: prev[step.id] === 'resources' ? null : 'resources' }))}
                            className={`text-xs uppercase tracking-widest font-bold ${activeAction[step.id] === 'resources' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500' : 'text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-2" /> Resources
                          </Button>
                        </div>

                        {/* ACTION CONTENT PANELS */}
                        <AnimatePresence>
                          {activeAction[step.id] === 'teach' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-6 mt-2 relative">
                                {teachData[step.id]?.loading ? (
                                  <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-mono text-sm uppercase tracking-widest animate-pulse">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Uplinking to Teacher AI...
                                  </div>
                                ) : (
                                  <div className="prose prose-sm dark:prose-invert max-w-none prose-indigo prose-headings:font-teko prose-headings:uppercase prose-headings:tracking-wider prose-pre:bg-indigo-950/30 prose-pre:border prose-pre:border-indigo-900/50 prose-a:text-indigo-500 hover:prose-a:text-indigo-400 text-zinc-800 dark:text-zinc-200">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {teachData[step.id]?.data || ''}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}

                          {activeAction[step.id] === 'notes' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 mt-2">
                                <textarea 
                                  value={notesData[step.id] || ''}
                                  onChange={e => setNotesData(prev => ({ ...prev, [step.id]: e.target.value }))}
                                  placeholder="Record your mission logs here... (e.g. Snippets, reminders, pain points)"
                                  className="w-full h-32 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none font-mono"
                                />
                                <div className="flex justify-end mt-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold tracking-widest uppercase"
                                    onClick={() => handleSaveNote(step.id, notesData[step.id] || '')}
                                    disabled={savingNote[step.id]}
                                  >
                                    {savingNote[step.id] ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                                    Save Logs
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {activeAction[step.id] === 'resources' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="bg-cyan-50 dark:bg-cyan-950/10 border border-cyan-100 dark:border-cyan-900/30 rounded-xl p-6 mt-2">
                                <h4 className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Info className="w-4 h-4"/> External Intel</h4>
                                {step.resources && step.resources.length > 0 ? (
                                  <ul className="space-y-3">
                                    {step.resources.map((res: any, i: number) => (
                                      <li key={i}>
                                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-2 transition-colors">
                                          <ExternalLink className="w-3 h-3" />
                                          {res.title}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-zinc-500 font-mono italic">No external intel found for this step.</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
              className={`w-full h-32 rounded-3xl font-teko text-5xl md:text-6xl tracking-[0.2em] uppercase transition-all duration-500 relative overflow-hidden z-10 group border-2 ${
                completedSteps.size === steps.length
                  ? `${aesthetic.accent} hover:opacity-90 text-white ${aesthetic.glow} hover:-translate-y-2 border-transparent shadow-2xl`
                  : 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)] bg-zinc-100 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-500 cursor-not-allowed border-zinc-300 dark:border-zinc-800/80 shadow-inner backdrop-blur-md'
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
                    {completedSteps.size === steps.length ? (
                      <Crosshair className={`w-12 h-12 md:w-16 md:h-16 text-white`} />
                    ) : (
                      <AlertTriangle className={`w-12 h-12 md:w-16 md:h-16 text-zinc-400 dark:text-zinc-600 opacity-50`} />
                    )}
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
