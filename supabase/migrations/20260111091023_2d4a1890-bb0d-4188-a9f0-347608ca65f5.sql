-- Drop and recreate public_profiles view to include verified field
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  photo_url,
  verified
FROM public.profiles;