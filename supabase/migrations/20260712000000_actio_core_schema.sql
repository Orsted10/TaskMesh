create extension if not exists postgis schema extensions;

-- Drop previous Phase 1 placeholder tables if they exist
DROP TABLE IF EXISTS user_step_verifications CASCADE;
DROP TABLE IF EXISTS user_quest_progress CASCADE;
DROP TABLE IF EXISTS quest_steps CASCADE;
DROP TABLE IF EXISTS quests CASCADE;
DROP TABLE IF EXISTS guilds CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate the true ACTIO schema
CREATE TABLE guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    leader_id UUID, -- Will reference users after users table is created
    total_exp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    base_level INTEGER DEFAULT 1,
    treasury_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    total_exp INTEGER DEFAULT 0,
    skills JSONB DEFAULT '{"strength": 0, "intelligence": 0, "charisma": 0, "creativity": 0, "craftsmanship": 0, "willpower": 0}',
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    multiplier FLOAT DEFAULT 1.0,
    title TEXT DEFAULT 'Novice',
    theme_unlocked JSONB DEFAULT '["default"]',
    guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add the foreign key for guild leader now that users table exists
ALTER TABLE guilds ADD CONSTRAINT fk_guild_leader FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty INTEGER DEFAULT 1,
    bounty_amount INTEGER,
    bounty_currency TEXT DEFAULT 'usd',
    location geography(POINT),
    is_public BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT false,
    parent_quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quest_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    instruction TEXT NOT NULL,
    estimated_time_seconds INTEGER DEFAULT 300,
    verification_type TEXT NOT NULL DEFAULT 'image', -- 'image', 'gps', 'audio', 'api'
    ai_validation_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_quest_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed', 'abandoned'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_step_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_id UUID REFERENCES user_quest_progress(id) ON DELETE CASCADE,
    step_id UUID REFERENCES quest_steps(id) ON DELETE CASCADE,
    proof_url TEXT,
    metadata JSONB,
    status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    ai_feedback TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXP AND LEVELING TRIGGER
-- Trigger logic: AFTER UPDATE ON user_step_verifications
-- If status changes to 'verified', calculates EXP and adds to total_exp.
CREATE OR REPLACE FUNCTION process_step_verification()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_base_exp INTEGER := 100;
    v_reward INTEGER;
    v_current_total INTEGER;
    v_current_level INTEGER;
    v_new_level INTEGER;
    v_multiplier FLOAT;
BEGIN
    -- Only run if status changed to 'verified'
    IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
        
        -- Get the user ID and multiplier from the progress record
        SELECT u.id, u.total_exp, u.level, u.multiplier INTO v_user_id, v_current_total, v_current_level, v_multiplier
        FROM user_quest_progress p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = NEW.progress_id;

        -- Calculate reward: (Base * Multiplier)
        v_reward := CAST((v_base_exp * v_multiplier) AS INTEGER);
        v_current_total := v_current_total + v_reward;

        -- Calculate new level based on exponential curve:
        -- EXP required for Level N = 100 * (1.15 ^ (N - 1))
        -- We just loop to find the highest level they qualify for.
        v_new_level := 1;
        WHILE v_current_total >= (100 * POWER(1.15, v_new_level)) LOOP
            v_new_level := v_new_level + 1;
        END LOOP;

        -- Update the user
        UPDATE users 
        SET total_exp = v_current_total,
            level = v_new_level,
            updated_at = NOW()
        WHERE id = v_user_id;

    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_step_verification
AFTER UPDATE ON user_step_verifications
FOR EACH ROW
EXECUTE FUNCTION process_step_verification();

-- AUTO CREATE USER PROFILE ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, username)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Need to safely create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_step_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Can be refined later)
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Quests are readable by all" ON quests FOR SELECT USING (true);
CREATE POLICY "Quest steps are readable by all" ON quest_steps FOR SELECT USING (true);
CREATE POLICY "Users can view their own progress" ON user_quest_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own verifications" ON user_step_verifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_quest_progress p WHERE p.id = progress_id AND p.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own verifications" ON user_step_verifications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_quest_progress p WHERE p.id = progress_id AND p.user_id = auth.uid())
);
