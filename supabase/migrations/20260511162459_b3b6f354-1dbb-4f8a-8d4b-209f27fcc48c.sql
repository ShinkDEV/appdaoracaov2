
-- ============ FUNCTIONS (utility) ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text,
  photo_url text,
  verified boolean DEFAULT false,
  verified_at timestamptz,
  banned boolean DEFAULT false,
  banned_at timestamptz,
  ban_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role / is_admin / is_banned / is_monthly_supporter
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE((SELECT banned FROM public.profiles WHERE id = _user_id), false)
$$;

-- ============ PRAYER THEMES ============
CREATE TABLE public.prayer_themes (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text,
  display_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.prayer_themes ENABLE ROW LEVEL SECURITY;

-- ============ PRAYER REQUESTS ============
CREATE TABLE public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  theme_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  is_anonymous boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  short_code text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.generate_prayer_short_code()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM public.prayer_requests WHERE short_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  NEW.short_code := new_code;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prayer_short_code
BEFORE INSERT ON public.prayer_requests
FOR EACH ROW
WHEN (NEW.short_code IS NULL)
EXECUTE FUNCTION public.generate_prayer_short_code();

-- ============ USER PRAYERS ============
CREATE TABLE public.user_prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prayer_request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, prayer_request_id)
);
ALTER TABLE public.user_prayers ENABLE ROW LEVEL SECURITY;

-- ============ TESTIMONIES ============
CREATE TABLE public.testimonies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prayer_request_id uuid,
  title text NOT NULL,
  content text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  likes_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_testimonies_updated_at
BEFORE UPDATE ON public.testimonies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.testimony_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  testimony_id uuid NOT NULL REFERENCES public.testimonies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (testimony_id, user_id)
);
ALTER TABLE public.testimony_likes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_testimony_likes_count()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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

-- ============ BANNERS ============
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  mobile_image_url text,
  link text,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- ============ BANNED IPS ============
CREATE TABLE public.banned_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.banned_ips ENABLE ROW LEVEL SECURITY;

-- ============ SUBSCRIPTIONS ============
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mercadopago_subscription_id text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'active',
  payer_email text,
  next_payment_date timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_monthly_supporter(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions WHERE user_id = _user_id AND status = 'active'
  )
$$;

-- ============ IP TRACKING ============
CREATE TABLE public.user_ip_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ip_address text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_ip_tracking ENABLE ROW LEVEL SECURITY;

-- ============ VERIFICATION REQUESTS ============
CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  link text NOT NULL,
  requirement text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- ============ HANDLE NEW USER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ADMIN EMAILS RPC ============
