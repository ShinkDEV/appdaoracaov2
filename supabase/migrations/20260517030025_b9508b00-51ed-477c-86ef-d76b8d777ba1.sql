
-- Extensions for cron scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Main table
CREATE TABLE public.devotionals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NULL,
  title text NOT NULL,
  verse_text text NULL,
  verse_reference text NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  is_system boolean NOT NULL DEFAULT false,
  is_anonymous boolean NOT NULL DEFAULT false,
  featured_date date NULL UNIQUE,
  likes_count integer NOT NULL DEFAULT 0,
  reviewed_by uuid NULL,
  reviewed_at timestamptz NULL,
  admin_notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT devotionals_status_check CHECK (status IN ('pending','approved','rejected'))
);

CREATE INDEX idx_devotionals_status ON public.devotionals(status);
CREATE INDEX idx_devotionals_featured_date ON public.devotionals(featured_date);
CREATE INDEX idx_devotionals_user_id ON public.devotionals(user_id);

ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View approved or own devotionals"
  ON public.devotionals FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR is_system = true
    OR auth.uid() = user_id
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Authenticated users can submit"
  ON public.devotionals FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT public.is_banned(auth.uid())
    AND is_system = false
    AND status = 'pending'
    AND featured_date IS NULL
  );

CREATE POLICY "Users edit own pending"
  ON public.devotionals FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending' AND featured_date IS NULL);

CREATE POLICY "Users delete own pending"
  ON public.devotionals FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins manage all"
  ON public.devotionals FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_devotionals_updated_at
  BEFORE UPDATE ON public.devotionals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Likes
CREATE TABLE public.devotional_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devotional_id uuid NOT NULL REFERENCES public.devotionals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(devotional_id, user_id)
);

ALTER TABLE public.devotional_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own likes" ON public.devotional_likes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all likes" ON public.devotional_likes
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users add own likes" ON public.devotional_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));
CREATE POLICY "Users remove own likes" ON public.devotional_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_devotional_likes_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.devotionals SET likes_count = likes_count + 1 WHERE id = NEW.devotional_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.devotionals SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.devotional_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;

CREATE TRIGGER trg_devotional_likes_count
AFTER INSERT OR DELETE ON public.devotional_likes
FOR EACH ROW EXECUTE FUNCTION public.update_devotional_likes_count();

-- RPCs
CREATE OR REPLACE FUNCTION public.get_daily_devotional()
RETURNS TABLE (
  id uuid, title text, verse_text text, verse_reference text, content text,
  is_system boolean, is_anonymous boolean, featured_date date, likes_count integer,
  created_at timestamptz, author_display_name text, author_photo_url text,
  author_verified boolean, author_is_supporter boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.title, d.verse_text, d.verse_reference, d.content,
    d.is_system, d.is_anonymous, d.featured_date, d.likes_count, d.created_at,
    CASE WHEN d.is_anonymous OR d.is_system OR d.user_id IS NULL THEN NULL ELSE p.display_name END,
    CASE WHEN d.is_anonymous OR d.is_system OR d.user_id IS NULL THEN NULL ELSE p.photo_url END,
    CASE WHEN d.is_anonymous OR d.is_system OR d.user_id IS NULL THEN false ELSE COALESCE(p.verified,false) END,
    CASE WHEN d.is_anonymous OR d.is_system OR d.user_id IS NULL THEN false ELSE public.is_monthly_supporter(d.user_id) END
  FROM public.devotionals d
  LEFT JOIN public.profiles p ON p.id = d.user_id
  WHERE d.featured_date = (now() AT TIME ZONE 'America/Sao_Paulo')::date
  ORDER BY d.is_system DESC, d.created_at DESC
  LIMIT 1;
END; $$;

CREATE OR REPLACE FUNCTION public.get_approved_devotionals(p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS TABLE (
  id uuid, title text, verse_text text, verse_reference text, content text,
  is_system boolean, is_anonymous boolean, likes_count integer, created_at timestamptz,
  author_display_name text, author_photo_url text, author_verified boolean, author_is_supporter boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.title, d.verse_text, d.verse_reference, d.content,
    d.is_system, d.is_anonymous, d.likes_count, d.created_at,
    CASE WHEN d.is_anonymous OR d.is_system OR d.user_id IS NULL THEN NULL ELSE p.display_name END,
    CASE WHEN d.is_anonymous OR d.is_system OR d.user_id IS NULL THEN NULL ELSE p.photo_url END,
    CASE WHEN d.is_anonymous OR d.is_system OR d.user_id IS NULL THEN false ELSE COALESCE(p.verified,false) END,
    CASE WHEN d.is_anonymous OR d.is_system OR d.user_id IS NULL THEN false ELSE public.is_monthly_supporter(d.user_id) END
  FROM public.devotionals d
  LEFT JOIN public.profiles p ON p.id = d.user_id
  WHERE d.status = 'approved' OR d.is_system = true
  ORDER BY d.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END; $$;
