DO $$
DECLARE
  demo_uid uuid;
  cur_month text := to_char(current_date, 'YYYY-MM');
  wk_start date := date_trunc('week', current_date)::date;
BEGIN
  SELECT id INTO demo_uid FROM auth.users WHERE email = 'demo@soarwithfalcon.com';

  IF demo_uid IS NULL THEN
    demo_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, role, aud, instance_id
    ) VALUES (
      demo_uid,
      'demo@soarwithfalcon.com',
      crypt('FalconDemo2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(), now(), 'authenticated', 'authenticated',
      '00000000-0000-0000-0000-000000000000'
    );
  END IF;

  INSERT INTO public.profiles (user_id, first_name, age_range, income_band, money_goal, saving_for, onboarding_completed, leaderboard_visible)
  VALUES (demo_uid, 'Alex', '18-21', '150+', 'Saving for something big', 'travel', true, true)
  ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    age_range = EXCLUDED.age_range,
    income_band = EXCLUDED.income_band,
    money_goal = EXCLUDED.money_goal,
    saving_for = EXCLUDED.saving_for,
    onboarding_completed = EXCLUDED.onboarding_completed,
    leaderboard_visible = EXCLUDED.leaderboard_visible;

  INSERT INTO public.gamification (user_id, xp_points, streak_days, last_active_date, badges)
  VALUES (demo_uid, 285, 5, current_date, '[]'::jsonb)
  ON CONFLICT (user_id) DO UPDATE SET
    xp_points = EXCLUDED.xp_points,
    streak_days = EXCLUDED.streak_days,
    last_active_date = EXCLUDED.last_active_date,
    badges = EXCLUDED.badges;

  DELETE FROM public.budgets WHERE user_id = demo_uid AND month = cur_month;
  INSERT INTO public.budgets (user_id, month, monthly_income, categories)
  VALUES (demo_uid, cur_month, 420,
    '[{"name":"Essentials","planned":200},{"name":"Fun","planned":120},{"name":"Savings","planned":100}]'::jsonb);

  DELETE FROM public.expenses WHERE user_id = demo_uid AND expense_date >= date_trunc('month', current_date);
  INSERT INTO public.expenses (user_id, amount, category, note, expense_date) VALUES
    (demo_uid, 18.50, 'Essentials', 'Tesco weekly shop', current_date - interval '13 days'),
    (demo_uid,  9.99, 'Fun',        'Spotify Premium',   current_date - interval '12 days'),
    (demo_uid, 12.00, 'Essentials', 'Bus pass top-up',   current_date - interval '11 days'),
    (demo_uid, 24.00, 'Fun',        'Cinema + snacks',   current_date - interval '9 days'),
    (demo_uid,  6.50, 'Essentials', 'Meal deal x 5',     current_date - interval '7 days'),
    (demo_uid, 14.99, 'Fun',        'New t-shirt',       current_date - interval '5 days'),
    (demo_uid,  8.00, 'Essentials', 'Phone credit',      current_date - interval '3 days'),
    (demo_uid, 22.00, 'Fun',        'Night out',         current_date - interval '1 days');

  DELETE FROM public.savings_goals WHERE user_id = demo_uid;
  INSERT INTO public.savings_goals (user_id, name, target_amount, current_amount, target_date, description) VALUES
    (demo_uid, 'Interrail Europe 🇪🇺', 800, 245, (current_date + interval '6 months')::date, 'Saving up for a summer Interrail adventure!'),
    (demo_uid, 'New Headphones 🎧',    150,  38, (current_date + interval '3 months')::date, 'Treating myself to some decent headphones');

  DELETE FROM public.lesson_progress WHERE user_id = demo_uid;
  INSERT INTO public.lesson_progress (user_id, lesson_id, score) VALUES
    (demo_uid, 'budgeting-basics',    3),
    (demo_uid, 'saving-and-interest', 2),
    (demo_uid, 'understanding-tax',   3);

  DELETE FROM public.money_diary_entries WHERE user_id = demo_uid;
  INSERT INTO public.money_diary_entries (user_id, mood_score, mood_emoji, note, week_start_date, created_at) VALUES
    (demo_uid, 3, '😐', 'Spent more than I wanted to this week', wk_start - interval '21 days', now() - interval '21 days'),
    (demo_uid, 4, '🙂', 'Managed to put £20 into savings!',       wk_start - interval '14 days', now() - interval '14 days'),
    (demo_uid, 4, '🙂', NULL,                                     wk_start,                       now());

  DELETE FROM public.money_wins WHERE user_id = demo_uid;
  INSERT INTO public.money_wins (user_id, text, created_at) VALUES
    (demo_uid, 'Cooked at home instead of ordering takeaway — saved about £15!', now() - interval '14 days'),
    (demo_uid, 'Walked instead of getting the bus for a whole week, saved £6',    now() - interval '7 days'),
    (demo_uid, 'Put £25 into my Interrail fund this month 🎉',                   now() - interval '3 days');

  DELETE FROM public.subscriptions WHERE user_id = demo_uid;
  INSERT INTO public.subscriptions (user_id, name, amount) VALUES
    (demo_uid, 'Spotify',        9.99),
    (demo_uid, 'iCloud Storage', 0.99);
END $$;