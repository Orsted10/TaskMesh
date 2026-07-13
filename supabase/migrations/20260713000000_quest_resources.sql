ALTER TABLE quest_steps ADD COLUMN resources JSONB DEFAULT '[]'::jsonb;
