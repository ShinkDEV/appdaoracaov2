-- Fix user_prayers SELECT policy to only allow users to view their own prayers
-- This prevents users from seeing which other users are praying for which requests

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all prayers" ON public.user_prayers;

-- Create restricted policy: Users can only view their own prayer activity
CREATE POLICY "Users can view own prayers" 
ON public.user_prayers 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add admin policy to allow admins to view all prayers for moderation
CREATE POLICY "Admins can view all prayers" 
ON public.user_prayers 
FOR SELECT 
USING (is_admin(auth.uid()));