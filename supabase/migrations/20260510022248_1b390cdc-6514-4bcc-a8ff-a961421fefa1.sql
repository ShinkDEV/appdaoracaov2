-- Testimonies table
CREATE TABLE public.testimonies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prayer_request_id UUID REFERENCES public.prayer_requests(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view testimonies"
ON public.testimonies FOR SELECT
USING (is_deleted IS NOT TRUE);

CREATE POLICY "Users can create own testimonies"
ON public.testimonies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND NOT is_banned(auth.uid()));

CREATE POLICY "Users can update own testimonies"
ON public.testimonies FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND NOT is_banned(auth.uid()));

CREATE POLICY "Admins can update any testimony"
ON public.testimonies FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Users can delete own testimonies"
ON public.testimonies FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any testimony"
ON public.testimonies FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

CREATE INDEX idx_testimonies_created_at ON public.testimonies(created_at DESC);
CREATE INDEX idx_testimonies_user_id ON public.testimonies(user_id);

-- Likes table
CREATE TABLE public.testimony_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  testimony_id UUID NOT NULL REFERENCES public.testimonies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (testimony_id, user_id)
);

ALTER TABLE public.testimony_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own likes"
ON public.testimony_likes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all likes"
ON public.testimony_likes FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Users can add own likes"
ON public.testimony_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND NOT is_banned(auth.uid()));

CREATE POLICY "Users can remove own likes"
ON public.testimony_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger to keep likes_count in sync
CREATE OR REPLACE FUNCTION public.update_testimony_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.testimonies SET likes_count = likes_count + 1 WHERE id = NEW.testimony_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.testimonies SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.testimony_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_testimony_likes_count
AFTER INSERT OR DELETE ON public.testimony_likes
FOR EACH ROW EXECUTE FUNCTION public.update_testimony_likes_count();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_testimonies_updated_at
BEFORE UPDATE ON public.testimonies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public RPC to fetch testimonies with author info (anonymizing when needed)
CREATE OR REPLACE FUNCTION public.get_public_testimonies(
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  prayer_request_id uuid,
  title text,
  content text,
  is_anonymous boolean,
  likes_count integer,
  created_at timestamp with time zone,
  author_display_name text,
  author_photo_url text,
  author_verified boolean,
  author_is_supporter boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    CASE WHEN t.is_anonymous THEN NULL ELSE t.user_id END,
    t.prayer_request_id,
    t.title,
    t.content,
    t.is_anonymous,
    t.likes_count,
    t.created_at,
    CASE WHEN t.is_anonymous THEN NULL ELSE p.display_name END,
    CASE WHEN t.is_anonymous THEN NULL ELSE p.photo_url END,
    CASE WHEN t.is_anonymous THEN false ELSE COALESCE(p.verified, false) END,
    CASE WHEN t.is_anonymous THEN false ELSE is_monthly_supporter(t.user_id) END
  FROM public.testimonies t
  LEFT JOIN public.profiles p ON p.id = t.user_id
  WHERE t.is_deleted IS NOT TRUE
  ORDER BY t.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;