REVOKE EXECUTE ON FUNCTION public.award_badge(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.award_badge(text) TO authenticated;