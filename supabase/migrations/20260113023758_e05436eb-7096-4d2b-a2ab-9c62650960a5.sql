-- Remove email column from profiles table (email is already in auth.users)
-- First update the handle_new_user function to not include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$function$;

-- Update the public_profiles view to not include email
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  photo_url,
  verified
FROM public.profiles
WHERE banned = false OR banned IS NULL;

-- Drop the email column from profiles
ALTER TABLE public.profiles DROP COLUMN email;