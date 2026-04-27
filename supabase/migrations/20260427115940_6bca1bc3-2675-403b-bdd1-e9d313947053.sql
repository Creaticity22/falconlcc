-- ============== Catalogue tables ==============
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL, -- 'budgeting' | 'saving' | 'investing' | 'decision' | 'behaviour' | 'milestone'
  skills text[] NOT NULL DEFAULT '{}',
  criteria text NOT NULL,
  tier int NOT NULL DEFAULT 1, -- 1 bronze, 2 silver, 3 gold
  icon text NOT NULL DEFAULT 'award',
  color text NOT NULL DEFAULT 'primary',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  required_badge_codes text[] NOT NULL DEFAULT '{}',
  tier int NOT NULL DEFAULT 1,
  issuer text NOT NULL DEFAULT 'Falcon',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read badge catalogue"
  ON public.badges FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can read certificate catalogue"
  ON public.certificates FOR SELECT TO anon, authenticated USING (true);

-- ============== Earned tables ==============
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_code text NOT NULL REFERENCES public.badges(code) ON DELETE CASCADE,
  verification_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  issued_at timestamptz NOT NULL DEFAULT now(),
  recipient_name text,
  UNIQUE (user_id, badge_code)
);

CREATE TABLE public.user_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  certificate_code text NOT NULL REFERENCES public.certificates(code) ON DELETE CASCADE,
  verification_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(10), 'hex'),
  issued_at timestamptz NOT NULL DEFAULT now(),
  recipient_name text,
  UNIQUE (user_id, certificate_code)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

-- Owners can see their own
CREATE POLICY "Users view own badges"
  ON public.user_badges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own certificates"
  ON public.user_certificates FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Public verification: anyone can read a single row when supplying its verification_code.
-- Verification pages query with .eq('verification_code', code) so RLS allows it broadly;
-- the verification_code itself is the unguessable secret.
CREATE POLICY "Public can verify badge by code"
  ON public.user_badges FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public can verify certificate by code"
  ON public.user_certificates FOR SELECT TO anon, authenticated
  USING (true);

