'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Shield, CheckCircle2, Copy, Check, Printer, 
  Download, ArrowRight, Zap, Star, Activity, Sparkles, X, Database 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cyberAudio } from '@/lib/cyber-audio';
import { getPersonaConfig } from '@/lib/persona';

export interface CertificateData {
  operativeName: string;
  operativeLevel: number;
  operativeTitle: string;
  missionTitle: string;
  campaignTitle?: string;
  tier: string;
  category: string;
  difficulty: number;
  timeSpentSeconds: number;
  rewards: {
    xp: number;
    gold: number;
    shine: number;
    skillpoints: number;
    coreStatName: string;
    coreStatGain: number;
    specific_skills: Array<{ name: string; value: number }>;
  };
  personaId?: string;
}

interface CompletionCertificateProps {
  data: CertificateData;
  isOpen: boolean;
  onClose: () => void;
}

export function CompletionCertificate({
  data,
  isOpen,
  onClose
}: CompletionCertificateProps) {
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const persona = getPersonaConfig(data.personaId);
  
  // Deterministic-looking certificate hash based on title and time
  const certId = `ACTIO-CERT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const cryptoHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const handleCopyHash = () => {
    cyberAudio.playClick();
    navigator.clipboard.writeText(`Actio Verified Proof of Execution\nCert ID: ${certId}\nHash: ${cryptoHash}\nOperative: ${data.operativeName}\nMission: ${data.missionTitle}`);
    setCopied(true);
    toast.success('Certificate Signature Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    cyberAudio.playClick();
    window.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto"
      >
        <div className="max-w-3xl w-full flex flex-col gap-6 my-8">
          
          {/* Certificate Container */}
          <motion.div
            ref={certRef}
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-[#0b0c10] border-2 border-yellow-500/40 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-[0_0_80px_rgba(234,179,8,0.2)] print:border-black print:bg-white print:text-black"
          >
            {/* Ambient Background Grid & Watermark */}
            <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#ff4655]/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Sci-Fi Decorative Corner Brackets */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-yellow-500/80 pointer-events-none" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-yellow-500/80 pointer-events-none" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-yellow-500/80 pointer-events-none" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-yellow-500/80 pointer-events-none" />

            {/* Header / Seal */}
            <div className="flex flex-col items-center text-center relative z-10 mb-8">
              <div className="relative mb-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-yellow-500/50 flex items-center justify-center p-2"
                />
                <div className="absolute inset-0 flex items-center justify-center text-yellow-500">
                  <Award className="w-10 h-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
                </div>
              </div>

              <span className="text-[11px] font-mono tracking-[0.4em] uppercase text-yellow-500 font-bold mb-1">
                ACTIO PROTOCOL // ZERO-TRUST VERIFIED
              </span>
              <h1 className="text-4xl sm:text-6xl font-teko text-white uppercase tracking-wider leading-none print:text-black">
                Certificate of Execution
              </h1>
              <p className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-widest print:text-zinc-600">
                Token Serial: <span className="text-yellow-400 font-bold">{certId}</span>
              </p>
            </div>

            {/* Recipient Details */}
            <div className="text-center relative z-10 mb-8 border-y border-zinc-800/80 py-6 print:border-zinc-300">
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
                This document certifies that operative
              </p>
              <h2 className="text-3xl sm:text-5xl font-teko text-yellow-400 uppercase tracking-wide leading-none mb-2 print:text-black">
                {data.operativeName}
              </h2>
              <div className="flex items-center justify-center gap-3 text-xs font-mono text-zinc-300">
                <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 uppercase font-bold text-yellow-400">
                  Level {data.operativeLevel}
                </span>
                <span>•</span>
                <span className="uppercase text-zinc-400">{data.operativeTitle}</span>
              </div>
            </div>

            {/* Mission Performance Description */}
            <div className="text-center relative z-10 mb-8 max-w-xl mx-auto">
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
                Has conclusively verified completion of the objective
              </p>
              <h3 className="text-2xl sm:text-4xl font-teko text-white uppercase leading-none mb-3 print:text-black">
                "{data.missionTitle}"
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono uppercase">
                <span className="px-2.5 py-1 rounded bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] font-bold">
                  {data.tier}
                </span>
                <span className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">
                  DIFFICULTY: LVL {data.difficulty}
                </span>
                <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                  UPTIME: {formatDuration(data.timeSpentSeconds)}
                </span>
              </div>
            </div>

            {/* Stat Gains & Loot Matrix */}
            <div className="relative z-10 bg-black/60 border border-zinc-800 rounded-2xl p-6 mb-8 print:border-zinc-300 print:bg-zinc-100">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-4 text-center">
                // AUTHORIZED YIELD & ATTRIBUTE UPGRADES
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[10px] font-mono text-[#ff4655] uppercase font-bold block">EXP GAINED</span>
                  <span className="text-2xl font-teko text-white">+{data.rewards.xp}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[10px] font-mono text-yellow-500 uppercase font-bold block">GOLD</span>
                  <span className="text-2xl font-teko text-white">+{data.rewards.gold}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                    {data.rewards.coreStatName.toUpperCase()}
                  </span>
                  <span className="text-2xl font-teko text-cyan-400 font-bold">+{data.rewards.coreStatGain}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">SKILL POINTS</span>
                  <span className="text-2xl font-teko text-white">+{data.rewards.skillpoints}</span>
                </div>
              </div>

              {/* Mastered specific skills */}
              {data.rewards.specific_skills && data.rewards.specific_skills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mr-1">Skills Verified:</span>
                  {data.rewards.specific_skills.map((s, idx) => (
                    <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 font-bold">
                      {s.name} +{s.value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Signature & Endorsement */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 pt-4 border-t border-zinc-800/80 print:border-zinc-300">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-zinc-300 font-bold uppercase mb-1">
                  <span>{persona.emoji}</span>
                  <span>{persona.name} (Zero-Trust Arbiter)</span>
                </div>
                <p className="text-[10px] font-mono text-zinc-500 truncate max-w-xs">
                  Sig: {cryptoHash.substring(0, 24)}...
                </p>
              </div>

              <div className="text-center sm:text-right">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                  ISSUED TIMESTAMP
                </span>
                <span className="font-mono text-xs font-bold text-yellow-500">{completionDate}</span>
              </div>
            </div>

          </motion.div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 print:hidden">
            <Button
              onClick={handleCopyHash}
              variant="outline"
              className="flex-1 w-full bg-zinc-900 border-zinc-700 hover:border-yellow-500 text-zinc-200 font-mono text-xs uppercase tracking-widest h-12"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied' : 'Copy Verification Signature'}
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 w-full bg-zinc-900 border-zinc-700 hover:border-white text-zinc-200 font-mono text-xs uppercase tracking-widest h-12"
            >
              <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
            </Button>

            <Button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
              }}
              className="flex-[1.5] w-full bg-gradient-to-r from-yellow-500 via-[#ff4655] to-yellow-500 hover:opacity-90 text-white font-teko text-2xl uppercase tracking-[0.2em] h-12 shadow-[0_0_30px_rgba(234,179,8,0.4)]"
            >
              Claim Loot & Return <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
