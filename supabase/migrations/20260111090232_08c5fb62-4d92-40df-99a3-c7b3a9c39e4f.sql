-- Allow admins to update any profile (for banning users)
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (is_admin(auth.uid()));