'use client';

import { motion } from 'framer-motion';
import { Terminal, Key, Webhook, Copy, Plus, Activity, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DeveloperPage() {
  const [keys, setKeys] = useState([
    { id: 'key-1', name: 'MacBook Pro CLI', created: '2026.04.12', lastUsed: '2 mins ago', active: true }
  ]);
  const [webhooks, setWebhooks] = useState([
    { id: 'wh-1', name: 'GitHub Integration', url: 'https://actio.network/api/wh/v1/github', events: ['push', 'pull_request'], status: 'healthy' }
  ]);

  const handleGenerateKey = () => {
    toast.success('Generated new API Key. (Simulated)');
    setKeys([{ id: `key-${Date.now()}`, name: 'New Integration', created: 'Just now', lastUsed: 'Never', active: true }, ...keys]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      <div className="flex flex-col gap-2 mb-8 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <Terminal className="w-8 h-8 text-fuchsia-500" />
          <h1 className="text-5xl font-teko text-white uppercase tracking-wider">Omni-API & Webhooks</h1>
        </div>
        <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest max-w-2xl">
          Connect Actio to the physical and digital world. Trigger quests via external scripts, IOT devices, or third-party webhooks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* API Keys */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="font-teko text-3xl text-white uppercase tracking-widest flex items-center gap-2">
              <Key className="w-5 h-5 text-fuchsia-500" /> Personal Access Tokens
            </h2>
            <button onClick={handleGenerateKey} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-black px-4 py-1.5 rounded font-teko text-lg uppercase tracking-widest transition-colors flex items-center gap-1">
              <Plus className="w-4 h-4" /> Generate Token
            </button>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="space-y-4">
              {keys.map((k) => (
                <div key={k.id} className="border border-zinc-800 bg-black rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-teko text-2xl text-white uppercase leading-none">{k.name}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">Created: {k.created}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${k.active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{k.active ? 'Active' : 'Revoked'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded p-2">
                    <code className="text-xs text-fuchsia-400 font-mono flex-1 opacity-50 blur-[2px] select-none">
                      actio_sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                    </code>
                    <button onClick={() => copyToClipboard('actio_sk_live_simulated_key')} className="text-zinc-500 hover:text-white p-1">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[9px] text-zinc-600 font-mono uppercase">
                    Last Used: {k.lastUsed}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Webhooks */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="font-teko text-3xl text-white uppercase tracking-widest flex items-center gap-2">
              <Webhook className="w-5 h-5 text-blue-500" /> Inbound Webhooks
            </h2>
            <button className="border border-zinc-700 hover:border-blue-500 text-zinc-400 hover:text-white px-4 py-1.5 rounded font-teko text-lg uppercase tracking-widest transition-colors flex items-center gap-1">
              <Plus className="w-4 h-4" /> Register Endpoint
            </button>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="space-y-4">
              {webhooks.map((wh) => (
                <div key={wh.id} className="border border-zinc-800 bg-black rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-teko text-2xl text-white uppercase leading-none">{wh.name}</h3>
                      <div className="flex gap-2 mt-2">
                        {wh.events.map(e => (
                          <span key={e} className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                      <Activity className="w-3 h-3" /> Healthy
                    </div>
                  </div>
                  
                  <div className="text-xs font-mono text-zinc-400 truncate bg-zinc-900 p-2 rounded border border-zinc-800">
                    {wh.url}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-dashed border-zinc-800 pt-6">
              <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" /> CLI Integration
              </h3>
              <div className="bg-black border border-zinc-800 rounded-xl p-4">
                <code className="text-[11px] font-mono text-zinc-300 block">
                  <span className="text-fuchsia-500">npm</span> install -g actio-cli<br/><br/>
                  <span className="text-zinc-500"># Start tracking a local workspace</span><br/>
                  actio link ./my-project<br/><br/>
                  <span className="text-zinc-500"># Commits will now automatically verify coding quests</span>
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
