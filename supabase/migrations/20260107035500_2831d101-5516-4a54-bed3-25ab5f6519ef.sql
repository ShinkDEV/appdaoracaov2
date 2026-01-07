-- Fix the user_roles policies correctly to avoid recursion
-- The issue is that is_admin function checks user_roles, causing recursion

-- Drop and recreate the policies properly
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Simple approach: users can only view their own roles
-- Admin check is done through the security definer function from other tables
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);