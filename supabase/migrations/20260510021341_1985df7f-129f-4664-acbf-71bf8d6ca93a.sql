
DROP POLICY IF EXISTS "View non-anonymous, own, or admin requests" ON public.prayer_requests;

CREATE POLICY "View prayer requests"
ON public.prayer_requests
FOR SELECT
USING (
  (is_deleted IS NOT TRUE)
  AND (
    is_anonymous IS NOT TRUE
    OR auth.uid() = user_id
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_prayers up
      WHERE up.prayer_request_id = prayer_requests.id
        AND up.user_id = auth.uid()
    )
  )
);