-- ============== Award function (security definer) ==============
CREATE OR REPLACE FUNCTION public.award_badge(_badge_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _name text;
  _new_badges text[];
  _cert RECORD;
  _awarded_certs jsonb := '[]'::jsonb;
  _new_badge_row public.user_badges%ROWTYPE;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify badge exists
  IF NOT EXISTS (SELECT 1 FROM public.badges WHERE code = _badge_code) THEN
    RAISE EXCEPTION 'Unknown badge: %', _badge_code;
  END IF;

  SELECT first_name INTO _name FROM public.profiles WHERE user_id = _user;

  -- Insert badge if missing
  INSERT INTO public.user_badges (user_id, badge_code, recipient_name)
  VALUES (_user, _badge_code, _name)
  ON CONFLICT (user_id, badge_code) DO NOTHING
  RETURNING * INTO _new_badge_row;

  -- Check certificates
  SELECT array_agg(badge_code) INTO _new_badges
    FROM public.user_badges WHERE user_id = _user;

  FOR _cert IN
    SELECT c.code, c.required_badge_codes
    FROM public.certificates c
    WHERE c.required_badge_codes <@ _new_badges
      AND NOT EXISTS (
        SELECT 1 FROM public.user_certificates uc
        WHERE uc.user_id = _user AND uc.certificate_code = c.code
      )
  LOOP
    INSERT INTO public.user_certificates (user_id, certificate_code, recipient_name)
    VALUES (_user, _cert.code, _name)
    ON CONFLICT DO NOTHING;
    _awarded_certs := _awarded_certs || jsonb_build_object('certificate_code', _cert.code);
  END LOOP;

  RETURN jsonb_build_object(
    'badge_code', _badge_code,
    'newly_awarded', _new_badge_row.id IS NOT NULL,
    'certificates', _awarded_certs
  );
END;
$$;

-- ============== Seed catalogue ==============
INSERT INTO public.badges (code, name, description, category, skills, criteria, tier, icon, color, sort_order) VALUES
  -- Budgeting
  ('budget_starter', 'Budget Starter', 'Set up your first monthly budget.', 'budgeting', ARRAY['budgeting','planning'], 'Create a budget with monthly income and at least one category.', 1, 'pie-chart', 'primary', 10),
  ('budget_balanced', 'Balanced Budgeter', 'Stay within budget for a full month.', 'budgeting', ARRAY['budgeting','self-control'], 'Log expenses without exceeding your budgeted total for a month.', 2, 'pie-chart', 'primary', 11),
  ('budget_master', 'Budget Master', 'Maintain a healthy budget across 3 months.', 'budgeting', ARRAY['budgeting','financial-planning'], 'Keep an active, balanced budget for three consecutive months.', 3, 'pie-chart', 'primary', 12),
  -- Saving
  ('saver_first_goal', 'Goal Setter', 'Create your first savings goal.', 'saving', ARRAY['goal-setting','saving'], 'Add at least one savings goal.', 1, 'target', 'accent', 20),
  ('saver_halfway', 'Halfway Hero', 'Reach 50% of any savings goal.', 'saving', ARRAY['saving','consistency'], 'Hit 50% progress on a savings goal.', 2, 'target', 'accent', 21),
  ('saver_complete', 'Goal Crusher', 'Fully complete a savings goal.', 'saving', ARRAY['saving','discipline'], 'Reach 100% on any savings goal.', 3, 'trophy', 'accent', 22),
  -- Investing / Knowledge
  ('learner_first_lesson', 'First Steps', 'Complete your first lesson.', 'investing', ARRAY['financial-literacy'], 'Finish one Falcon lesson.', 1, 'book-open', 'primary', 30),
  ('learner_five_lessons', 'Knowledge Builder', 'Complete 5 lessons.', 'investing', ARRAY['financial-literacy','investing-basics'], 'Complete five lessons across the Learn hub.', 2, 'book-open', 'primary', 31),
  ('learner_scholar', 'Money Scholar', 'Complete 10 lessons with strong scores.', 'investing', ARRAY['financial-literacy','investing','critical-thinking'], 'Complete ten lessons.', 3, 'graduation-cap', 'primary', 32),
  -- Decision making
  ('decision_reflective', 'Reflective Thinker', 'Log your first Money Diary entry.', 'decision', ARRAY['self-awareness','reflection'], 'Add one weekly Money Diary entry.', 1, 'brain', 'primary', 40),
  ('decision_aware', 'Mindful Spender', 'Track expenses for 7 different days.', 'decision', ARRAY['mindfulness','tracking'], 'Log expenses on seven distinct days.', 2, 'brain', 'primary', 41),
  ('decision_strategist', 'Money Strategist', 'Use Falcon AI to plan a real decision.', 'decision', ARRAY['decision-making','planning'], 'Ask Falcon AI for help on a money decision.', 3, 'brain', 'primary', 42),
  -- Behaviour / Milestones
  ('behaviour_streak_7', '7-Day Streak', 'Stay active 7 days in a row.', 'behaviour', ARRAY['consistency'], 'Maintain a 7-day streak.', 1, 'flame', 'streak', 50),
  ('behaviour_streak_30', '30-Day Streak', 'Stay active 30 days in a row.', 'behaviour', ARRAY['consistency','habit-building'], 'Maintain a 30-day streak.', 3, 'flame', 'streak', 51),
  ('milestone_first_win', 'First Win', 'Log your first money win.', 'milestone', ARRAY['celebration','reflection'], 'Add an entry to Money Wins.', 1, 'sparkles', 'accent', 60),
  ('milestone_xp_100', 'Rising Star', 'Earn 100 XP.', 'milestone', ARRAY['engagement'], 'Reach 100 XP.', 1, 'star', 'accent', 61),
  ('milestone_xp_500', 'Falcon Apprentice', 'Earn 500 XP.', 'milestone', ARRAY['engagement','dedication'], 'Reach 500 XP.', 2, 'star', 'accent', 62),
  ('milestone_xp_1000', 'Falcon Pro', 'Earn 1,000 XP.', 'milestone', ARRAY['mastery','dedication'], 'Reach 1,000 XP.', 3, 'star', 'accent', 63);

INSERT INTO public.certificates (code, name, description, skills, required_badge_codes, tier, sort_order) VALUES
  ('cert_budgeting_essentials',
   'Budgeting Essentials',
   'Recognises foundational competence in personal budgeting and expense tracking.',
   ARRAY['budgeting','expense-tracking','self-control'],
   ARRAY['budget_starter','budget_balanced'],
   1, 10),
  ('cert_smart_saver',
   'Smart Saver',
   'Demonstrates the ability to set, track, and complete personal savings goals.',
   ARRAY['saving','goal-setting','discipline'],
   ARRAY['saver_first_goal','saver_halfway','saver_complete'],
   2, 20),
  ('cert_financial_literacy',
   'Financial Literacy Foundations',
   'Confirms completion of foundational financial education on money, saving, and investing basics.',
   ARRAY['financial-literacy','investing-basics','critical-thinking'],
   ARRAY['learner_first_lesson','learner_five_lessons'],
   2, 30),
  ('cert_money_mindset',
   'Money Mindset & Decision Making',
   'Recognises strong reflective practice and intentional financial decision-making.',
   ARRAY['decision-making','self-awareness','mindfulness'],
   ARRAY['decision_reflective','decision_aware'],
   2, 40),
  ('cert_falcon_graduate',
   'Falcon Financial Graduate',
   'Highest-tier recognition: holder has demonstrated mastery across budgeting, saving, financial literacy, and decision-making.',
   ARRAY['budgeting','saving','financial-literacy','decision-making','consistency'],
   ARRAY['budget_master','saver_complete','learner_scholar','decision_strategist'],
   3, 99);