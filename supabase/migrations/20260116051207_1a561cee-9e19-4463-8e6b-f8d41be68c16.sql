-- Create a function to get user emails for admin use
CREATE OR REPLACE FUNCTION public.get_user_emails()
RETURNS TABLE (user_id uuid, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email::text
  FROM auth.users
  WHERE is_admin(auth.uid())
$$;