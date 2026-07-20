'use client';

import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, Clock, AlertTriangle, Play, CheckCircle2, ShieldAlert, Trash2, FolderOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { getTierAesthetic } from '@/lib/rpg-data';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ActiveOperationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hardcoreMode, setHardcoreMode] = useState(false);
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveMissions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_quest_progress')
        .select(`
          id,
          status,
          started_at,
          quests (
            id,
            title,
            description,
            difficulty,
            category,
            tier,
            rewards,
            campaign_title,
            quest_steps ( id )
          ),
          user_step_verifications ( id, status )
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress', 'verifying'])
        .order('started_at', { ascending: false });
      
      if (!error && data) {
        // Compute derived progress for each mission
        const processedData = data.map(op => {
          const totalSteps = (op.quests as any)?.quest_steps?.length || 0;
          const verifiedSteps = op.user_step_verifications?.filter((v: any) => v.status === 'verified').length || 0;
          const progressPercent = totalSteps > 0 ? Math.round((verifiedSteps / totalSteps) * 100) : 0;
          
          let derivedStatus = 'pending';
          if (progressPercent > 0 && progressPercent < 100) derivedStatus = 'in_progress';
          if (progressPercent === 100) derivedStatus = 'verifying';

          return { ...op, totalSteps, verifiedSteps, progressPercent, derivedStatus };
        });
        setActiveMissions(processedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActiveMissions();
    }
  }, [user]);

  const handleDeleteMission = async (e: React.MouseEvent, progressId: string, questId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently terminate this mission?")) return;
    try {
      // Delete progress first, then quest if user owns it
      await supabase.from('user_quest_progress').delete().eq('id', progressId);
      await supabase.from('quests').delete().eq('id', questId).eq('creator_id', user?.id);
      toast.success("Mission Terminated", { description: "The operation has been permanently scrubbed." });
      fetchActiveMissions();
    } catch (err: any) {
      toast.error('Termination Failed', { description: err.message });
    }
  };

  // Group by Campaign
  const campaigns: Record<string, any[]> = {};
  activeMissions.forEach(m => {
    const camp = m.quests?.campaign_title || 'TACTICAL OPERATION';
    if (!campaigns[camp]) campaigns[camp] = [];
    campaigns[camp].push(m);
  });

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
        <Activity className="w-8 h-8 text-[#ff4655]" />
        <h1 className="text-5xl font-teko text-white uppercase tracking-wider">Active Operations</h1>
        
        <div className="ml-auto flex items-center gap-3 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
          <ShieldAlert className={`w-5 h-5 ${hardcoreMode ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`} />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">
            Permadeath Mode
          </span>
          <button 
            onClick={() => setHardcoreMode(!hardcoreMode)}
            className={`w-12 h-6 rounded-full relative transition-colors ${hardcoreMode ? 'bg-red-500/20 border border-red-500/50' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <motion.div 
              animate={{ x: hardcoreMode ? 24 : 2 }}
              className={`absolute top-1 bottom-1 w-4 rounded-full ${hardcoreMode ? 'bg-red-500' : 'bg-zinc-500'}`}
            />
          </button>
        </div>
      </div>

      {hardcoreMode && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-4"
        >
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-red-500 font-teko text-2xl uppercase leading-none">Hardcore Mode Engaged</h3>
            <p className="text-red-400/80 font-mono text-[10px] uppercase tracking-widest mt-1">A single missed day or failed verification will permanently wipe all stack progress. EXP Rewards x3.</p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff4655]"></div>
        </div>
      ) : activeMissions.length === 0 ? (
        <div className="text-zinc-600 text-sm font-mono uppercase text-center py-20 border border-dashed border-zinc-800 rounded-xl">No active operations found in the matrix. Use the Command Center to synthesize new ones.</div>
      ) : (
        Object.entries(campaigns).map(([campaignTitle, ops]) => {
          const pendingOps = ops.filter(m => m.derivedStatus === 'pending');
          const inProgressOps = ops.filter(m => m.derivedStatus === 'in_progress');
          const verifyingOps = ops.filter(m => m.derivedStatus === 'verifying');

          return (
            <div key={campaignTitle} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg mb-8">
              {/* Campaign Header */}
              <div className="bg-zinc-900/80 border-b border-zinc-800 p-4 flex items-center gap-3">
                <FolderOpen className="w-6 h-6 text-[#ff4655]" />
                <h2 className="font-teko text-4xl text-white uppercase tracking-widest leading-none drop-shadow-md">
                  {campaignTitle}
                </h2>
                <span className="ml-auto text-[10px] font-mono font-bold text-zinc-400 bg-black px-3 py-1 rounded-full border border-zinc-800">
                  {ops.length} MISSIONS
                </span>
              </div>

              {/* Tactical Kanban */}
              <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 bg-gradient-to-b from-black/20 to-transparent">
                
                {/* Pending */}
                <div className="space-y-4">
                  <h3 className="font-teko text-xl text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <LayoutDashboard className="w-4 h-4" /> Not Started
                    <span className="ml-auto text-[10px] bg-zinc-900 px-2 py-0.5 rounded">{pendingOps.length}</span>
                  </h3>
                  {pendingOps.map((op) => {
                    return (
                      <motion.div 
                        key={op.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => router.push(`/mission/${op.quests.id}`)}
                        className="bg-black/80 border border-zinc-800 p-4 rounded-xl cursor-pointer hover:border-zinc-500 transition-colors group relative"
                      >
                        <button onClick={(e) => handleDeleteMission(e, op.id, op.quests.id)} className="absolute top-3 right-3 text-zinc-600 hover:text-red-500 transition-colors p-1 z-20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono border border-zinc-800 px-2 py-0.5 rounded">
                            {op.quests.category || 'General'}
                          </span>
                        </div>
                        <h4 className="font-teko text-2xl text-white uppercase leading-none mb-2 pr-8 relative z-10">{op.quests.title}</h4>
                        <div className="text-[10px] font-mono text-zinc-500 mb-4">{op.totalSteps} Actions Required</div>
                        
                        <div className="flex items-center gap-2 mt-4 relative z-10">
                          <button className="flex-1 bg-zinc-900 hover:bg-[#ff4655]/20 text-[#ff4655] hover:border-[#ff4655]/50 border border-zinc-800 py-2 rounded text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 transition-colors">
                            <Play className="w-3 h-3" /> Engage
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* In Progress */}
                <div className="space-y-4">
                  <h3 className="font-teko text-xl text-blue-500 uppercase tracking-widest flex items-center gap-2 border-b border-blue-900/30 pb-2">
                    <Clock className="w-4 h-4" /> In Progress
                    <span className="ml-auto text-[10px] bg-blue-900/20 border border-blue-900/50 px-2 py-0.5 rounded">{inProgressOps.length}</span>
                  </h3>
                  {inProgressOps.map((op) => (
                    <motion.div 
                      key={op.id}
                      onClick={() => router.push(`/mission/${op.quests.id}`)}
                      className="bg-blue-950/20 border border-blue-500/30 p-4 rounded-xl relative overflow-hidden cursor-pointer group hover:border-blue-500/60"
                    >
                      <button onClick={(e) => handleDeleteMission(e, op.id, op.quests.id)} className="absolute top-3 right-3 text-zinc-600 hover:text-red-500 transition-colors p-1 z-20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <span className="text-[9px] text-blue-400 uppercase tracking-widest font-mono border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/10">
                          {op.quests.category || 'General'}
                        </span>
                      </div>
                      <h4 className="font-teko text-2xl text-white uppercase leading-none mb-4 relative z-10 pr-8">{op.quests.title}</h4>
                      
                      {/* Dynamic Progress Bar */}
                      <div className="relative z-10 mb-4">
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span className="text-zinc-400">Completion</span>
                          <span className="text-blue-400">{op.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${op.progressPercent}%` }} 
                            className="h-full bg-blue-500" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center relative z-10">
                        <span className="text-[10px] text-yellow-500 font-mono font-bold">+{hardcoreMode ? (op.quests.rewards?.xp || 100) * 3 : (op.quests.rewards?.xp || 100)} EXP</span>
                        <button className="bg-blue-500 hover:bg-blue-400 text-black px-4 py-1.5 rounded text-[10px] uppercase tracking-widest font-bold transition-colors">
                          Resume
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Verifying */}
                <div className="space-y-4">
                  <h3 className="font-teko text-xl text-emerald-500 uppercase tracking-widest flex items-center gap-2 border-b border-emerald-900/30 pb-2">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                    <span className="ml-auto text-[10px] bg-emerald-900/20 border border-emerald-900/50 px-2 py-0.5 rounded">{verifyingOps.length}</span>
                  </h3>
                  {verifyingOps.map((op) => (
                    <motion.div 
                      key={op.id}
                      onClick={() => router.push(`/mission/${op.quests.id}`)}
                      className="bg-emerald-950/10 border border-emerald-500/30 p-4 rounded-xl opacity-75 cursor-pointer hover:opacity-100 transition-opacity relative group"
                    >
                      <button onClick={(e) => handleDeleteMission(e, op.id, op.quests.id)} className="absolute top-3 right-3 text-zinc-600 hover:text-red-500 transition-colors p-1 z-20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <span className="text-[9px] text-emerald-500 uppercase tracking-widest font-mono border border-emerald-500/30 px-2 py-0.5 rounded">
                          {op.quests.category || 'General'}
                        </span>
                      </div>
                      <h4 className="font-teko text-2xl text-white uppercase leading-none mb-4 line-through decoration-emerald-500/50 pr-8 relative z-10">{op.quests.title}</h4>
                      
                      <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 p-2 rounded relative z-10">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        AI Vision Model Processing / Completed
                      </div>
                    </motion.div>
                  ))}
                </div>

              </div>
            </div>
          )
        })
      )}
    </div>
  );
}
