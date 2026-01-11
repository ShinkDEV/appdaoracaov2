-- Fix security definer view issue by setting security invoker
ALTER VIEW public.public_profiles SET (security_invoker = on);