CREATE OR REPLACE FUNCTION public.award_badge(_badge_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user uuid := auth.uid();
  _name text;
  _new_badges text[];
  _cert RECORD;
  _awarded_certs jsonb := '[]'::jsonb;
  _new_badge_row public.user_badges%ROWTYPE;
  _eligible boolean := false;
  _xp int;
  _streak int;
  _lesson_count int;
  _diary_count int;
  _wins_count int;
  _goal_count int;
  _goal_half int;
  _goal_complete int;
  _budget_count int;
  _distinct_expense_days int;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.badges WHERE code = _badge_code) THEN
    RAISE EXCEPTION 'Unknown badge: %', _badge_code;
  END IF;

  -- Already awarded? short-circuit as success (idempotent), no need to re-check criteria
  IF EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = _user AND badge_code = _badge_code) THEN
    RETURN jsonb_build_object(
      'badge_code', _badge_code,
      'newly_awarded', false,
      'certificates', '[]'::jsonb
    );
  END IF;

  -- Server-side criteria evaluation
  SELECT xp_points, streak_days INTO _xp, _streak
    FROM public.gamification WHERE user_id = _user;
  _xp := COALESCE(_xp, 0);
  _streak := COALESCE(_streak, 0);

  CASE _badge_code
    WHEN 'budget_starter' THEN
      SELECT COUNT(*) INTO _budget_count FROM public.budgets
        WHERE user_id = _user
          AND COALESCE(monthly_income, 0) > 0
          AND jsonb_typeof(COALESCE(categories::jsonb, '[]'::jsonb)) = 'array'
          AND jsonb_array_length(COALESCE(categories::jsonb, '[]'::jsonb)) > 0;
      _eligible := _budget_count > 0;
    WHEN 'saver_first_goal' THEN
      SELECT COUNT(*) INTO _goal_count FROM public.savings_goals WHERE user_id = _user;
      _eligible := _goal_count > 0;
    WHEN 'saver_halfway' THEN
      SELECT COUNT(*) INTO _goal_half FROM public.savings_goals
        WHERE user_id = _user
          AND COALESCE(target_amount, 0) > 0
          AND COALESCE(current_amount, 0) >= COALESCE(target_amount, 0) * 0.5;
      _eligible := _goal_half > 0;
    WHEN 'saver_complete' THEN
      SELECT COUNT(*) INTO _goal_complete FROM public.savings_goals
        WHERE user_id = _user
          AND COALESCE(target_amount, 0) > 0
          AND COALESCE(current_amount, 0) >= COALESCE(target_amount, 0);
      _eligible := _goal_complete > 0;
    WHEN 'learner_first_lesson' THEN
      SELECT COUNT(*) INTO _lesson_count FROM public.lesson_progress WHERE user_id = _user;
      _eligible := _lesson_count >= 1;
    WHEN 'learner_five_lessons' THEN
      SELECT COUNT(*) INTO _lesson_count FROM public.lesson_progress WHERE user_id = _user;
      _eligible := _lesson_count >= 5;
    WHEN 'learner_scholar' THEN
      SELECT COUNT(*) INTO _lesson_count FROM public.lesson_progress WHERE user_id = _user;
      _eligible := _lesson_count >= 10;
    WHEN 'decision_reflective' THEN
      SELECT COUNT(*) INTO _diary_count FROM public.money_diary_entries WHERE user_id = _user;
      _eligible := _diary_count >= 1;
    WHEN 'decision_aware' THEN
      SELECT COUNT(DISTINCT expense_date) INTO _distinct_expense_days
        FROM public.expenses WHERE user_id = _user;
      _eligible := _distinct_expense_days >= 7;
    WHEN 'milestone_first_win' THEN
      SELECT COUNT(*) INTO _wins_count FROM public.money_wins WHERE user_id = _user;
      _eligible := _wins_count >= 1;
    WHEN 'milestone_xp_100' THEN _eligible := _xp >= 100;
    WHEN 'milestone_xp_500' THEN _eligible := _xp >= 500;
    WHEN 'milestone_xp_1000' THEN _eligible := _xp >= 1000;
    WHEN 'behaviour_streak_7' THEN _eligible := _streak >= 7;
    WHEN 'behaviour_streak_30' THEN _eligible := _streak >= 30;
    ELSE
      _eligible := false;
  END CASE;

  IF NOT _eligible THEN
    RAISE EXCEPTION 'Criteria not met for badge: %', _badge_code
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT first_name INTO _name FROM public.profiles WHERE user_id = _user;

  INSERT INTO public.user_badges (user_id, badge_code, recipient_name)
  VALUES (_user, _badge_code, _name)
  ON CONFLICT (user_id, badge_code) DO NOTHING
  RETURNING * INTO _new_badge_row;

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
$function$;