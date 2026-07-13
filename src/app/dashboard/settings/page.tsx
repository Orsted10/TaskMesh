'use client';

import { motion } from 'framer-motion';
import { Settings, BrainCircuit, ActivitySquare, ShieldCheck, Palette, Bell, Volume2, Ghost, Save, Trash2, Loader2 } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  useEffect(() => {
    if (rpgProfile) {
      setDisplayName(rpgProfile.full_name || rpgProfile.username || '');
      const prefs = rpgProfile.preferences || {};
      setActivePersona(prefs.ai_persona || 'drill_sergeant');
      setThemeColor(prefs.theme_color || 'red');
      setSoundFx(prefs.sound_fx !== false);
      setGhostProtocol(prefs.ghost_protocol === true);
      if (prefs.notifications) {
        setNotifications({
          email: prefs.notifications.email ?? true,
          push: prefs.notifications.push ?? true,
          sms: prefs.notifications.sms ?? false,
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
      
      await refreshProfile();
      toast.success('Configuration Saved', { description: 'System parameters have been updated.' });
    } catch (err: any) {
      toast.error('Save Failed', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEraseIdentity = () => {
    // We mock this to avoid accidental deletion
    toast.error('Operation Blocked', { description: 'Identity erasure is restricted during active missions. Complete all protocols first.' });
  };

  const themeColors = [
    { id: 'red', name: 'Blood Ruby', hex: '#ff4655' },
    { id: 'blue', name: 'Cyber Blue', hex: '#3b82f6' },
    { id: 'emerald', name: 'Neon Toxic', hex: '#10b981' },
    { id: 'purple', name: 'Void Purple', hex: '#a855f7' },
    { id: 'yellow', name: 'Solar Flare', hex: '#eab308' },
  ];

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-4">
          <Settings className="w-8 h-8 text-zinc-400 animate-spin-slow" />
          <h1 className="text-5xl font-teko text-white uppercase tracking-wider">System Config</h1>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-500 text-black font-teko text-xl uppercase tracking-widest px-8 py-2 rounded transition-colors flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Config'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* AI Persona */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4655]/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#ff4655]" /> AI Mentor Persona
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {[
              { id: 'drill_sergeant', name: 'Drill Sergeant', desc: 'Aggressive accountability.', icon: '🤬', border: 'border-red-500' },
              { id: 'socratic', name: 'Socratic Tutor', desc: 'Guides via questions.', icon: '🦉', border: 'border-blue-500' },
              { id: 'hype_man', name: 'The Hype Man', desc: 'Extreme positivity.', icon: '🔥', border: 'border-orange-500' },
              { id: 'zen_master', name: 'Zen Master', desc: 'Calm, focused.', icon: '🧘', border: 'border-emerald-500' },
            ].map((persona) => (
              <div 
                key={persona.id}
                onClick={() => setActivePersona(persona.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-2 relative ${activePersona === persona.id ? `bg-zinc-900 ${persona.border}` : 'bg-black border-zinc-800 hover:border-zinc-700'}`}
              >
                {activePersona === persona.id && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${persona.border.replace('border-', 'bg-')}`} />
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
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" /> HUD Interface
          </h2>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest block mb-3">Primary Matrix Color</label>
              <div className="flex gap-4">
                {themeColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setThemeColor(color.id)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${themeColor === color.id ? 'scale-110 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-zinc-800 hover:scale-105'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <div className="flex items-center justify-between bg-black p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-zinc-400" />
                  <div>
                    <h4 className="font-teko text-xl text-white uppercase leading-none">System SFX</h4>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">UI Sounds & Feedback</p>
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

        {/* Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" /> Notifications
          </h2>

          <div className="space-y-4 relative z-10">
            {[
              { id: 'email', name: 'Email Updates', desc: 'Daily briefs and bounty alerts.' },
              { id: 'push', name: 'Push Notifications', desc: 'Real-time verification alerts.' },
              { id: 'sms', name: 'SMS Critical', desc: 'Only for permadeath warnings.' },
            ].map((notif) => (
              <div key={notif.id} className="flex items-center justify-between bg-black p-4 rounded-xl border border-zinc-800">
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
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/5 blur-3xl rounded-full" />
          <h2 className="font-teko text-3xl text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-zinc-400" /> Identity & Security
          </h2>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest block mb-2">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="OPERATIVE_01" 
                className="w-full bg-black border border-zinc-700 rounded p-3 text-white font-mono text-sm focus:border-emerald-500 outline-none transition-colors" 
              />
            </div>
            
            <div className="flex items-center justify-between bg-black p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <Ghost className="w-5 h-5 text-zinc-400" />
                <div>
                  <h4 className="font-teko text-xl text-white uppercase leading-none text-red-400">Ghost Protocol</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Hide profile from leaderboards</p>
                </div>
              </div>
              <button 
                onClick={() => setGhostProtocol(!ghostProtocol)}
                className={`w-12 h-6 rounded-full relative transition-colors ${ghostProtocol ? 'bg-red-500/20 border border-red-500/50' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <motion.div animate={{ x: ghostProtocol ? 24 : 2 }} className={`absolute top-1 bottom-1 w-4 rounded-full ${ghostProtocol ? 'bg-red-500' : 'bg-zinc-500'}`} />
              </button>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/50">
              <button 
                onClick={handleEraseIdentity}
                className="w-full bg-red-950/30 border border-red-900/50 hover:bg-red-900/50 hover:border-red-500 text-red-500 font-teko text-xl uppercase tracking-widest py-3 rounded transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" /> Erase Identity (Delete Account)
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
