'use client';

import { motion } from 'framer-motion';
import { Gavel, CheckCircle2, XCircle, AlertTriangle, Scale, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const MOCK_CASES = [
  {
    id: 'case-9942',
    user: 'GhostProtocol',
    task: 'Map 14 Potholes in Sector 4',
    proofImage: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80',
    aiVerdict: 'REJECTED',
    aiConfidence: '82%',
    aiReasoning: 'Image contains insufficient depth data. High probability of being a pre-existing photograph rather than live capture. Lack of visible metadata confirming coordinates.',
    timestamp: '14 mins ago'
  },
  {
    id: 'case-9943',
    user: 'Viper_09',
    task: 'Write 500 words of sci-fi novel',
    proofImage: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80',
    aiVerdict: 'REJECTED',
    aiConfidence: '95%',
    aiReasoning: 'Text analysis indicates 98% probability of LLM generation (AI-written). Vocabulary distribution does not match historical user baselines.',
    timestamp: '1 hour ago'
  }
];

export default function TribunalPage() {
  const [cases, setCases] = useState(MOCK_CASES);
  const [activeCase, setActiveCase] = useState(MOCK_CASES[0]);

  const handleVerdict = (caseId: string, action: 'overturn' | 'uphold') => {
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
      setActiveCase(null as any);
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
          {cases.length === 0 ? (
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
                  <span className="text-[9px] text-zinc-500 font-mono uppercase">{c.id}</span>
                  <span className="text-[9px] text-zinc-600 font-mono">{c.timestamp}</span>
                </div>
                <h3 className="font-teko text-xl text-white uppercase leading-none">{c.user}</h3>
                <p className="text-[11px] text-zinc-400 uppercase tracking-widest truncate">{c.task}</p>
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
                    <span>Target: {activeCase.user}</span>
                    <span>|</span>
                    <span>{activeCase.id}</span>
                  </div>
                  <h2 className="font-teko text-3xl text-white uppercase tracking-widest leading-none">
                    {activeCase.task}
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
                    <img src={activeCase.proofImage} alt="Proof" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
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
                      <span className="font-teko text-2xl text-red-500 uppercase">Verdict: {activeCase.aiVerdict}</span>
                      <span className="text-[10px] font-mono text-zinc-400 bg-black px-2 py-1 rounded border border-zinc-800">
                        Confidence: {activeCase.aiConfidence}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-widest leading-relaxed">
                      {activeCase.aiReasoning}
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

// Need to inject Cpu and Crosshair icons since we used them
import { Cpu, Crosshair } from 'lucide-react';
