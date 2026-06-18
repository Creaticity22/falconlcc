
DROP POLICY IF EXISTS "Users can update own ai usage" ON public.ai_usage;
REVOKE UPDATE ON public.ai_usage FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.increment_ai_usage(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_usage (user_id, questions_count, last_question_at)
  VALUES (_user_id, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET questions_count = public.ai_usage.questions_count + 1,
        last_question_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_ai_usage(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ai_usage(uuid) TO service_role;
