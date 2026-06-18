-- Block client writes on ai_usage. Service role bypasses RLS, and
-- the existing increment_ai_usage() SECURITY DEFINER function can still write.
CREATE POLICY "No client inserts on ai_usage"
  ON public.ai_usage AS RESTRICTIVE FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "No client updates on ai_usage"
  ON public.ai_usage AS RESTRICTIVE FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes on ai_usage"
  ON public.ai_usage AS RESTRICTIVE FOR DELETE TO authenticated, anon
  USING (false);