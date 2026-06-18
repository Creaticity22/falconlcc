-- 1) Scope gamification policies to authenticated users only
DROP POLICY IF EXISTS "Users can insert own gamification" ON public.gamification;
DROP POLICY IF EXISTS "Users can update own gamification" ON public.gamification;
DROP POLICY IF EXISTS "Users can view own gamification"   ON public.gamification;

CREATE POLICY "Users can view own gamification"
  ON public.gamification FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification"
  ON public.gamification FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification"
  ON public.gamification FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2) Restrict sponsor update so financial fields and invite_code cannot be tampered with
DROP POLICY IF EXISTS "Sponsor can respond to invite" ON public.sponsor_relationships;

CREATE POLICY "Sponsor can respond to invite"
  ON public.sponsor_relationships FOR UPDATE TO authenticated
  USING (auth.uid() = sponsor_user_id)
  WITH CHECK (
    auth.uid() = sponsor_user_id
    AND sponsor_user_id       = (SELECT sr.sponsor_user_id       FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
    AND young_person_user_id  = (SELECT sr.young_person_user_id  FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
    AND match_rate            IS NOT DISTINCT FROM (SELECT sr.match_rate        FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
    AND max_match_amount      IS NOT DISTINCT FROM (SELECT sr.max_match_amount  FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
    AND invite_code           IS NOT DISTINCT FROM (SELECT sr.invite_code       FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
  );

-- Also scope the remaining public-role policies on sponsor_relationships to authenticated
DROP POLICY IF EXISTS "Users can create sponsor invites" ON public.sponsor_relationships;
DROP POLICY IF EXISTS "Users can view own sponsor relationships" ON public.sponsor_relationships;

CREATE POLICY "Users can view own sponsor relationships"
  ON public.sponsor_relationships FOR SELECT TO authenticated
  USING (auth.uid() = sponsor_user_id OR auth.uid() = young_person_user_id);

CREATE POLICY "Users can create sponsor invites"
  ON public.sponsor_relationships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = young_person_user_id);