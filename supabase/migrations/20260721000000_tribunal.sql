-- ==========================================
-- TASKMESH: TRIBUNAL DATABASE SCHEMA
-- ==========================================

-- 1. Tribunal Cases
CREATE TABLE IF NOT EXISTS public.tribunal_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  step_verification_id UUID REFERENCES public.user_step_verifications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  task_title TEXT NOT NULL,
  proof_image_url TEXT NOT NULL,
  ai_verdict TEXT NOT NULL,
  ai_confidence TEXT,
  ai_reasoning TEXT,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, upheld, overturned
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tribunal_cases ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view cases
CREATE POLICY "Users can view tribunal cases" 
ON public.tribunal_cases FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow inserting cases
CREATE POLICY "System can insert tribunal cases" 
ON public.tribunal_cases FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 2. Tribunal Votes
CREATE TABLE IF NOT EXISTS public.tribunal_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.tribunal_cases(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  vote TEXT NOT NULL, -- uphold, overturn
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(case_id, voter_id)
);

ALTER TABLE public.tribunal_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes" 
ON public.tribunal_votes FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can cast votes" 
ON public.tribunal_votes FOR INSERT 
WITH CHECK (auth.uid() = voter_id);
