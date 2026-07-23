// Versão do app
export const APP_VERSION = '1.3.0';

// Chave usada para marcar que o onboarding do app nativo já foi concluído
export const ONBOARDING_STORAGE_KEY = 'onboarding_complete';

// Temas de oração - lista parametrizada
export const PRAYER_THEMES = [
  { id: 'familia-relacionamentos', name: 'Família e Relacionamentos', icon: '👨‍👩‍👧‍👦' },
  { id: 'cura', name: 'Cura', icon: '💚' },
  { id: 'libertacao', name: 'Libertação', icon: '🕊️' },
  { id: 'trabalho-financas', name: 'Trabalho e Finanças', icon: '💼' },
  { id: 'igreja-lideranca', name: 'Igreja e Liderança', icon: '⛪' },
  { id: 'nacoes-autoridades', name: 'Nações e Autoridades', icon: '🌍' },
  { id: 'sabedoria-decisoes', name: 'Sabedoria e Decisões', icon: '💡' },
  { id: 'emocoes-sentimentos', name: 'Emoções e Sentimentos', icon: '❤️' },
] as const;

export type PrayerThemeId = typeof PRAYER_THEMES[number]['id'];

export const getThemeName = (id: string): string => {
  const theme = PRAYER_THEMES.find(t => t.id === id);
  return theme?.name ?? id;
};

export const getThemeIcon = (id: string): string => {
  const theme = PRAYER_THEMES.find(t => t.id === id);
  return theme?.icon ?? '🙏';
};

// Configurações de validação
export const VALIDATION = {
  title: {
    min: 3,
    max: 80,
  },
  description: {
    min: 10,
    max: 1000,
  },
} as const;
