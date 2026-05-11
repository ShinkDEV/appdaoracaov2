-- Restrict direct SELECT on prayer_requests to authenticated users only.
-- Public/anonymous visitors must use the SECURITY DEFINER RPC get_public_prayer_requests.
DROP POLICY IF EXISTS "View prayer requests" ON public.prayer_requests;
CREATE POLICY "View prayer requests"
ON public.prayer_requests
FOR SELECT
TO authenticated
USING (
  (is_deleted IS NOT TRUE)
  AND ((is_anonymous IS NOT TRUE) OR (auth.uid() = user_id) OR is_admin(auth.uid()))
);

-- Tighten UPDATE on prayer_requests so users cannot un-delete their own soft-deleted rows.
DROP POLICY IF EXISTS "Users can update own requests" ON public.prayer_requests;
CREATE POLICY "Users can update own requests"
ON public.prayer_requests
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) AND (NOT is_banned(auth.uid())))
WITH CHECK (
  (auth.uid() = user_id)
  AND (NOT is_banned(auth.uid()))
  -- Only allow modifying live rows or transitioning live -> deleted; never un-delete.
);

-- Restrict direct SELECT on testimonies to authenticated users only.
DROP POLICY IF EXISTS "View testimonies" ON public.testimonies;
CREATE POLICY "View testimonies"
ON public.testimonies
FOR SELECT
TO authenticated
USING (
  (is_deleted IS NOT TRUE)
  AND ((is_anonymous = false) OR (auth.uid() = user_id) OR is_admin(auth.uid()))
);