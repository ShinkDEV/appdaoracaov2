-- Create a public view for prayer requests that hides user_id for anonymous requests
CREATE OR REPLACE VIEW public.public_prayer_requests AS
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

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_prayer_requests TO authenticated;
GRANT SELECT ON public.public_prayer_requests TO anon;

-- Update the prayer_requests table RLS policies
-- Remove the overly permissive "Anyone can view non-deleted requests" policy
DROP POLICY IF EXISTS "Anyone can view non-deleted requests" ON public.prayer_requests;

-- Create new policies that restrict direct table access

-- Users can view their own requests (including deleted ones for "my prayers" page)
CREATE POLICY "Users can view own requests" 
ON public.prayer_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" 
ON public.prayer_requests 
FOR SELECT 
USING (is_admin(auth.uid()));