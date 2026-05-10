
-- 1. Fix anonymous prayer_requests user_id exposure
-- Restrict direct SELECT so anonymous rows are only visible to owner/admin;
-- public consumers must use get_public_prayer_requests RPC which masks user_id.
DROP POLICY IF EXISTS "Anyone can view public requests" ON public.prayer_requests;

CREATE POLICY "View non-anonymous, own, or admin requests"
ON public.prayer_requests
FOR SELECT
USING (
  (is_deleted IS NOT TRUE)
  AND (
    is_anonymous IS NOT TRUE
    OR auth.uid() = user_id
    OR public.is_admin(auth.uid())
  )
);

-- 2. Lock down subscriptions: only service_role / admin can write.
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;

-- 3. user_roles: add explicit restrictive policies (defense in depth)
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 4. Banned-user enforcement at the database layer
CREATE OR REPLACE FUNCTION public.is_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT banned FROM public.profiles WHERE id = _user_id),
    false
  )
$$;

-- prayer_requests: block banned users from creating/updating
DROP POLICY IF EXISTS "Users can create requests" ON public.prayer_requests;
CREATE POLICY "Users can create requests"
ON public.prayer_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));

DROP POLICY IF EXISTS "Users can update own requests" ON public.prayer_requests;
CREATE POLICY "Users can update own requests"
ON public.prayer_requests
FOR UPDATE
USING (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));

-- user_prayers: block banned users
DROP POLICY IF EXISTS "Users can add own prayers" ON public.user_prayers;
CREATE POLICY "Users can add own prayers"
ON public.user_prayers
FOR INSERT
WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));

-- verification_requests: block banned users
DROP POLICY IF EXISTS "Users can create verification requests" ON public.verification_requests;
CREATE POLICY "Users can create verification requests"
ON public.verification_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));
