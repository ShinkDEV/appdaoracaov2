-- Corrigir issue 1: Security Definer View - Remover view e criar com SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = on)
AS SELECT id, display_name, photo_url FROM public.profiles WHERE banned = false OR banned IS NULL;

-- Corrigir issue 2: Function search_path - Atualizar função para incluir search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;