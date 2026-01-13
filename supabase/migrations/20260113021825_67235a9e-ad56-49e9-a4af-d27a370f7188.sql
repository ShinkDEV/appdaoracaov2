-- Create a secure function to get prayer counts without exposing who prayed
-- This allows displaying count without revealing individual prayer activity
CREATE OR REPLACE FUNCTION public.get_prayer_counts(prayer_ids uuid[])
RETURNS TABLE(prayer_request_id uuid, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    up.prayer_request_id,
    COUNT(*)::bigint as count
  FROM user_prayers up
  WHERE up.prayer_request_id = ANY(prayer_ids)
  GROUP BY up.prayer_request_id
$$;