CREATE OR REPLACE FUNCTION public.get_user_emails()
RETURNS TABLE(user_id uuid, email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, email::text FROM auth.users WHERE public.is_admin(auth.uid())
$$;

-- ============ PRAYER COUNTS RPC ============
CREATE OR REPLACE FUNCTION public.get_prayer_counts(prayer_ids uuid[])
RETURNS TABLE(prayer_request_id uuid, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT up.prayer_request_id, COUNT(*)::bigint
  FROM public.user_prayers up
  WHERE up.prayer_request_id = ANY(prayer_ids)
  GROUP BY up.prayer_request_id
$$;

-- ============ PUBLIC PRAYER REQUESTS RPC ============
CREATE OR REPLACE FUNCTION public.get_public_prayer_requests(
  p_theme_id text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0
)
RETURNS TABLE(
  id uuid, user_id uuid, theme_id text, title text, description text,
  is_anonymous boolean, is_pinned boolean, created_at timestamptz, short_code text,
  author_display_name text, author_photo_url text,
  author_verified boolean, author_is_supporter boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.id,
    CASE WHEN pr.is_anonymous THEN NULL ELSE pr.user_id END,
    pr.theme_id, pr.title, pr.description, pr.is_anonymous, pr.is_pinned, pr.created_at, pr.short_code,
    CASE WHEN pr.is_anonymous THEN NULL ELSE p.display_name END,
    CASE WHEN pr.is_anonymous THEN NULL ELSE p.photo_url END,
    CASE WHEN pr.is_anonymous THEN false ELSE COALESCE(p.verified, false) END,
    CASE WHEN pr.is_anonymous THEN false ELSE public.is_monthly_supporter(pr.user_id) END
  FROM public.prayer_requests pr
  LEFT JOIN public.profiles p ON pr.user_id = p.id
  WHERE (pr.is_deleted IS NOT TRUE)
    AND (p_theme_id IS NULL OR p_theme_id = 'all' OR pr.theme_id = p_theme_id)
    AND (p_search IS NULL OR pr.title ILIKE '%'||p_search||'%' OR pr.description ILIKE '%'||p_search||'%')
  ORDER BY pr.is_pinned DESC, pr.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- ============ PUBLIC TESTIMONIES RPC ============
CREATE OR REPLACE FUNCTION public.get_public_testimonies(p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE(
  id uuid, user_id uuid, prayer_request_id uuid, title text, content text,
  is_anonymous boolean, likes_count int, created_at timestamptz,
  author_display_name text, author_photo_url text,
  author_verified boolean, author_is_supporter boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    CASE WHEN t.is_anonymous THEN NULL ELSE t.user_id END,
    t.prayer_request_id, t.title, t.content, t.is_anonymous, t.likes_count, t.created_at,
    CASE WHEN t.is_anonymous THEN NULL ELSE p.display_name END,
    CASE WHEN t.is_anonymous THEN NULL ELSE p.photo_url END,
    CASE WHEN t.is_anonymous THEN false ELSE COALESCE(p.verified, false) END,
    CASE WHEN t.is_anonymous THEN false ELSE public.is_monthly_supporter(t.user_id) END
  FROM public.testimonies t
  LEFT JOIN public.profiles p ON p.id = t.user_id
  WHERE t.is_deleted IS NOT TRUE
  ORDER BY t.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Public can view basic profile info" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));

-- user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- prayer_themes
CREATE POLICY "Anyone can view themes" ON public.prayer_themes FOR SELECT USING (true);
CREATE POLICY "Admins manage themes" ON public.prayer_themes FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- prayer_requests
CREATE POLICY "View prayer requests" ON public.prayer_requests FOR SELECT USING (
  (is_deleted IS NOT TRUE) AND (
    is_anonymous IS NOT TRUE OR auth.uid() = user_id OR public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_prayers up WHERE up.prayer_request_id = prayer_requests.id AND up.user_id = auth.uid())
  )
);
CREATE POLICY "Users can create requests" ON public.prayer_requests FOR INSERT WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));
CREATE POLICY "Users can update own requests" ON public.prayer_requests FOR UPDATE USING (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));
CREATE POLICY "Admins can update any request" ON public.prayer_requests FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- user_prayers
CREATE POLICY "Users can view own prayers" ON public.user_prayers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all prayers" ON public.user_prayers FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can add own prayers" ON public.user_prayers FOR INSERT WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));
CREATE POLICY "Users can delete own prayers" ON public.user_prayers FOR DELETE USING (auth.uid() = user_id);

-- testimonies
CREATE POLICY "Anyone can view testimonies" ON public.testimonies FOR SELECT USING (is_deleted IS NOT TRUE);
CREATE POLICY "Users can create own testimonies" ON public.testimonies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));
CREATE POLICY "Users can update own testimonies" ON public.testimonies FOR UPDATE TO authenticated USING (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));
CREATE POLICY "Admins can update any testimony" ON public.testimonies FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can delete own testimonies" ON public.testimonies FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any testimony" ON public.testimonies FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- testimony_likes
CREATE POLICY "Users can view own likes" ON public.testimony_likes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all likes" ON public.testimony_likes FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can add own likes" ON public.testimony_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));
CREATE POLICY "Users can remove own likes" ON public.testimony_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- banners
CREATE POLICY "Anyone can view active banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- banned_ips
CREATE POLICY "Admins can manage banned IPs" ON public.banned_ips FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- user_ip_tracking
CREATE POLICY "Admins can view IP tracking" ON public.user_ip_tracking FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert IP tracking" ON public.user_ip_tracking FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update IP tracking" ON public.user_ip_tracking FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete IP tracking" ON public.user_ip_tracking FOR DELETE USING (public.is_admin(auth.uid()));

-- verification_requests
CREATE POLICY "Users can view own verification requests" ON public.verification_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all verification requests" ON public.verification_requests FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can create verification requests" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));
CREATE POLICY "Admins can update verification requests" ON public.verification_requests FOR UPDATE USING (public.is_admin(auth.uid()));

-- ============ STORAGE: avatars bucket ============
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
