-- Add verified column to profiles
ALTER TABLE public.profiles 
ADD COLUMN verified boolean DEFAULT false;

-- Add verified_at timestamp
ALTER TABLE public.profiles 
ADD COLUMN verified_at timestamp with time zone;