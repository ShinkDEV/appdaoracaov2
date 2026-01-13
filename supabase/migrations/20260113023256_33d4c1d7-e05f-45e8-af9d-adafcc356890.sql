-- Create a separate admin-only table for IP tracking
CREATE TABLE public.user_ip_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    ip_address TEXT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_ip_tracking ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage IP tracking data
CREATE POLICY "Admins can view IP tracking" 
ON public.user_ip_tracking 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert IP tracking" 
ON public.user_ip_tracking 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update IP tracking" 
ON public.user_ip_tracking 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete IP tracking" 
ON public.user_ip_tracking 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Migrate existing IP data to the new table
INSERT INTO public.user_ip_tracking (user_id, ip_address, recorded_at)
SELECT id, last_ip, COALESCE(created_at, now())
FROM public.profiles
WHERE last_ip IS NOT NULL;

-- Drop the last_ip column from profiles table
ALTER TABLE public.profiles DROP COLUMN last_ip;