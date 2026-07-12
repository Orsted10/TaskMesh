'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ShieldAlert, CheckCircle, Crosshair, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getTierAesthetic } from '@/lib/rpg-data';

export default function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [mission, setMission] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

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
      // 1. Mark as complete
      await supabase
        .from('user_quest_progress')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('quest_id', mission.id)
        .eq('user_id', user!.id);
        
      // 2. Add EXP, Gold, Shine, Skillpoints, and Specific Skills
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#ff4655] animate-spin" />
      </div>
    );
  }

  const aesthetic = getTierAesthetic(mission.tier);

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-zinc-300 relative overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute inset-0 ${aesthetic.bg} opacity-20 blur-3xl`} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="max-w-5xl mx-auto w-full p-6 md:p-12 relative z-10 pt-24 flex-grow flex flex-col">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="self-start mb-8 text-zinc-500 hover:text-white hover:bg-zinc-900 uppercase tracking-widest font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Abort Operation
        </Button>

        {/* Mission Header */}
        <div className={`mb-12 border-l-4 ${aesthetic.primaryBorder} pl-8 relative`}>
          <div className={`absolute -left-[4px] top-0 bottom-0 w-[4px] ${aesthetic.accent} animate-pulse ${aesthetic.glow}`} />
          
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded border ${aesthetic.bg} ${aesthetic.textDark} ${aesthetic.border} shadow-inner`}>
              {mission.tier || 'STANDARD OPERATION'}
            </span>
            <span className="text-xs font-bold text-[#ff4655] uppercase tracking-widest bg-[#ff4655]/10 px-4 py-1.5 rounded border border-[#ff4655]/20 shadow-inner">
              LVL {mission.difficulty}
            </span>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              {mission.category}
            </span>
          </div>
          
          <h1 className={`text-6xl md:text-8xl font-teko text-white uppercase leading-none mb-6 drop-shadow-2xl ${aesthetic.glow}`}>
            {mission.title}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-3xl leading-relaxed mb-10">
            {mission.description}
          </p>

          {/* Loot Pool Display */}
          <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 p-6 rounded-xl inline-block shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 left-0 right-0 h-1 ${aesthetic.accent} opacity-50`} />
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
              <Zap className={`w-4 h-4 ${aesthetic.text}`} /> Expected Loot Yield
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-2xl font-teko text-white bg-zinc-950 px-6 py-2 rounded shadow-inner border border-zinc-800/80 flex items-center gap-2">
                <span className="text-[#ff4655]">EXP</span> +{mission.rewards?.xp || mission.difficulty * 100}
              </span>
              <span className="text-2xl font-teko text-white bg-zinc-950 px-6 py-2 rounded shadow-inner border border-zinc-800/80 flex items-center gap-2">
                <span className="text-yellow-500">GOLD</span> +{mission.rewards?.gold || 0}
              </span>
              <span className="text-2xl font-teko text-white bg-zinc-950 px-6 py-2 rounded shadow-inner border border-zinc-800/80 flex items-center gap-2">
                <span className="text-purple-400">SHINE</span> +{mission.rewards?.shine || 0}
              </span>
              <span className="text-2xl font-teko text-white bg-zinc-950 px-6 py-2 rounded shadow-inner border border-zinc-800/80 flex items-center gap-2">
                <span className="text-emerald-400">SP</span> +{mission.rewards?.skillpoints || 0}
              </span>
              {mission.rewards?.specific_skills?.map((skill: any, idx: number) => (
                <span key={idx} className="text-xl font-teko text-white bg-cyan-950/50 px-5 py-2 rounded shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/30 flex items-center gap-2">
                  <span className="text-cyan-400">{skill.name.toUpperCase()}</span> +{skill.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="space-y-4 mb-16 flex-grow">
          {steps.map((step, idx) => {
            const isDone = completedSteps.has(step.id);
            return (
              <div 
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`p-6 border-2 rounded-xl flex gap-6 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] ${
                  isDone 
                    ? `${aesthetic.bg} ${aesthetic.border}` 
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {isDone && (
                  <div className={`absolute inset-0 ${aesthetic.accent} opacity-5 blur-2xl`} />
                )}
                
                <div className="flex-shrink-0 mt-1 relative z-10">
                  {isDone ? (
                    <CheckCircle className={`w-10 h-10 ${aesthetic.text} drop-shadow-[0_0_10px_currentColor]`} />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-zinc-700 flex items-center justify-center text-zinc-500 font-teko text-2xl group-hover:border-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className="relative z-10">
                  <h3 className={`text-3xl font-teko uppercase mb-2 transition-colors ${isDone ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm mb-4 transition-colors ${isDone ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                    {step.instruction}
                  </p>
                  
                  <div className={`inline-flex items-center gap-2 text-xs font-mono px-3 py-2 rounded border ${
                    isDone 
                      ? `${aesthetic.bg} ${aesthetic.textDark} ${aesthetic.border}` 
                      : 'bg-cyan-950/20 text-cyan-600 border-cyan-900/30 group-hover:border-cyan-500/30 group-hover:text-cyan-400'
                  } transition-colors`}>
                    <ShieldAlert className="w-4 h-4" /> 
                    <span>AI VERIFY: {step.ai_validation_prompt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Button */}
        <Button
          onClick={handleCompleteMission}
          disabled={completing || completedSteps.size < steps.length}
          className={`w-full h-24 rounded-xl font-teko text-5xl tracking-[0.2em] uppercase transition-all duration-500 ${
            completedSteps.size === steps.length
              ? `${aesthetic.accent} hover:opacity-90 text-white ${aesthetic.glow} scale-[1.02]`
              : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border-2 border-zinc-800'
          }`}
        >
          {completing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <>
              <Crosshair className={`w-10 h-10 mr-4 ${completedSteps.size === steps.length ? 'animate-pulse' : ''}`} />
              {completedSteps.size === steps.length ? 'EXTRACT LOOT' : 'AWAITING STEP COMPLETION'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
