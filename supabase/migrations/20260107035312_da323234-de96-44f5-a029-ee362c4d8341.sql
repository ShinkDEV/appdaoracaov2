-- Fix other policies that might have recursion issues
-- Update banned_ips policy
DROP POLICY IF EXISTS "Admins can manage banned IPs" ON public.banned_ips;
CREATE POLICY "Admins can manage banned IPs"
ON public.banned_ips
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update banners admin policy
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;
CREATE POLICY "Admins can manage banners"
ON public.banners
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update prayer_requests admin policy
DROP POLICY IF EXISTS "Admins can update any request" ON public.prayer_requests;
CREATE POLICY "Admins can update any request"
ON public.prayer_requests
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));