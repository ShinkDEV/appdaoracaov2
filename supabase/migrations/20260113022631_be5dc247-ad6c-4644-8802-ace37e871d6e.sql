-- Add a policy to allow viewing non-deleted prayer requests for public display
-- The public_prayer_requests view already masks user_id for anonymous requests
CREATE POLICY "Anyone can view non-deleted requests for public feed" 
ON public.prayer_requests 
FOR SELECT 
USING ((is_deleted = false OR is_deleted IS NULL));