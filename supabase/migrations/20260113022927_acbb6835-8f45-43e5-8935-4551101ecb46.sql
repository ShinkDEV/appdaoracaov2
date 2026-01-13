-- Remove the overly permissive policy that exposes user_id on raw table
-- Public access should go through public_prayer_requests view which masks user_id
DROP POLICY IF EXISTS "Anyone can view non-deleted requests for public feed" ON public.prayer_requests;

-- The view uses SECURITY INVOKER, so we need a way for it to access the underlying data
-- Create a security definer function to get public prayer data safely
CREATE OR REPLACE FUNCTION public.get_public_prayer_requests(
  p_theme_id text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  theme_id text,
  title text,
  description text,
  is_anonymous boolean,
  is_pinned boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pr.id,
    CASE WHEN pr.is_anonymous = true THEN NULL ELSE pr.user_id END as user_id,
    pr.theme_id,
    pr.title,
    pr.description,
    pr.is_anonymous,
    pr.is_pinned,
    pr.created_at
  FROM prayer_requests pr
  WHERE (pr.is_deleted = false OR pr.is_deleted IS NULL)
    AND (p_theme_id IS NULL OR p_theme_id = 'all' OR pr.theme_id = p_theme_id)
    AND (p_search IS NULL OR pr.title ILIKE '%' || p_search || '%' OR pr.description ILIKE '%' || p_search || '%')
  ORDER BY pr.is_pinned DESC, pr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset
$$;