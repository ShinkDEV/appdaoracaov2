-- Add admin role for Eduardo
INSERT INTO public.user_roles (user_id, role)
VALUES ('1c4fdf96-361b-4050-bfd9-7573fa5de952', 'admin')
ON CONFLICT DO NOTHING;