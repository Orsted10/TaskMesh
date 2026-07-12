'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Link as LinkIcon, Type, Cpu, Crosshair, ChevronRight, ShieldAlert, Check, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase-client';

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
  const { user } = useAuth();
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
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate');

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
      // 1. Save Quest
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

      // 2. Save Steps
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

      // 3. Create User Progress (Start the mission)
      const { data: progressData, error: progressError } = await supabase
        .from('user_quest_progress')
        .insert({
          user_id: user.id,
          quest_id: questData.id,
          status: 'in_progress',
        })
        .select()
        .single();

      if (progressError) throw progressError;

      toast.success('Mission Accepted!', { description: 'Added to your active operations.' });
      
      // Reset for next mission
      setGeneratedQuest(null);
      setPayload('');

    } catch (err: any) {
      toast.error('Failed to accept mission', { description: err.message });
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center p-6 sm:p-12 relative overflow-hidden bg-zinc-950 text-zinc-50 min-h-screen pt-24">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff4655]/40 to-transparent shadow-[0_0_15px_rgba(255,70,85,0.4)]" />

      <div className="z-10 w-full max-w-4xl space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-500 font-teko">
            Command Center
          </h1>
          <p className="text-[#ff4655] tracking-[0.3em] text-sm font-semibold">INITIALIZE NEW OPERATION</p>
        </motion.div>

        {/* Input Engine */}
        {!generatedQuest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden p-1 shadow-2xl relative"
          >
            {isProcessing && (
              <div className="absolute inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                <Cpu className="w-12 h-12 text-[#ff4655] animate-pulse" />
                <p className="text-[#ff4655] font-teko text-2xl tracking-widest uppercase animate-pulse">Groq Engine Computing...</p>
              </div>
            )}

            <div className="flex p-2 gap-2 bg-zinc-950/50 border-b border-zinc-800/50">
              <button
                type="button"
                onClick={() => setInputType('text')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${inputType === 'text' ? 'bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/30 shadow-[0_0_15px_rgba(255,70,85,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Type className="w-4 h-4" /> Raw Intel
              </button>
              <button
                type="button"
                onClick={() => setInputType('url')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${inputType === 'url' ? 'bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/30 shadow-[0_0_15px_rgba(255,70,85,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <LinkIcon className="w-4 h-4" /> Data Link
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-6 space-y-6">
              {inputType === 'text' ? (
                <Textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder="Describe your objective in detail..."
                  className="min-h-[150px] bg-zinc-950 border-zinc-800 focus-visible:ring-[#ff4655]/50 text-lg resize-none"
                />
              ) : (
                <Input
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder="Paste a URL (YouTube, Article, Documentation)..."
                  className="h-16 bg-zinc-950 border-zinc-800 focus-visible:ring-[#ff4655]/50 text-lg"
                />
              )}

              <Button 
                type="submit" 
                disabled={!payload.trim() || isProcessing}
                className="w-full h-16 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white font-teko text-2xl tracking-widest uppercase group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,70,85,0.3)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-2">
                  <Sparkles className="w-6 h-6" /> Generate Mission
                </span>
              </Button>
            </form>
          </motion.div>
        )}

        {/* Generated Quest Output */}
        <AnimatePresence>
          {generatedQuest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Mission Briefing */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4655]/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="flex justify-between items-start mb-6 relative">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{generatedQuest.quest.title}</h2>
                    <p className="text-zinc-400 text-lg">{generatedQuest.quest.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs uppercase tracking-widest font-bold rounded-md border border-zinc-700">
                      Difficulty: {generatedQuest.quest.difficulty}/5
                    </span>
                    <span className="px-3 py-1 bg-[#ff4655]/20 text-[#ff4655] text-xs uppercase tracking-widest font-bold rounded-md border border-[#ff4655]/30">
                      {generatedQuest.quest.category}
                    </span>
                  </div>
                </div>

                {/* Steps Timeline */}
                <div className="space-y-4 mt-10 relative">
                  <div className="absolute left-6 top-4 bottom-4 w-px bg-zinc-800" />
                  {generatedQuest.steps.map((step) => (
                    <div key={step.order_index} className="flex gap-6 relative group/step">
                      <div className="w-12 h-12 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center shrink-0 group-hover/step:border-[#ff4655] transition-colors relative z-10 text-zinc-500 group-hover/step:text-[#ff4655] font-bold">
                        {step.order_index}
                      </div>
                      <div className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-900 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold text-zinc-100">{step.title}</h3>
                          <span className="text-zinc-500 text-sm font-mono">{Math.round(step.estimated_time_seconds / 60)} min</span>
                        </div>
                        <p className="text-zinc-400 text-sm">{step.instruction}</p>
                        
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#ff4655]/70 bg-[#ff4655]/5 px-3 py-2 rounded-md border border-[#ff4655]/10">
                          <ShieldAlert className="w-4 h-4" />
                          <span>AI Check: {step.ai_validation_prompt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex gap-4">
                  <Button
                    onClick={() => setGeneratedQuest(null)}
                    variant="outline"
                    className="flex-1 h-14 border-zinc-700 text-zinc-400 hover:text-white"
                  >
                    ABORT
                  </Button>
                  <Button
                    onClick={handleAcceptMission}
                    disabled={isAccepting}
                    className="flex-2 w-2/3 h-14 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white font-teko text-2xl tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,70,85,0.4)]"
                  >
                    {isAccepting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Crosshair className="w-5 h-5 mr-2" /> ACCEPT MISSION</>}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
