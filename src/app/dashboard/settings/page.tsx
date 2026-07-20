'use client';

import { motion } from 'framer-motion';
import { Settings, BrainCircuit, ActivitySquare, ShieldCheck, Palette, Bell, Volume2, Ghost, Save, Trash2, Loader2, Maximize, Target, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, rpgProfile, refreshProfile } = useAuth();
  const [activePersona, setActivePersona] = useState('drill_sergeant');
  const [displayName, setDisplayName] = useState('');
  const [themeColor, setThemeColor] = useState('red');
  const [soundFx, setSoundFx] = useState(true);
  const [ghostProtocol, setGhostProtocol] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);
  const [uiDensity, setUiDensity] = useState('high');
  const [saving, setSaving] = useState(false);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    bounty_alerts: true,
    guild_pings: true
  });

  useEffect(() => {
    if (rpgProfile) {
      setDisplayName(rpgProfile.full_name || rpgProfile.username || '');
      const prefs = rpgProfile.preferences || {};
      setActivePersona(prefs.ai_persona || 'drill_sergeant');
      setThemeColor(prefs.theme_color || 'red');
      setSoundFx(prefs.sound_fx !== false);
      setGhostProtocol(prefs.ghost_protocol === true);
      setAutoAccept(prefs.auto_accept === true);
      setUiDensity(prefs.ui_density || 'high');
      if (prefs.notifications) {
        setNotifications({
          email: prefs.notifications.email ?? true,
          push: prefs.notifications.push ?? true,
          sms: prefs.notifications.sms ?? false,
          bounty_alerts: prefs.notifications.bounty_alerts ?? true,
          guild_pings: prefs.notifications.guild_pings ?? true,
        });
      }
    }
  }, [rpgProfile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updatedPrefs = {
        ...(rpgProfile?.preferences || {}),
        ai_persona: activePersona,
        theme_color: themeColor,
        sound_fx: soundFx,
        ghost_protocol: ghostProtocol,
        auto_accept: autoAccept,
        ui_density: uiDensity,
        notifications
      };

      const { error } = await supabase
        .from('users')
        .update({
          full_name: displayName,
          preferences: updatedPrefs
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Update local storage so effects can be applied globally
      localStorage.setItem('actio_theme_color', themeColor);
      localStorage.setItem('actio_sound_fx', String(soundFx));
      localStorage.setItem('actio_ui_density', uiDensity);
      
      await refreshProfile();
      toast.success('Configuration Saved', { description: 'System parameters have been globally updated.' });
      
      // Play a sound if enabled
      if (soundFx) {
        const audio = new Audio('/success.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio disabled by browser'));
      }
    } catch (err: any) {
      toast.error('Save Failed', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEraseIdentity = () => {
    toast.error('Operation Blocked', { description: 'Identity erasure is restricted during active missions. Complete all protocols first.' });
  };

  const themeColors = [
    { id: 'red', name: 'Blood Ruby', hex: '#ff4655' },
    { id: 'blue', name: 'Cyber Blue', hex: '#3b82f6' },
    { id: 'emerald', name: 'Neon Toxic', hex: '#10b981' },
    { id: 'purple', name: 'Void Purple', hex: '#a855f7' },
    { id: 'yellow', name: 'Solar Flare', hex: '#eab308' },
    { id: 'white', name: 'Monochrome', hex: '#ffffff' },
  ];

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4 sticky top-20 bg-zinc-950/80 backdrop-blur z-20 pt-4 -mt-4">
        <div className="flex items-center gap-4">
          <Settings className="w-8 h-8 text-zinc-400 animate-spin-slow" />
          <h1 className="text-5xl font-teko text-white uppercase tracking-wider">System Config</h1>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#ff4655] hover:bg-[#ff4655]/80 text-white font-teko text-2xl uppercase tracking-widest px-8 py-2 rounded transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,70,85,0.5)]"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Syncing...' : 'Save & Sync'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* AI Persona */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] group hover:border-zinc-600 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4655]/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#ff4655]" /> AI Mentor Persona
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono uppercase mb-4">Determines the attitude and aggression level of quest generation.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {[
              { id: 'drill_sergeant', name: 'Drill Sergeant', desc: 'Aggressive accountability. Zero excuses.', icon: '🤬', border: 'border-red-500' },
              { id: 'socratic', name: 'Socratic Tutor', desc: 'Guides via annoying questions.', icon: '🦉', border: 'border-blue-500' },
              { id: 'hype_man', name: 'The Hype Man', desc: 'Extreme positivity and slang.', icon: '🔥', border: 'border-orange-500' },
              { id: 'zen_master', name: 'Zen Master', desc: 'Calm, focused, minimalist.', icon: '🧘', border: 'border-emerald-500' },
              { id: 'nihilist', name: 'Nihilist', desc: 'Why bother? Nothing matters.', icon: '💀', border: 'border-purple-500' },
              { id: 'corporate', name: 'Corporate Manager', desc: 'Synergy and action items.', icon: '👔', border: 'border-zinc-400' },
            ].map((persona) => (
              <div 
                key={persona.id}
                onClick={() => setActivePersona(persona.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-2 relative ${activePersona === persona.id ? \`bg-zinc-900 \${persona.border}\` : 'bg-black border-zinc-800 hover:border-zinc-700'}`}
              >
                {activePersona === persona.id && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full animate-pulse \${persona.border.replace('border-', 'bg-')}`} />
                  </div>
                )}
                <div className="text-3xl mb-2">{persona.icon}</div>
                <h3 className="font-teko text-2xl text-white uppercase leading-none">{persona.name}</h3>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-tight">{persona.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* UI Customization */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] group hover:border-zinc-600 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" /> Interface & HUD
          </h2>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest block mb-3">Primary Matrix Accent</label>
              <div className="flex gap-4 flex-wrap">
                {themeColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setThemeColor(color.id)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${themeColor === color.id ? 'scale-110 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-zinc-800 hover:scale-105 hover:border-zinc-600'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest block mb-3">Data Density</label>
              <div className="flex gap-3">
                {['low', 'medium', 'high', 'extreme'].map((density) => (
                  <button 
                    key={density}
                    onClick={() => setUiDensity(density)}
                    className={`flex-1 py-2 rounded text-[10px] font-mono uppercase tracking-widest transition-colors ${uiDensity === density ? 'bg-purple-500 text-black font-bold' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6 space-y-4">
              <div className="flex items-center justify-between bg-black p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-zinc-400" />
                  <div>
                    <h4 className="font-teko text-xl text-white uppercase leading-none">System SFX</h4>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">UI Sounds, Level-ups, and Errors</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSoundFx(!soundFx)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${soundFx ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-zinc-800 border border-zinc-700'}`}
                >
                  <motion.div animate={{ x: soundFx ? 24 : 2 }} className={`absolute top-1 bottom-1 w-4 rounded-full ${soundFx ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tactical Config */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] group hover:border-zinc-600 transition-colors xl:col-span-2"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" /> Tactical Preferences
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="flex items-center justify-between bg-black p-4 rounded-xl border border-zinc-800 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-teko text-xl text-white uppercase leading-none text-emerald-400">Auto-Accept Directives</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Automatically begin synthesized quests</p>
                </div>
              </div>
              <button 
                onClick={() => setAutoAccept(!autoAccept)}
                className={`w-12 h-6 rounded-full relative transition-colors ${autoAccept ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <motion.div animate={{ x: autoAccept ? 24 : 2 }} className={`absolute top-1 bottom-1 w-4 rounded-full ${autoAccept ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] group hover:border-zinc-600 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" /> Comms & Alerts
          </h2>

          <div className="space-y-4 relative z-10">
            {[
              { id: 'email', name: 'Email Briefings', desc: 'Daily digests and offline notifications.' },
              { id: 'push', name: 'HUD Push Alerts', desc: 'Real-time in-app overlays and sounds.' },
              { id: 'sms', name: 'SMS Critical', desc: 'Permadeath warnings and high-value bounties.' },
              { id: 'bounty_alerts', name: 'Bounty Radar', desc: 'Ping when geofenced bounties are near.' },
              { id: 'guild_pings', name: 'Faction Pings', desc: 'Guild-wide announcements from leadership.' },
            ].map((notif) => (
              <div key={notif.id} className="flex items-center justify-between bg-black p-4 rounded-xl border border-zinc-800 hover:border-yellow-500/30 transition-colors">
                <div>
                  <h4 className="font-teko text-xl text-white uppercase leading-none">{notif.name}</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{notif.desc}</p>
                </div>
                <button 
                  onClick={() => setNotifications(prev => ({ ...prev, [notif.id]: !prev[notif.id as keyof typeof prev] }))}
                  className={`w-12 h-6 rounded-full relative transition-colors ${notifications[notif.id as keyof typeof notifications] ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-zinc-800 border border-zinc-700'}`}
                >
                  <motion.div animate={{ x: notifications[notif.id as keyof typeof notifications] ? 24 : 2 }} className={`absolute top-1 bottom-1 w-4 rounded-full ${notifications[notif.id as keyof typeof notifications] ? 'bg-yellow-500' : 'bg-zinc-500'}`} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security & Access */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] group hover:border-zinc-600 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-zinc-400" /> Identity & Security
          </h2>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest block mb-2">Display Name (Public Tag)</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="OPERATIVE_01" 
                className="w-full bg-black border border-zinc-700 rounded p-4 text-white font-mono text-sm focus:border-red-500 outline-none transition-colors shadow-inner" 
              />
            </div>
            
            <div className="flex items-center justify-between bg-black p-4 rounded-xl border border-zinc-800 hover:border-red-900 transition-colors">
              <div className="flex items-center gap-3">
                <Ghost className="w-5 h-5 text-zinc-400" />
                <div>
                  <h4 className="font-teko text-xl text-white uppercase leading-none text-zinc-300">Ghost Protocol</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Hide from leaderboards & search</p>
                </div>
              </div>
              <button 
                onClick={() => setGhostProtocol(!ghostProtocol)}
                className={`w-12 h-6 rounded-full relative transition-colors ${ghostProtocol ? 'bg-zinc-200/20 border border-zinc-500/50' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <motion.div animate={{ x: ghostProtocol ? 24 : 2 }} className={`absolute top-1 bottom-1 w-4 rounded-full ${ghostProtocol ? 'bg-zinc-300' : 'bg-zinc-500'}`} />
              </button>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800/50">
              <button 
                onClick={handleEraseIdentity}
                className="w-full bg-red-950/30 border border-red-900/50 hover:bg-red-900/80 hover:border-red-500 text-red-500 font-teko text-2xl uppercase tracking-widest py-4 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,0,0,0.1)] hover:shadow-[0_0_25px_rgba(255,0,0,0.3)]"
              >
                <Trash2 className="w-6 h-6" /> Terminate Identity (Delete Account)
              </button>
              <p className="text-[9px] text-zinc-600 font-mono text-center uppercase tracking-[0.2em] mt-3">Warning: This action permanently wipes all EXP, Stats, and Bounties.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
