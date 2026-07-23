import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { ONBOARDING_STORAGE_KEY } from '@/lib/constants';

export function OnboardingGate() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const alreadySeen = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (Capacitor.isNativePlatform() && !alreadySeen && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
    // Só verifica na inicialização do app, não a cada troca de rota.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
