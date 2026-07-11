-- ==========================================
-- TASKMESH: INITIAL DATABASE SCHEMA
-- ==========================================

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  level INTEGER DEFAULT 1 NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  gold INTEGER DEFAULT 0 NOT NULL,
  hp INTEGER DEFAULT 100 NOT NULL,
  max_hp INTEGER DEFAULT 100 NOT NULL,
  mana INTEGER DEFAULT 50 NOT NULL,
  max_mana INTEGER DEFAULT 50 NOT NULL,
  str INTEGER DEFAULT 5 NOT NULL,
  vit INTEGER DEFAULT 5 NOT NULL,
  "int" INTEGER DEFAULT 5 NOT NULL,
  stat_points INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies for Profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);


-- 2. Tasks / Quests Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Common' NOT NULL, -- Common, Rare, Epic, Boss
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, completed, failed
  xp_reward INTEGER DEFAULT 10 NOT NULL,
  gold_reward INTEGER DEFAULT 5 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own tasks" 
ON public.tasks FOR ALL 
USING (auth.uid() = user_id);


-- 3. Inventory Table (Stores dynamically generated items)
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- Weapon, Head, Chest, Legs, Accessory
  rarity TEXT NOT NULL, -- Common, Uncommon, Rare, Epic, Legendary, Mythic
  color TEXT NOT NULL,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"attack": 5, "defense": 2}
  is_equipped BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own inventory" 
ON public.inventory FOR ALL 
USING (auth.uid() = user_id);


-- 4. Grimoire (Unlocked Spells) Table
CREATE TABLE IF NOT EXISTS public.grimoire (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  spell_id TEXT NOT NULL, -- References predefined spell IDs in the frontend
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- Offensive, Defensive, Utility
  mana_cost INTEGER NOT NULL,
  cooldown INTEGER NOT NULL,
  damage INTEGER,
  heal INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own grimoire" 
ON public.grimoire FOR ALL 
USING (auth.uid() = user_id);


-- ==========================================
-- AUTO-PROFILE CREATION TRIGGER
-- ==========================================
-- Automatically creates a profile entry when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
