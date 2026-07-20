-- Feed Events (Global Intel)
CREATE TABLE IF NOT EXISTS feed_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'level_up', 'quest_completed', 'bounty_claimed', 'guild_joined'
    title TEXT NOT NULL,
    color TEXT DEFAULT 'text-emerald-500',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items (Arsenal / Economy)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'consumable', 'cosmetic', 'persona'
    price_gold INTEGER DEFAULT 0,
    price_shine INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'legendary'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Inventory
CREATE TABLE IF NOT EXISTS user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- Guild Members (Many to Many)
CREATE TABLE IF NOT EXISTS guild_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'leader', 'officer', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(guild_id, user_id)
);

-- RLS
ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feed events are public" ON feed_events FOR SELECT USING (true);
CREATE POLICY "Feed events insertable by auth" ON feed_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Items are public" ON items FOR SELECT USING (true);

CREATE POLICY "Users can view own inventory" ON user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON user_inventory FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Guild members are public" ON guild_members FOR SELECT USING (true);
CREATE POLICY "Users can join guilds" ON guild_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave guilds" ON guild_members FOR DELETE USING (auth.uid() = user_id);

-- Add shine column to users if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS shine INTEGER DEFAULT 0;

-- Trigger to automatically create a feed event when someone levels up
CREATE OR REPLACE FUNCTION log_level_up_feed_event()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.level > OLD.level THEN
        INSERT INTO feed_events (user_id, event_type, title, color)
        VALUES (NEW.id, 'level_up', 'Reached Level ' || NEW.level, 'text-purple-500');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_level_up ON users;
CREATE TRIGGER trigger_log_level_up
AFTER UPDATE OF level ON users
FOR EACH ROW
EXECUTE FUNCTION log_level_up_feed_event();

-- Initial Item Seed
INSERT INTO items (name, description, category, price_gold, price_shine, rarity, metadata)
VALUES 
  ('Streak Freeze', 'Protects your streak for 1 day of inactivity.', 'consumable', 500, 0, 'common', '{"effect": "freeze_1_day"}'),
  ('Neon Cyber Theme', 'Unlocks the Neon Cyan UI visual matrix.', 'cosmetic', 2000, 0, 'rare', '{"theme_key": "cyber"}'),
  ('Drill Sergeant Persona', 'Unlock the merciless AI mentor personality.', 'persona', 1000, 0, 'rare', '{"persona_key": "drill_sergeant"}'),
  ('Legendary Void Aura', 'Emits a dark purple aura around your profile.', 'cosmetic', 0, 100, 'legendary', '{"aura_key": "void"}')
ON CONFLICT DO NOTHING;
