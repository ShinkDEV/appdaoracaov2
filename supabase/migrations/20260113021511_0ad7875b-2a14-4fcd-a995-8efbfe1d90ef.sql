-- Recreate the view with explicit SECURITY INVOKER to fix the security warning
DROP VIEW IF EXISTS public.public_prayer_requests;

CREATE VIEW public.public_prayer_requests 
WITH (security_invoker = on)
AS
SELECT 
  id,
  CASE WHEN is_anonymous = true THEN NULL ELSE user_id END as user_id,
  theme_id,
  title,
  description,
  is_anonymous,
  is_pinned,
  created_at
FROM prayer_requests
WHERE is_deleted = false OR is_deleted IS NULL;

-- Recreate grants
GRANT SELECT ON public.public_prayer_requests TO authenticated;
GRANT SELECT ON public.public_prayer_requests TO anon;