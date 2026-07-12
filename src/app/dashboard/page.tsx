'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Link as LinkIcon, Type, Cpu, Crosshair, ShieldAlert, 
  Activity, User as UserIcon, Zap, Target, Trophy, Clock, Loader2,
  Home, LayoutGrid, Gift, Monitor, Star, ShoppingBag, MessageSquare, 
  Plus, Search, Bell, ShoppingCart, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';

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
  const { user, rpgProfile } = useAuth();
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
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate mission.');

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

      const { error: progressError } = await supabase
        .from('user_quest_progress')
        .insert({
          user_id: user.id,
          quest_id: questData.id,
          status: 'in_progress',
        });
      if (progressError) throw progressError;

      toast.success('Mission Accepted!', { description: 'Added to your active operations.' });
      setGeneratedQuest(null);
      setPayload('');

    } catch (err: any) {
      toast.error('Failed to accept mission', { description: err.message });
    } finally {
      setIsAccepting(false);
    }
  };

  // Safe username fallback
  const username = rpgProfile?.username?.toUpperCase() || 'AGENT';

  return (
    <div className="min-h-screen bg-[#fed2d2] flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-white/30">
      
      {/* MAC-STYLE APP WINDOW */}
      <div className="w-full max-w-[1600px] h-[90vh] bg-[#3a111a] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex overflow-hidden border-4 border-[#2b0c13]">
        
        {/* LEFT SIDEBAR (DARK ICON BAR) */}
        <div className="w-20 bg-[#1d0a0f] flex flex-col items-center py-8 justify-between z-20">
          <div className="space-y-6 flex flex-col items-center">
            {/* Logo */}
            <div className="w-10 h-10 mb-6 bg-gradient-to-br from-[#ff4655] to-orange-500 rounded-xl flex items-center justify-center transform rotate-45 shadow-lg">
              <Crosshair className="w-5 h-5 text-white -rotate-45" />
            </div>
            
            {/* Nav Icons */}
            <div className="p-3 bg-[#3a111a] rounded-xl text-[#ff4655] cursor-pointer"><Home className="w-5 h-5" /></div>
            <div className="p-3 text-[#ff4655]/40 hover:text-[#ff4655] transition-colors cursor-pointer"><LayoutGrid className="w-5 h-5" /></div>
            <div className="p-3 text-[#ff4655]/40 hover:text-[#ff4655] transition-colors cursor-pointer"><Gift className="w-5 h-5" /></div>
            <div className="p-3 text-[#ff4655]/40 hover:text-[#ff4655] transition-colors cursor-pointer"><Monitor className="w-5 h-5" /></div>
            <div className="p-3 text-[#ff4655]/40 hover:text-[#ff4655] transition-colors cursor-pointer"><Star className="w-5 h-5" /></div>
            <div className="p-3 text-[#ff4655]/40 hover:text-[#ff4655] transition-colors cursor-pointer"><ShoppingBag className="w-5 h-5" /></div>
            <div className="p-3 text-[#ff4655]/40 hover:text-[#ff4655] transition-colors cursor-pointer"><MessageSquare className="w-5 h-5" /></div>
          </div>
          
          <div className="p-3 border border-[#ff4655]/30 rounded-xl text-[#ff4655] hover:bg-[#ff4655] hover:text-white transition-all cursor-pointer border-dashed">
            <Plus className="w-5 h-5" />
          </div>
        </div>

        {/* MAIN DASHBOARD AREA */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-[#4d1723] to-[#3a111a]">
          {/* Subtle grid/texture */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay" />
          
          {/* HEADER */}
          <div className="px-10 pt-8 pb-4 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[#fca5a5] text-xl font-light">Good evening,</span>
              <span className="text-white text-xl font-bold tracking-wide">{username}</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <Search className="w-4 h-4 text-[#fca5a5] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-[#2b0c13]/50 border border-[#fca5a5]/20 text-white placeholder:text-[#fca5a5]/50 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-[#ff4655] transition-colors"
                />
              </div>
              <ShoppingCart className="w-5 h-5 text-[#fca5a5] hover:text-white cursor-pointer transition-colors" />
              <div className="relative">
                <Bell className="w-5 h-5 text-[#fca5a5] hover:text-white cursor-pointer transition-colors" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff4655] rounded-full border-2 border-[#4d1723]" />
              </div>
            </div>
          </div>

          {/* SCROLLABLE GRID CONTENT */}
          <div className="flex-1 overflow-y-auto px-10 pb-10 scrollbar-hide">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* LEFT & CENTER SECTIONS (Spans 2 columns) */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                
                {/* BIG HERO BANNER - ACTIVE MISSION */}
                <div className="bg-gradient-to-r from-[#ff4655] to-[#cc2936] rounded-3xl p-8 relative overflow-hidden shadow-2xl min-h-[280px] flex flex-col justify-end group cursor-pointer border border-white/10">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2b0c13]/90 via-[#2b0c13]/40 to-transparent" />
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
                      <Zap className="w-3 h-3 text-yellow-300" /> Active Operation
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-2 shadow-black/50">
                      DEFEAT TUTORIAL HELL
                    </h1>
                    <p className="text-white/80 max-w-md text-sm font-medium">
                      Master React Native animations and deploy your first app to escape the infinite loop of tutorials.
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                      <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full border-2 border-[#ff4655] bg-zinc-800" />
                        <div className="w-8 h-8 rounded-full border-2 border-[#ff4655] bg-zinc-700" />
                        <div className="w-8 h-8 rounded-full border-2 border-[#ff4655] bg-zinc-600" />
                      </div>
                      <span className="text-white text-xs font-bold">+53 Reviews</span>
                    </div>
                  </div>
                </div>

                {/* COMMAND CENTER & GENERATOR */}
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <h2 className="text-2xl font-bold text-white tracking-wide">Command Center</h2>
                    <span className="text-[#fca5a5] text-sm hover:text-white cursor-pointer transition-colors flex items-center gap-1">
                      See More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                  
                  {!generatedQuest ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#2b0c13]/40 backdrop-blur-xl border border-[#fca5a5]/10 rounded-3xl p-6 shadow-xl relative"
                    >
                      {isProcessing && (
                        <div className="absolute inset-0 z-50 bg-[#2b0c13]/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center space-y-4">
                          <Cpu className="w-12 h-12 text-[#ff4655] animate-pulse" />
                          <p className="text-white font-bold tracking-widest uppercase animate-pulse">Initializing AI Core...</p>
                        </div>
                      )}

                      <div className="flex gap-2 bg-[#1d0a0f] p-1 rounded-2xl mb-4 w-fit">
                        <button
                          type="button"
                          onClick={() => setInputType('text')}
                          className={`px-6 py-2 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${inputType === 'text' ? 'bg-[#ff4655] text-white shadow-lg' : 'text-[#fca5a5] hover:text-white'}`}
                        >
                          <Type className="w-3 h-3" /> Raw Intel
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputType('url')}
                          className={`px-6 py-2 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${inputType === 'url' ? 'bg-[#ff4655] text-white shadow-lg' : 'text-[#fca5a5] hover:text-white'}`}
                        >
                          <LinkIcon className="w-3 h-3" /> Data Link
                        </button>
                      </div>

                      <form onSubmit={handleGenerate} className="space-y-4">
                        {inputType === 'text' ? (
                          <Textarea
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                            placeholder="Describe your objective. Example: 'Learn framer motion gestures this weekend.'"
                            className="min-h-[120px] bg-[#1d0a0f]/50 border-transparent focus-visible:ring-[#ff4655] text-white placeholder:text-[#fca5a5]/40 text-sm rounded-2xl resize-none"
                          />
                        ) : (
                          <Input
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                            placeholder="Paste a URL (Documentation, Article, GitHub)..."
                            className="h-14 bg-[#1d0a0f]/50 border-transparent focus-visible:ring-[#ff4655] text-white placeholder:text-[#fca5a5]/40 text-sm rounded-2xl"
                          />
                        )}

                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={!payload.trim() || isProcessing}
                            className="h-12 px-8 rounded-xl bg-white text-[#2b0c13] hover:bg-[#fca5a5] font-bold uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                          >
                            <Sparkles className="w-4 h-4 mr-2" /> Generate Mission
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#2b0c13]/60 backdrop-blur-xl border border-[#ff4655]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ff4655]/20 blur-3xl rounded-full pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex gap-2 mb-2">
                            <span className="px-2 py-1 bg-[#ff4655]/20 text-[#ff4655] text-[10px] font-black uppercase tracking-widest rounded">LVL {generatedQuest.quest.difficulty}</span>
                            <span className="px-2 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded">{generatedQuest.quest.category}</span>
                          </div>
                          <h3 className="text-2xl font-black text-white tracking-tight">{generatedQuest.quest.title}</h3>
                          <p className="text-[#fca5a5] text-sm mt-1 max-w-xl">{generatedQuest.quest.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-white">{generatedQuest.quest.estimated_time_minutes}</div>
                          <div className="text-[10px] text-[#fca5a5] uppercase tracking-widest font-bold">Minutes</div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                        {generatedQuest.steps.map((step) => (
                          <div key={step.order_index} className="bg-[#1d0a0f]/80 p-4 rounded-2xl flex gap-4 border border-white/5 hover:border-[#ff4655]/50 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-[#ff4655] text-white flex items-center justify-center font-black shrink-0">
                              {step.order_index}
                            </div>
                            <div>
                              <h4 className="text-white font-bold">{step.title}</h4>
                              <p className="text-[#fca5a5] text-xs mt-1 leading-relaxed">{step.instruction}</p>
                              <div className="mt-2 text-[10px] font-mono text-[#ff4655] flex items-center gap-1 bg-[#ff4655]/10 px-2 py-1 rounded inline-flex">
                                <ShieldAlert className="w-3 h-3" /> AI Verify: {step.ai_validation_prompt}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={() => setGeneratedQuest(null)}
                          variant="ghost"
                          className="flex-1 h-12 rounded-xl text-[#fca5a5] hover:text-white hover:bg-white/10 font-bold tracking-widest uppercase"
                        >
                          Abort
                        </Button>
                        <Button
                          onClick={handleAcceptMission}
                          disabled={isAccepting}
                          className="flex-[2] h-12 rounded-xl bg-[#ff4655] text-white hover:bg-[#cc2936] font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(255,70,85,0.4)]"
                        >
                          {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accept Mission'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN (Stats & Sidebar combined) */}
              <div className="flex flex-col gap-6">
                
                {/* YOUR STATISTIC CARD */}
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <h2 className="text-2xl font-bold text-white tracking-wide">Your Statistic</h2>
                    <span className="text-[#fca5a5] text-sm hover:text-white cursor-pointer transition-colors flex items-center gap-1">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="bg-gradient-to-b from-[#2b0c13] to-[#1d0a0f] rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/5 h-[340px] flex flex-col items-center justify-center group cursor-pointer">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4655]/10 blur-2xl rounded-full" />
                    
                    {/* Abstract Abstract Shape representing Stats */}
                    <div className="relative w-48 h-48 mb-4">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#ff4655] to-purple-500 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-[spin_8s_linear_infinite] opacity-50 mix-blend-screen" />
                      <div className="absolute inset-2 bg-gradient-to-bl from-orange-500 to-[#ff4655] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] animate-[spin_12s_linear_infinite_reverse] opacity-50 mix-blend-screen" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 drop-shadow-xl">
                        <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Total EXP</span>
                        <span className="text-4xl font-black text-white">{rpgProfile?.total_exp || 0}</span>
                      </div>
                    </div>

                    <div className="flex w-full justify-between px-4 mt-auto">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-[#ff4655]/20 flex items-center justify-center mx-auto mb-2">
                          <Activity className="w-5 h-5 text-[#ff4655]" />
                        </div>
                        <div className="text-white font-bold">{rpgProfile?.level || 1}</div>
                        <div className="text-[10px] text-[#fca5a5] uppercase">Level</div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                          <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-white font-bold">{rpgProfile?.multiplier || 1.0}x</div>
                        <div className="text-[10px] text-[#fca5a5] uppercase">Multiplier</div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
                          <Zap className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="text-white font-bold">{rpgProfile?.current_streak || 0}</div>
                        <div className="text-[10px] text-[#fca5a5] uppercase">Day Streak</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MINI GUILD / FRIENDS SIDEBAR (Internal column) */}
                <div className="flex-1 bg-[#2b0c13]/50 rounded-3xl p-4 border border-white/5 flex flex-col">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-white font-bold tracking-wide">Guild Activity</h3>
                    <span className="w-5 h-5 rounded-full bg-[#ff4655] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  </div>
                  
                  <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide px-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl bg-zinc-800 border-2 ${i === 1 ? 'border-green-500' : 'border-transparent'} group-hover:border-[#ff4655] transition-colors`} />
                          {i === 1 && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2b0c13]" />}
                        </div>
                        <div>
                          <div className="text-white text-sm font-bold group-hover:text-[#ff4655] transition-colors">Agent_{i}9X</div>
                          <div className="text-[#fca5a5] text-xs">Completed Mission</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        
        {/* RIGHTMOST THIN SIDEBAR (Friends Icons) */}
        <div className="w-20 bg-[#2b0c13] border-l border-[#1d0a0f] flex flex-col items-center py-8 justify-start gap-4 z-20 overflow-y-auto scrollbar-hide">
          <div className="w-10 h-10 rounded-full bg-[#ff4655] flex items-center justify-center text-white font-black shrink-0 shadow-lg">
            {username.charAt(0)}
          </div>
          <div className="w-full h-px bg-white/10 my-2" />
          
          {[
            { c: 'border-green-500', st: 'In Game' },
            { c: 'border-transparent', st: '' },
            { c: 'border-transparent', st: '' },
            { c: 'border-yellow-500', st: '' },
            { c: 'border-transparent', st: '' },
          ].map((u, idx) => (
            <div key={idx} className="relative group cursor-pointer mb-2">
              <div className={`w-10 h-10 rounded-xl bg-[#4d1723] border-2 ${u.c} hover:border-[#ff4655] transition-colors`} />
              {u.st && (
                <div className="absolute -bottom-2 inset-x-0 mx-auto w-fit px-1 py-0.5 bg-green-500 rounded text-[8px] font-bold text-white uppercase scale-0 group-hover:scale-100 transition-transform origin-bottom">
                  {u.st}
                </div>
              )}
            </div>
          ))}
          
          <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition-colors cursor-pointer mt-auto">
            <Plus className="w-4 h-4" />
          </div>
        </div>

      </div>
    </div>
  );
}
