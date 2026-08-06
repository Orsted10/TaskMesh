"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Skull, Gavel, Coins, Code, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', title: '1. ACCEPTANCE OF TERMS', icon: FileText },
    { id: 'permadeath', title: '2. PERMADEATH LIABILITY', icon: Skull },
    { id: 'tribunal', title: '3. AI & THE TRIBUNAL', icon: Gavel },
    { id: 'economy', title: '4. THE SHINE ECONOMY', icon: Coins },
    { id: 'content', title: '5. USER-GENERATED CONTENT', icon: Code },
    { id: 'age', title: '6. AGE & LEGAL CAPACITY', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 selection:text-primary font-mono relative overflow-hidden">
      {/* Matrix background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      {/* Glitch Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-50"></div>

      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-none border border-transparent hover:border-white/20 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black font-teko tracking-widest text-primary uppercase drop-shadow-[0_0_10px_rgba(255,70,85,0.5)]">TERMS_OF_SERVICE</h1>
              <p className="text-xs text-white/40 tracking-[0.2em] font-mono">DOCUMENT CLASSIFICATION: BINDING_CONTRACT</p>
            </div>
          </div>
          <div className="text-xs font-bold tracking-widest text-green-500 flex items-center gap-2 border border-green-500/30 px-3 py-1 bg-green-500/10 clip-angled">
            <div className="w-2 h-2 bg-green-500 rounded-sm animate-pulse" />
            LAST_UPDATED: 2026.08.06
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 relative z-10">
        
        {/* Navigation Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-2 border border-white/10 bg-zinc-900/50 p-4 clip-angled backdrop-blur-md">
            <div className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mb-4 border-b border-primary/30 pb-2">INDEX_DIRECTIVES</div>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 text-xs font-bold tracking-widest uppercase transition-all duration-300 relative group overflow-hidden ${
                    activeSection === section.id 
                      ? 'text-black bg-primary' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 z-10 relative" />
                  <span className="z-10 relative">{section.title}</span>
                  {activeSection === section.id && (
                    <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 max-w-4xl space-y-12 pb-32">
          
          <div className="bg-zinc-950 border border-white/10 p-8 clip-angled relative shadow-2xl">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
            
            {activeSection === 'acceptance' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-white font-black border-b border-white/10 pb-4">1. Acceptance of the Protocol</h2>
                <div className="text-sm text-white/70 space-y-4 leading-relaxed font-mono">
                  <p>By registering, linking a wallet, or authenticating via Google/GitHub to access TaskMesh (hereinafter referred to as the "Matrix", "Protocol", or "Platform"), you enter into a legally binding contract with ACTIO Systems.</p>
                  <p>TaskMesh is a Cybernetic RPG overlay designed to gamify physical and digital execution. This is not a passive application. You are expected to execute tasks, upload proof, and engage with the decentralized Tribunal. If you do not agree to these Terms of Service, you must disconnect immediately.</p>
                  <p>We reserve the right to modify these rules of engagement at any time. Significant protocol shifts will be broadcast to your HUD or registered email address.</p>
                </div>
              </div>
            )}

            {activeSection === 'permadeath' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-primary font-black border-b border-primary/30 pb-4">2. Permadeath & Liability Waiver</h2>
                <div className="text-sm text-white/70 space-y-6 leading-relaxed font-mono">
                  <p>TaskMesh incorporates high-stakes accountability mechanics, including the "Permadeath" protocol.</p>
                  
                  <div className="border border-primary/30 bg-primary/10 p-4 clip-angled">
                    <h3 className="text-primary font-bold tracking-widest uppercase mb-2">Assumption of Risk</h3>
                    <p>By toggling "Permadeath Mode" on any quest or attribute stack, you explicitly acknowledge that failing a validation check or missing a streak deadline will result in the <strong>PERMANENT DELETION</strong> of all accrued EXP, levels, and digital prestige associated with that specific stack.</p>
                  </div>

                  <p>You agree that ACTIO Systems shall bear NO LIABILITY for emotional distress, perceived loss of social status, or disruption of your Verifiable Resume resulting from automated Permadeath wipes. Bugs, internet outages, or camera failures on your end do not exempt you from Permadeath execution.</p>
                </div>
              </div>
            )}

            {activeSection === 'tribunal' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-white font-black border-b border-white/10 pb-4">3. The Tribunal & Vision AI Verification</h2>
                <div className="text-sm text-white/70 space-y-4 leading-relaxed font-mono">
                  <p>TaskMesh operates on a Zero-Trust Completion model. Users must upload media to prove execution.</p>
                  
                  <h3 className="text-white font-bold tracking-widest uppercase mt-6 mb-2 text-xs">Automated & Peer Validation</h3>
                  <p>1. Our Vision AI acts as the primary arbiter of truth. By uploading proof, you grant the AI full rights to analyze and grade your media against the `ai_validation_prompt`.</p>
                  <p>2. If the AI confidence falls below the required threshold, your submission may be routed to the <strong>Human Tribunal</strong>. The Tribunal consists of anonymous, high-ranking TaskMesh operatives. You agree to submit your proof to peer review, and you agree that the Tribunal's consensus verdict is final and unappealable.</p>
                  <p>3. Submitting forged, digitally altered (deepfakes/AI-generated images), or fraudulent proof is a violation of the Protocol and will result in an immediate account termination and permanent banishment from the Matrix.</p>
                </div>
              </div>
            )}

            {activeSection === 'economy' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-white font-black border-b border-white/10 pb-4">4. Bounties & The "Shine" Economy</h2>
                <div className="text-sm text-white/70 space-y-4 leading-relaxed font-mono">
                  <p>TaskMesh allows corporations, guilds, and individuals to post Global Bounties backed by fiat currency or cryptocurrency ("Shine").</p>
                  
                  <ul className="list-disc pl-5 space-y-3">
                    <li><strong>Independent Contractor Status:</strong> Completing a bounty does not make you an employee of ACTIO Systems or the bounty creator. You are an independent operative.</li>
                    <li><strong>Tax Liability:</strong> You are solely responsible for declaring and paying any local, regional, or national taxes on crypto or fiat rewards earned through the Platform (e.g., adhering to the 30% crypto tax rule in India, or IRS guidelines in the US).</li>
                    <li><strong>Payout Conditions:</strong> Bounties are held in escrow/smart contracts and are only released upon final AI or Tribunal verification. ACTIO Systems is not liable for fluctuations in cryptocurrency values between the time a bounty is posted and paid out.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'content' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-white font-black border-b border-white/10 pb-4">5. User-Generated Content & Synthesis</h2>
                <div className="text-sm text-white/70 space-y-4 leading-relaxed font-mono">
                  <p>The "God-Mode Synthesizer" allows users to input external URLs, YouTube videos, and text to generate RPG campaigns.</p>
                  
                  <p><strong>Your Responsibility:</strong> You must ensure you have the legal right to input such content. You may not input copyrighted, confidential, or proprietary material that you do not have permission to process through an LLM. ACTIO Systems does not claim ownership of the original external material, but we hold full copyright over the resulting gamified RPG Campaign generated by our AI.</p>
                  
                  <p>By posting on the Public Ledger, you grant TaskMesh a perpetual, worldwide, royalty-free license to display your RPG stats, completed quests, and non-sensitive proof media to the public to maintain the integrity of the Verifiable Resume system.</p>
                </div>
              </div>
            )}

            {activeSection === 'age' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-white font-black border-b border-white/10 pb-4">6. Age & Legal Capacity</h2>
                <div className="text-sm text-white/70 space-y-4 leading-relaxed font-mono">
                  <p>TaskMesh is designed for operatives capable of executing complex real-world tasks.</p>
                  <p>1. <strong>Base Access:</strong> You must be at least 13 years of age to access the base TaskMesh protocol. This ensures compliance with COPPA (US) and equivalent global youth protection laws.</p>
                  <p>2. <strong>Financial Access (The Shine Economy):</strong> To accept, complete, or fund financial Bounties (fiat or crypto), you must be at least 18 years of age or the age of majority in your jurisdiction. By linking a payment gateway or crypto wallet, you certify that you meet this requirement.</p>
                  
                  <div className="pt-6 border-t border-white/10 text-center">
                    <p className="text-xs text-white/40 tracking-widest uppercase">
                      Failure to comply with these terms will result in account vaporization. <br/>
                      Legal comms: legal@taskmesh.io
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
