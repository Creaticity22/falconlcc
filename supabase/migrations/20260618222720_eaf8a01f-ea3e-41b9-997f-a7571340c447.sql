
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leaderboard_visible boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(
  rank int,
  initials text,
  xp_points int,
  streak_days int,
  is_me boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ranked AS (
    SELECT
      g.user_id,
      g.xp_points,
      g.streak_days,
      p.first_name,
      ROW_NUMBER() OVER (ORDER BY g.xp_points DESC, g.updated_at ASC) AS rnk
    FROM public.gamification g
    JOIN public.profiles p ON p.user_id = g.user_id
    WHERE COALESCE(p.leaderboard_visible, true) = true
      AND g.xp_points > 0
  )
  SELECT
    rnk::int AS rank,
    COALESCE(UPPER(LEFT(NULLIF(first_name, ''), 1)), '?') || '.' AS initials,
    xp_points::int,
    streak_days::int,
    (user_id = auth.uid()) AS is_me
  FROM ranked
  WHERE rnk <= 10
  ORDER BY rnk;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_leaderboard() FROM anon, public;
