'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Defines the RPG stats we fetch from our public.users table
export type RpgProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  level: number;
  total_exp: number;
  current_streak: number;
  multiplier: number;
  title: string;
  skills: {
    strength: number;
    intelligence: number;
    charisma: number;
    creativity: number;
    craftsmanship: number;
    willpower: number;
  };
};

type AuthContextType = {
  user: User | null;
  rpgProfile: RpgProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  rpgProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [rpgProfile, setRpgProfile] = useState<RpgProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching RPG profile:", error.message);
        return;
      }
      if (data) {
        // Fallback for skills if they don't match the new schema perfectly yet
        const defaultSkills = { strength: 0, intelligence: 0, charisma: 0, creativity: 0, craftsmanship: 0, willpower: 0 };
        data.skills = { ...defaultSkills, ...(data.skills || {}) };
        setRpgProfile(data as RpgProfile);
      }
    } catch (err) {
      console.error("Failed to fetch RPG Profile", err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setRpgProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, rpgProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
