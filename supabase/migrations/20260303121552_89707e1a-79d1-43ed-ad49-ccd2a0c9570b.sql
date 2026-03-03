
-- Money diary entries
CREATE TABLE public.money_diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  mood_emoji TEXT NOT NULL DEFAULT '😐',
  note TEXT,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start_date)
);

ALTER TABLE public.money_diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own diary entries"
  ON public.money_diary_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Goal templates
CREATE TABLE public.goal_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_min_amount NUMERIC NOT NULL DEFAULT 0,
  suggested_max_amount NUMERIC NOT NULL DEFAULT 0,
  suggested_timeframe_months INTEGER NOT NULL DEFAULT 6,
  default_topic TEXT NOT NULL DEFAULT 'saving',
  lesson_id TEXT,
  resource_topics TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.goal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read goal templates"
  ON public.goal_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Money wins
CREATE TABLE public.money_wins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.money_wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own money wins"
  ON public.money_wins
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
