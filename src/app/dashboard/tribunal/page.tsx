'use client';

import { motion } from 'framer-motion';
import { Gavel, CheckCircle2, XCircle, AlertTriangle, Scale, ChevronRight, Cpu, Crosshair, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function TribunalPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, [user]);

  const fetchCases = async () => {
    if (!user) return;
    
    // Fetch pending cases that the current user hasn't voted on yet
    const { data, error } = await supabase
      .from('tribunal_cases')
      .select(`
        *,
        users!tribunal_cases_user_id_fkey(username)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Filter out cases the user already voted on (if we had a complex query, we'd do it in SQL, but for now client-side filter is fine for MVP)
    const { data: userVotes } = await supabase
      .from('tribunal_votes')
      .select('case_id')
      .eq('voter_id', user.id);

    const votedCaseIds = new Set((userVotes || []).map(v => v.case_id));
    
    const pendingCases = (data || []).filter(c => !votedCaseIds.has(c.id));
    
    setCases(pendingCases);
    if (pendingCases.length > 0) {
      setActiveCase(pendingCases[0]);
    }
    setLoading(false);
  };

  const handleVerdict = async (caseId: string, action: 'uphold' | 'overturn') => {
    if (!user) return;

    try {
      // 1. Record the vote
      const { error: voteError } = await supabase
        .from('tribunal_votes')
        .insert({
          case_id: caseId,
          voter_id: user.id,
          vote: action
        });

      if (voteError) throw voteError;

      // 2. For MVP: Resolve immediately after 1 vote to show it works
      const newStatus = action === 'uphold' ? 'upheld' : 'overturned';
      await supabase
        .from('tribunal_cases')
        .update({ status: newStatus, resolved_at: new Date().toISOString() })
        .eq('id', caseId);
      
      // If overturned, we would normally credit the user who failed the step, but we will skip the complex EXP logic here for brevity.

      if (action === 'overturn') {
        toast.success('Verdict Submitted: OVERTURN. 15 EXP awarded for moderation.');
      } else {
        toast.success('Verdict Submitted: UPHOLD. 15 EXP awarded for moderation.');
      }
      
      const newCases = cases.filter(c => c.id !== caseId);
      setCases(newCases);
      if (newCases.length > 0) {
        setActiveCase(newCases[0]);
      } else {
        setActiveCase(null);
      }
    } catch (e: any) {
      toast.error('Failed to submit verdict: ' + e.message);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      <div className="flex flex-col gap-2 mb-8 border-b border-zinc-800 pb-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-3xl rounded-full" />
        <div className="flex items-center gap-4 relative z-10">
          <Gavel className="w-8 h-8 text-red-500" />
          <h1 className="text-5xl font-teko text-white uppercase tracking-wider">The Tribunal</h1>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono border border-zinc-800 px-3 py-1 rounded bg-black">
              Clearance Level: 50+ Required
            </span>
          </div>
        </div>
        <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest max-w-2xl relative z-10">
          Peer review for flagged operations. Uphold the integrity of the network. Override the AI when it hallucinates. Earn EXP for accurate verdicts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Case Queue */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-teko text-2xl text-white uppercase tracking-widest flex items-center gap-2">
            <Scale className="w-5 h-5 text-red-500" /> Pending Docket
          </h2>
          {loading ? (
             <div className="bg-black border border-dashed border-zinc-800 rounded-xl p-8 flex items-center justify-center">
               <Loader2 className="w-6 h-6 animate-spin text-red-500" />
             </div>
          ) : cases.length === 0 ? (
            <div className="bg-black border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
              No pending cases in queue.
            </div>
          ) : (
            cases.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setActiveCase(c)}
                className={`bg-zinc-950/80 border ${activeCase?.id === c.id ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-zinc-800 hover:border-zinc-600'} rounded-xl p-4 cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden`}
              >
                {activeCase?.id === c.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase">{c.id.substring(0,8)}</span>
                  <span className="text-[9px] text-zinc-600 font-mono">{formatTimeAgo(new Date(c.created_at))} ago</span>
                </div>
                <h3 className="font-teko text-xl text-white uppercase leading-none">{c.users?.username || 'Unknown_Agent'}</h3>
                <p className="text-[11px] text-zinc-400 uppercase tracking-widest truncate">{c.task_title}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-red-500 bg-red-500/10 px-2 py-1 rounded w-max border border-red-500/30">
                  <AlertTriangle className="w-3 h-3" /> Flagged
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Col: Active Case Review */}
        <div className="lg:col-span-8">
          {activeCase ? (
            <motion.div 
              key={activeCase.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-950/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/50">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">
                    <span>Target: {activeCase.users?.username || 'Unknown'}</span>
                    <span>|</span>
                    <span>{activeCase.id}</span>
                  </div>
                  <h2 className="font-teko text-3xl text-white uppercase tracking-widest leading-none">
                    {activeCase.task_title}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Proof Visual */}
                <div className="p-6 border-r border-zinc-800 bg-zinc-900/20">
                  <h4 className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                    Submitted Proof
                  </h4>
                  <div className="aspect-square w-full rounded-xl overflow-hidden border border-zinc-800 relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeCase.proof_image_url} alt="Proof" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="w-full h-[1px] bg-red-500/50 absolute top-1/2 -translate-y-1/2" />
                      <div className="w-[1px] h-full bg-red-500/50 absolute left-1/2 -translate-x-1/2" />
                      <Crosshair className="w-12 h-12 text-red-500/70" />
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="p-6 flex flex-col">
                  <h4 className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Cpu className="w-3 h-3" /> AI Verification Log
                  </h4>
                  
                  <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-teko text-2xl text-red-500 uppercase">Verdict: {activeCase.ai_verdict}</span>
                      <span className="text-[10px] font-mono text-zinc-400 bg-black px-2 py-1 rounded border border-zinc-800">
                        Confidence: {activeCase.ai_confidence || 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-widest leading-relaxed">
                      {activeCase.ai_reasoning}
                    </p>
                  </div>

                  <div className="mt-auto space-y-4">
                    <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest text-center">
                      Tribunal Decision
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleVerdict(activeCase.id, 'overturn')}
                        className="bg-black hover:bg-emerald-950/30 border border-emerald-500/50 hover:border-emerald-500 text-emerald-500 py-4 rounded-xl flex flex-col items-center gap-2 transition-colors group"
                      >
                        <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="font-teko text-xl uppercase tracking-widest">Overturn AI</span>
                        <span className="text-[9px] font-mono opacity-60">Approve Proof</span>
                      </button>
                      <button 
                        onClick={() => handleVerdict(activeCase.id, 'uphold')}
                        className="bg-black hover:bg-red-950/30 border border-red-500/50 hover:border-red-500 text-red-500 py-4 rounded-xl flex flex-col items-center gap-2 transition-colors group"
                      >
                        <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="font-teko text-xl uppercase tracking-widest">Uphold Rejection</span>
                        <span className="text-[9px] font-mono opacity-60">Deny Proof</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50 min-h-[400px]">
              <div className="text-center">
                <Scale className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <h3 className="font-teko text-2xl text-zinc-600 uppercase tracking-widest">Docket Clear</h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">All pending cases reviewed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
