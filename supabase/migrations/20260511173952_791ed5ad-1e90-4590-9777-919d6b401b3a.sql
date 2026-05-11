
-- 1) Profile moderation table (admin-only)
CREATE TABLE public.profile_moderation (
  user_id uuid PRIMARY KEY,
  banned boolean NOT NULL DEFAULT false,
  banned_at timestamptz,
  ban_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.profile_moderation (user_id, banned, banned_at, ban_reason)
SELECT id, COALESCE(banned, false), banned_at, ban_reason
FROM public.profiles
WHERE banned IS TRUE OR ban_reason IS NOT NULL OR banned_at IS NOT NULL;

ALTER TABLE public.profile_moderation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage moderation"
  ON public.profile_moderation FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_profile_moderation_updated_at
  BEFORE UPDATE ON public.profile_moderation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Update is_banned to use new table
CREATE OR REPLACE FUNCTION public.is_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE((SELECT banned FROM public.profile_moderation WHERE user_id = _user_id), false)
$$;

-- 3) Drop ban columns from profiles
ALTER TABLE public.profiles
  DROP COLUMN banned,
  DROP COLUMN banned_at,
  DROP COLUMN ban_reason;

-- 4) Banners: only show active ones publicly
DROP POLICY IF EXISTS "Anyone can view active banners" ON public.banners;
CREATE POLICY "Anyone can view active banners"
  ON public.banners FOR SELECT
  USING (is_active = true);

-- 5) prayer_requests: hide anonymous author from people who prayed
DROP POLICY IF EXISTS "View prayer requests" ON public.prayer_requests;
CREATE POLICY "View prayer requests"
  ON public.prayer_requests FOR SELECT
  USING (
    is_deleted IS NOT TRUE
    AND (
      is_anonymous IS NOT TRUE
      OR auth.uid() = user_id
      OR public.is_admin(auth.uid())
    )
  );

-- 6) testimonies: hide anonymous author from public
DROP POLICY IF EXISTS "Anyone can view testimonies" ON public.testimonies;
CREATE POLICY "View testimonies"
  ON public.testimonies FOR SELECT
  USING (
    is_deleted IS NOT TRUE
    AND (
      is_anonymous = false
      OR auth.uid() = user_id
      OR public.is_admin(auth.uid())
    )
  );
