-- Drop and recreate the function with short_code
DROP FUNCTION IF EXISTS public.get_public_prayer_requests(text, text, integer, integer);

CREATE FUNCTION public.get_public_prayer_requests(p_theme_id text DEFAULT NULL::text, p_search text DEFAULT NULL::text, p_limit integer DEFAULT 10, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, user_id uuid, theme_id text, title text, description text, is_anonymous boolean, is_pinned boolean, created_at timestamp with time zone, short_code text, author_display_name text, author_photo_url text, author_verified boolean, author_is_supporter boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    CASE WHEN pr.is_anonymous = true THEN NULL ELSE pr.user_id END as user_id,
    pr.theme_id,
    pr.title,
    pr.description,
    pr.is_anonymous,
    pr.is_pinned,
    pr.created_at,
    pr.short_code,
    CASE WHEN pr.is_anonymous = true THEN NULL ELSE p.display_name END as author_display_name,
    CASE WHEN pr.is_anonymous = true THEN NULL ELSE p.photo_url END as author_photo_url,
    CASE WHEN pr.is_anonymous = true THEN false ELSE COALESCE(p.verified, false) END as author_verified,
    CASE WHEN pr.is_anonymous = true THEN false ELSE is_monthly_supporter(pr.user_id) END as author_is_supporter
  FROM prayer_requests pr
  LEFT JOIN profiles p ON pr.user_id = p.id
  WHERE (pr.is_deleted = false OR pr.is_deleted IS NULL)
    AND (p_theme_id IS NULL OR p_theme_id = 'all' OR pr.theme_id = p_theme_id)
    AND (p_search IS NULL OR pr.title ILIKE '%' || p_search || '%' OR pr.description ILIKE '%' || p_search || '%')
  ORDER BY pr.is_pinned DESC, pr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;