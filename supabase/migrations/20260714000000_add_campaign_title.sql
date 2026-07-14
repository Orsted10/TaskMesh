-- Add campaign_title to group quests logically
ALTER TABLE quests ADD COLUMN IF NOT EXISTS campaign_title TEXT;
