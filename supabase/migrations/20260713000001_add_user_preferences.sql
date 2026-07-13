-- Add preferences column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"ai_persona": "drill_sergeant", "theme_color": "red", "sound_fx": true, "linked_hardware": {}}';
