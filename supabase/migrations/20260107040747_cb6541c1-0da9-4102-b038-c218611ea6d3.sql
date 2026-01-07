-- Remove foreign key constraint on prayer_requests to allow example data
ALTER TABLE public.prayer_requests DROP CONSTRAINT IF EXISTS prayer_requests_user_id_fkey;

-- Insert example prayer requests for each theme
INSERT INTO public.prayer_requests (user_id, theme_id, title, description, is_anonymous, is_pinned)
VALUES
  -- Família e Relacionamentos
  (
    '00000000-0000-0000-0000-000000000001',
    'familia-relacionamentos',
    'Restauração do meu casamento',
    'Peço orações pela restauração do meu casamento. Estamos passando por um momento difícil e precisamos da graça de Deus para superar os desafios e fortalecer nosso amor.',
    false,
    false
  ),
  -- Cura
  (
    '00000000-0000-0000-0000-000000000001',
    'cura',
    'Cura para minha mãe',
    'Minha mãe está enfrentando uma doença grave. Peço orações para que Deus toque no corpo dela e traga cura completa. Cremos no poder da oração!',
    false,
    true
  ),
  -- Libertação
  (
    '00000000-0000-0000-0000-000000000001',
    'libertacao',
    'Libertação de vícios',
    'Peço orações por libertação de vícios que têm me aprisionado. Quero ser livre para viver a vida plena que Deus tem para mim.',
    true,
    false
  ),
  -- Trabalho e Finanças
  (
    '00000000-0000-0000-0000-000000000001',
    'trabalho-financas',
    'Porta de emprego',
    'Estou desempregado há meses e preciso de uma oportunidade. Peço orações para que Deus abra portas e me dê sabedoria nas entrevistas.',
    false,
    false
  ),
  -- Igreja e Liderança
  (
    '00000000-0000-0000-0000-000000000001',
    'igreja-lideranca',
    'Unidade na liderança da igreja',
    'Peço orações pela liderança da nossa igreja, para que haja unidade, sabedoria e discernimento em todas as decisões.',
    false,
    false
  ),
  -- Nações e Autoridades
  (
    '00000000-0000-0000-0000-000000000001',
    'nacoes-autoridades',
    'Paz para nosso país',
    'Oremos pela paz em nossa nação, pelos governantes e autoridades, para que tomem decisões sábias e justas.',
    false,
    false
  ),
  -- Sabedoria e Decisões
  (
    '00000000-0000-0000-0000-000000000001',
    'sabedoria-decisoes',
    'Direção para o futuro',
    'Estou em um momento de decisão importante sobre minha carreira. Peço orações por sabedoria e direção divina para fazer a escolha certa.',
    false,
    false
  ),
  -- Emoções e Sentimentos
  (
    '00000000-0000-0000-0000-000000000001',
    'emocoes-sentimentos',
    'Paz e cura emocional',
    'Tenho lutado contra ansiedade e tristeza. Peço orações para que Deus traga paz ao meu coração e cure minhas emoções.',
    true,
    false
  );