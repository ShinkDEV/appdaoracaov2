-- Fix function search path for generate_prayer_short_code
CREATE OR REPLACE FUNCTION public.generate_prayer_short_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a 6 character alphanumeric code (uppercase letters + numbers)
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.prayer_requests WHERE short_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.short_code := new_code;
  RETURN NEW;
END;
$$;