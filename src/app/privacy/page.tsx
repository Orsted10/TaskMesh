"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Database, Lock, Fingerprint, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: '1. SYSTEM OVERVIEW', icon: Shield },
    { id: 'collection', title: '2. DATA COLLECTION', icon: Database },
    { id: 'biometrics', title: '3. BIOMETRICS & AI VISION', icon: Eye },
    { id: 'permadeath', title: '4. THE PERMADEATH PROTOCOL', icon: Lock },
    { id: 'security', title: '5. ZERO-TRUST SECURITY', icon: Fingerprint },
    { id: 'global', title: '6. GLOBAL COMPLIANCE', icon: Globe },
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
              <h1 className="text-2xl font-black font-teko tracking-widest text-primary uppercase drop-shadow-[0_0_10px_rgba(255,70,85,0.5)]">PRIVACY_POLICY</h1>
              <p className="text-xs text-white/40 tracking-[0.2em] font-mono">DOCUMENT CLASSIFICATION: PUBLIC_LEDGER</p>
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
            
            {activeSection === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-white font-black border-b border-white/10 pb-4">1. System Overview</h2>
                <div className="text-sm text-white/70 space-y-4 leading-relaxed font-mono">
                  <p>Welcome to TaskMesh (ACTIO). We operate on a philosophy of absolute transparency and extreme accountability. This document constitutes the legally binding Privacy Policy governing your access to the TaskMesh Cybernetic RPG overlay, including the Web Application, iOS/Android mobile clients, and our Vision AI backend.</p>
                  <p>By engaging with the TaskMesh protocol, you are opting into a high-stakes ecosystem. We are not a passive social network; we are an active ledger of your physical execution. As such, we require access to deep-level telemetry, including cryptographic proof of work, localized hardware data, and potentially biometric visual data (via the Tribunal validation system).</p>
                  <p className="p-4 bg-primary/10 border-l-4 border-primary text-primary font-bold">
                    [CRITICAL NOTICE]: If you do not agree to the extreme data requirements necessary for AI-driven verification, you must terminate your uplink immediately. TaskMesh functions entirely on undeniable proof.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'collection' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-white font-black border-b border-white/10 pb-4">2. Telemetry & Data Collection</h2>
                <div className="text-sm text-white/70 space-y-6 leading-relaxed font-mono">
                  <p>To synthesize quests and verify physical operations, the following data vectors are collected:</p>
                  <ul className="space-y-4 list-none">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 bg-green-500 rotate-45 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                      <div>
                        <strong className="text-white block mb-1">Unstructured Input Data (The Synthesizer)</strong>
                        We log URLs, YouTube transcripts, and raw text prompts submitted to the God-Mode AI Synthesizer (Groq Llama-3-70B). This data is processed temporarily in RAM for quest generation and discarded unless explicitly saved to your ledger.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 bg-green-500 rotate-45 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                      <div>
                        <strong className="text-white block mb-1">Biomimetic Hardware Data</strong>
                        If you sync external hardware (e.g., Apple Watch, Oura Ring, Garmin), we collect specific telemetry regarding Heart Rate (BPM), Sleep Cycles (REM/Deep), and GPS coordinates to verify physical fitness quests. You may revoke this access at the OS level at any time.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 bg-green-500 rotate-45 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                      <div>
                        <strong className="text-white block mb-1">The Public Ledger (Verifiable Resumes)</strong>
                        Information regarding your completed quests, accrued EXP, and RPG Stats (STR, INT, CHR, WIL, CRA, CRE) is designated as PUBLIC by default to serve as your "Proof of Work" verifiable resume.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'biometrics' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-white font-black border-b border-white/10 pb-4">3. Biometrics & Vision AI Verification</h2>
                <div className="text-sm text-white/70 space-y-4 leading-relaxed font-mono">
                  <p>TaskMesh utilizes a Zero-Trust Completion protocol. You cannot merely click "Done"; you must provide visual proof.</p>
                  
                  <h3 className="text-white font-bold tracking-widest uppercase mt-6 mb-2 text-xs">Image Processing & AI Training</h3>
                  <p>When you upload an image or video to verify a quest (e.g., a photo of a repaired engine, a cleaned room, or a completed workout), this media is processed by our Vision AI engine to match the `ai_validation_prompt` generated for that quest.</p>
                  
                  <div className="border border-white/10 bg-black/50 p-4 font-mono text-xs text-white/60">
                    <p className="text-primary font-bold mb-2">&gt; VISUAL DATA RETENTION DIRECTIVE</p>
                    <p>1. Media uploaded for verification is NOT used to train base AI models (e.g., OpenAI, Meta) without explicit opt-in.</p>
                    <p>2. If the AI is uncertain (confidence &lt; 90%), the image may be routed to the Human Tribunal (high-level Guild members) for peer-to-peer judging. By uploading, you consent to this localized, anonymous peer review.</p>
                    <p>3. Do NOT upload images containing Personally Identifiable Information (PII) or sensitive backgrounds. TaskMesh uses edge-blurring algorithms to sanitize faces before Tribunal submission, but user discretion is mandated.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'permadeath' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-primary font-black border-b border-primary/30 pb-4">4. The Permadeath Protocol</h2>
                <div className="text-sm text-white/70 space-y-4 leading-relaxed font-mono">
                  <p>TaskMesh features an extreme accountability mode known as "Permadeath." By enabling this feature, you accept full responsibility for your data retention.</p>
                  
                  <p className="text-white"><strong>Automatic Data Deletion (Wipe Mechanism):</strong></p>
                  <p>If you fail a daily verification or break a streak while under the Permadeath protocol, your progress stack for that specific attribute (EXP, leveled skills, and associated metadata) will be PERMANENTLY and IRREVERSIBLY wiped from our PostgreSQL databases.</p>
                  
                  <p>We retain no backups of wiped Permadeath data. This is a core mechanic designed to leverage loss-aversion. Under GDPR and DPDP, this action functions as an automated "Right to Erasure" triggered by your own failure to execute. We accept zero liability for the psychological or emotional impact of losing a 365-day streak.</p>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-white font-black border-b border-white/10 pb-4">5. Zero-Trust Security Architecture</h2>
                <div className="text-sm text-white/70 space-y-4 leading-relaxed font-mono">
                  <p>Your data is secured using military-grade cryptographic standards.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Authentication:</strong> All sessions are verified via Supabase Auth using secure JWT (JSON Web Tokens) with short expiry windows.</li>
                    <li><strong>Database Rules:</strong> Row Level Security (RLS) policies enforce absolute isolation on private operational data. No user can read another user's private quest logs, except those explicitly marked for the Public Ledger.</li>
                    <li><strong>Financial Ledgers:</strong> Any bounties paid out in the "Shine Economy" are logged via immutable blockchain contracts or PCI-DSS compliant fiat gateways (e.g., Stripe), depending on the bounty type. TaskMesh does not store your private keys or full credit card numbers.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'global' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-teko tracking-wider uppercase text-white font-black border-b border-white/10 pb-4">6. Global & Indian Legal Compliance</h2>
                <div className="text-sm text-white/70 space-y-6 leading-relaxed font-mono">
                  
                  <div>
                    <h3 className="text-white font-bold mb-2">India: Digital Personal Data Protection Act (DPDP) 2023</h3>
                    <p>As a protocol operating extensively in India, TaskMesh adheres strictly to the DPDP Act. We only process digital personal data upon receiving clear, affirmative consent. You have the right to request a summary of your personal data, seek corrections, and invoke the right to be forgotten (Right to Erasure). We have implemented localized data fiduciary standards to ensure maximum compliance.</p>
                  </div>

                  <div>
                    <h3 className="text-white font-bold mb-2">Europe: General Data Protection Regulation (GDPR)</h3>
                    <p>For operatives within the European Economic Area (EEA), you retain all rights under the GDPR, including data portability and objection to automated decision-making. Note that the Vision AI evaluation *is* an automated decision; if you object to this, you cannot use the verification features of the app.</p>
                  </div>

                  <div>
                    <h3 className="text-white font-bold mb-2">USA: California Consumer Privacy Act (CCPA)</h3>
                    <p>We do not sell your personal data. Period. We do not aggregate your execution ledgers to sell to third-party ad networks. Your data belongs to you, and your public resume is controlled entirely by your privacy settings.</p>
                  </div>

                  <div className="pt-6 border-t border-white/10 text-center">
                    <p className="text-xs text-white/40 tracking-widest uppercase">
                      For legal inquiries, dispatch encrypted comms to: legal@taskmesh.live
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
