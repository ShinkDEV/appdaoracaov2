
CREATE TABLE public.advertise_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.advertise_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit advertise contact"
ON public.advertise_contacts FOR INSERT
TO public
WITH CHECK (
  length(name) BETWEEN 1 AND 120
  AND length(email) BETWEEN 3 AND 255
  AND length(message) BETWEEN 1 AND 2000
);

CREATE POLICY "Admins manage advertise contacts"
ON public.advertise_contacts FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER update_advertise_contacts_updated_at
BEFORE UPDATE ON public.advertise_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
