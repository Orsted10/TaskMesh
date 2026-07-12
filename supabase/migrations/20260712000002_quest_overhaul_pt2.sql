-- Add missing loot types requested in prompt.txt
ALTER TABLE users ADD COLUMN IF NOT EXISTS shine INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skillpoints INTEGER DEFAULT 0;
