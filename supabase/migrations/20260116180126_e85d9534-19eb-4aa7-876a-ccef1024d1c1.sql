-- Add short_code column to prayer_requests
ALTER TABLE public.prayer_requests 
ADD COLUMN short_code text UNIQUE;

-- Create a function to generate short codes
CREATE OR REPLACE FUNCTION public.generate_prayer_short_code()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate short_code on insert
CREATE TRIGGER generate_prayer_short_code_trigger
BEFORE INSERT ON public.prayer_requests
FOR EACH ROW
WHEN (NEW.short_code IS NULL)
EXECUTE FUNCTION public.generate_prayer_short_code();

-- Generate codes for existing prayers that don't have one
DO $$
DECLARE
  prayer_record RECORD;
  new_code text;
  code_exists boolean;
BEGIN
  FOR prayer_record IN SELECT id FROM public.prayer_requests WHERE short_code IS NULL
  LOOP
    LOOP
      new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
      SELECT EXISTS(SELECT 1 FROM public.prayer_requests WHERE short_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    
    UPDATE public.prayer_requests SET short_code = new_code WHERE id = prayer_record.id;
  END LOOP;
END $$;