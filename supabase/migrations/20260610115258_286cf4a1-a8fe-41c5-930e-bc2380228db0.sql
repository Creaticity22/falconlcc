
-- 1. Remove broad public-read policies on user_badges / user_certificates
DROP POLICY IF EXISTS "Public can verify badge by code" ON public.user_badges;
DROP POLICY IF EXISTS "Public can verify certificate by code" ON public.user_certificates;

-- 2. Secure verification RPCs (SECURITY DEFINER, scoped to a single code)
CREATE OR REPLACE FUNCTION public.verify_badge_by_code(_code text)
RETURNS TABLE (
  badge_code text,
  verification_code text,
  issued_at timestamptz,
  recipient_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT badge_code, verification_code, issued_at, recipient_name
  FROM public.user_badges
  WHERE verification_code = _code
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.verify_certificate_by_code(_code text)
RETURNS TABLE (
  certificate_code text,
  verification_code text,
  issued_at timestamptz,
  recipient_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT certificate_code, verification_code, issued_at, recipient_name
  FROM public.user_certificates
  WHERE verification_code = _code
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_badge_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_badge_by_code(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.verify_certificate_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate_by_code(text) TO anon, authenticated;

-- 3. Privilege escalation fix on user_roles
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
CREATE POLICY "Users can insert their default role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'young_person'::app_role);

-- 4. Lock down internal SECURITY DEFINER helpers from being called via the API
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
