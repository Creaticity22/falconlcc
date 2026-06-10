
-- ai_usage: remove INSERT/DELETE from clients; keep SELECT + UPDATE for own row
DROP POLICY IF EXISTS "Users can CRUD own ai usage" ON public.ai_usage;

CREATE POLICY "Users can view own ai usage"
ON public.ai_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ai usage"
ON public.ai_usage
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- sponsor_relationships: lock down which fields each party may change
DROP POLICY IF EXISTS "Users can update own sponsor relationships" ON public.sponsor_relationships;

-- Young person may only cancel an invite they created (status -> 'cancelled')
-- and cannot reassign user ids or change financial terms.
CREATE POLICY "Young person can cancel own invite"
ON public.sponsor_relationships
FOR UPDATE
TO authenticated
USING (
  auth.uid() = young_person_user_id
  AND status IN ('pending', 'active')
)
WITH CHECK (
  auth.uid() = young_person_user_id
  AND status = 'cancelled'
  AND young_person_user_id = (SELECT sr.young_person_user_id FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
  AND sponsor_user_id IS NOT DISTINCT FROM (SELECT sr.sponsor_user_id FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
  AND match_rate = (SELECT sr.match_rate FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
  AND max_match_amount = (SELECT sr.max_match_amount FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
);

-- Sponsor may accept/decline the invite assigned to them and cannot reassign young_person or change identities.
CREATE POLICY "Sponsor can respond to invite"
ON public.sponsor_relationships
FOR UPDATE
TO authenticated
USING (
  auth.uid() = sponsor_user_id
)
WITH CHECK (
  auth.uid() = sponsor_user_id
  AND sponsor_user_id = (SELECT sr.sponsor_user_id FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
  AND young_person_user_id = (SELECT sr.young_person_user_id FROM public.sponsor_relationships sr WHERE sr.id = sponsor_relationships.id)
);
