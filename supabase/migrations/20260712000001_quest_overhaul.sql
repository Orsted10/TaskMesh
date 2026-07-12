-- Overhaul quests table to support advanced gamification
ALTER TABLE quests ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Standard';
ALTER TABLE quests ADD COLUMN IF NOT EXISTS mission_type TEXT DEFAULT 'Task';
ALTER TABLE quests ADD COLUMN IF NOT EXISTS rewards JSONB DEFAULT '{"xp": 100, "gold": 10}';
ALTER TABLE quests ADD COLUMN IF NOT EXISTS time_limit_hours INTEGER;

-- Overhaul users table to support advanced loot
ALTER TABLE users ADD COLUMN IF NOT EXISTS gold INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS specific_skills JSONB DEFAULT '{}';
