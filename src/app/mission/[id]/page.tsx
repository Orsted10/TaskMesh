'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ShieldAlert, CheckCircle, Crosshair, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff4655] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-300 relative overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10 pt-24">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-8 text-zinc-500 hover:text-white hover:bg-zinc-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Command Center
        </Button>

        <div className="mb-12 border-l-4 border-[#ff4655] pl-6 relative">
          <div className="absolute -left-[3px] top-0 bottom-0 w-[2px] bg-[#ff4655] animate-pulse shadow-[0_0_15px_#ff4655]" />
          
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded border 
              ${mission.tier?.toLowerCase().includes('legendary') || mission.tier?.toLowerCase().includes('boss') 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
              {mission.tier || 'STANDARD OPERATION'}
            </span>
            <span className="text-xs font-bold text-[#ff4655] uppercase tracking-widest bg-[#ff4655]/10 px-3 py-1 rounded border border-[#ff4655]/20">
              LVL {mission.difficulty}
            </span>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              {mission.category}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-teko text-white uppercase leading-none mb-4 shadow-red-500/20 drop-shadow-lg">
            {mission.title}
          </h1>
          <p className="text-xl text-zinc-400 font-light max-w-2xl mb-8">
            {mission.description}
          </p>

          {/* Loot Pool Display */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-lg inline-block">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Estimated Loot</div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-teko text-white bg-zinc-800/80 px-4 py-1 rounded shadow-inner border border-zinc-700/50">
                <span className="text-[#ff4655]">EXP</span> +{mission.rewards?.xp || mission.difficulty * 100}
              </span>
              <span className="text-lg font-teko text-white bg-zinc-800/80 px-4 py-1 rounded shadow-inner border border-zinc-700/50">
                <span className="text-yellow-500">GOLD</span> +{mission.rewards?.gold || 0}
              </span>
              <span className="text-lg font-teko text-white bg-zinc-800/80 px-4 py-1 rounded shadow-inner border border-zinc-700/50">
                <span className="text-purple-400">SHINE</span> +{mission.rewards?.shine || 0}
              </span>
              <span className="text-lg font-teko text-white bg-zinc-800/80 px-4 py-1 rounded shadow-inner border border-zinc-700/50">
                <span className="text-emerald-400">SP</span> +{mission.rewards?.skillpoints || 0}
              </span>
              {mission.rewards?.specific_skills?.map((skill: any, idx: number) => (
                <span key={idx} className="text-lg font-teko text-white bg-cyan-900/30 px-4 py-1 rounded shadow-inner border border-cyan-700/50">
                  <span className="text-cyan-400">{skill.name.toUpperCase()}</span> +{skill.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-12">
          {steps.map((step, idx) => {
            const isDone = completedSteps.has(step.id);
            return (
              <div 
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`p-6 border rounded-none flex gap-6 cursor-pointer transition-all duration-300 ${
                  isDone 
                    ? 'bg-[#ff4655]/5 border-[#ff4655]/50' 
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {isDone ? (
                    <CheckCircle className="w-8 h-8 text-[#ff4655]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-700 flex items-center justify-center text-zinc-500 font-teko text-xl">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={`text-2xl font-teko uppercase mb-2 ${isDone ? 'text-white' : 'text-zinc-200'}`}>
                    {step.title}
                  </h3>
                  <p className="text-zinc-400 mb-4">{step.instruction}</p>
                  
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-3 py-2 rounded">
                    <ShieldAlert className="w-4 h-4" /> 
                    <span>AI VERIFICATION: {step.ai_validation_prompt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleCompleteMission}
          disabled={completing || completedSteps.size < steps.length}
          className={`w-full h-20 rounded-none font-teko text-4xl tracking-widest uppercase transition-all duration-500 ${
            completedSteps.size === steps.length
              ? 'bg-[#ff4655] hover:bg-[#ff4655]/90 text-white shadow-[0_0_30px_rgba(255,70,85,0.5)] hover:shadow-[0_0_50px_rgba(255,70,85,0.8)]'
              : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {completing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <Crosshair className="w-8 h-8 mr-4" />
              {completedSteps.size === steps.length ? 'COMPLETE MISSION' : 'AWAITING STEP COMPLETION'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
