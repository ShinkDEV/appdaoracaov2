-- Criação da tabela profiles (dados de perfil dos usuários)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  banned BOOLEAN DEFAULT false,
  banned_at TIMESTAMP WITH TIME ZONE,
  ban_reason TEXT,
  last_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- View pública para perfis (sem dados sensíveis)
CREATE VIEW public.public_profiles AS
SELECT id, display_name, photo_url FROM public.profiles WHERE banned = false OR banned IS NULL;

-- Tabela de roles de usuário
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Tabela de temas de oração
CREATE TABLE IF NOT EXISTS public.prayer_themes (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view themes" ON public.prayer_themes FOR SELECT USING (true);

-- Inserir temas padrão
INSERT INTO public.prayer_themes (id, name, icon, display_order) VALUES
  ('familia-relacionamentos', 'Família e Relacionamentos', '👨‍👩‍👧‍👦', 1),
  ('cura', 'Cura', '💚', 2),
  ('libertacao', 'Libertação', '🕊️', 3),
  ('trabalho-financas', 'Trabalho e Finanças', '💼', 4),
  ('igreja-lideranca', 'Igreja e Liderança', '⛪', 5),
  ('nacoes-autoridades', 'Nações e Autoridades', '🌍', 6),
  ('sabedoria-decisoes', 'Sabedoria e Decisões', '💡', 7),
  ('emocoes-sentimentos', 'Emoções e Sentimentos', '❤️', 8)
ON CONFLICT (id) DO NOTHING;

-- Tabela de pedidos de oração
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL REFERENCES public.prayer_themes(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-deleted requests" ON public.prayer_requests 
  FOR SELECT USING (is_deleted = false OR is_deleted IS NULL);
CREATE POLICY "Users can create requests" ON public.prayer_requests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON public.prayer_requests 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any request" ON public.prayer_requests 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Tabela de orações dos usuários
CREATE TABLE IF NOT EXISTS public.user_prayers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, prayer_request_id)
);

ALTER TABLE public.user_prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all prayers" ON public.user_prayers FOR SELECT USING (true);
CREATE POLICY "Users can add own prayers" ON public.user_prayers 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own prayers" ON public.user_prayers 
  FOR DELETE USING (auth.uid() = user_id);

-- Tabela de IPs banidos
CREATE TABLE IF NOT EXISTS public.banned_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.banned_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage banned IPs" ON public.banned_ips 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Tabela de banners
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners" ON public.banners 
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage banners" ON public.banners 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Trigger para criar perfil automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);