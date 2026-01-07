-- Insert default prayer themes
INSERT INTO public.prayer_themes (id, name, icon, display_order)
VALUES 
  ('familia-relacionamentos', 'Família e Relacionamentos', '👨‍👩‍👧‍👦', 1),
  ('cura', 'Cura', '💚', 2),
  ('libertacao', 'Libertação', '🕊️', 3),
  ('trabalho-financas', 'Trabalho e Finanças', '💼', 4),
  ('igreja-lideranca', 'Igreja e Liderança', '⛪', 5),
  ('nacoes-autoridades', 'Nações e Autoridades', '🌍', 6),
  ('sabedoria-decisoes', 'Sabedoria e Decisões', '💡', 7),
  ('emocoes-sentimentos', 'Emoções e Sentimentos', '❤️', 8)
ON CONFLICT (id) DO NOTHING;