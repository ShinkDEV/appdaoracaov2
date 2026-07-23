import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRAYER_THEMES, ONBOARDING_STORAGE_KEY } from '@/lib/constants';
import { SEO } from '@/components/SEO';
import logoAppDaOracao from '@/assets/logo-app-da-oracao.png';

const TESTIMONIALS = [
  {
    name: 'Marina S.',
    text: 'Encontrei paz orando todos os dias com essa comunidade. Mudou minha rotina espiritual!',
  },
  {
    name: 'Carlos A.',
    text: 'Recebi orações de pessoas que nem conheço e minha vida realmente mudou. Só gratidão.',
  },
  {
    name: 'Beatriz L.',
    text: 'App lindo, simples de usar e muito acolhedor. Uso todos os dias com a minha família.',
  },
];

const TOTAL_STEPS = 3;

const StepLogo = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
    <img
      src={logoAppDaOracao}
      alt="App da Oração"
      className="w-48 sm:w-56 h-auto object-contain animate-scale-in"
    />
    <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground max-w-xs leading-snug animate-fade-in">
      O primeiro app brasileiro que conecta propósito e oração
    </h1>
  </div>
);

const StepThemes = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 overflow-y-auto py-4">
    <h2 className="font-display text-2xl font-bold text-center max-w-xs text-foreground">
      +8 temas para orar ou receber orações
    </h2>
    <div className="w-full max-w-sm grid grid-cols-2 gap-3">
      {PRAYER_THEMES.map((theme) => (
        <div
          key={theme.id}
          className="flex items-center gap-2 rounded-2xl bg-card border border-border/50 shadow-card px-3 py-3"
        >
          <span className="text-xl shrink-0">{theme.icon}</span>
          <span className="text-sm font-medium leading-tight text-foreground">{theme.name}</span>
        </div>
      ))}
    </div>
    <p className="text-muted-foreground text-sm font-medium">E mais...</p>
  </div>
);

const StepFreeAndTestimonials = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-5 overflow-y-auto py-4">
    <div className="flex items-center gap-2 rounded-full gradient-hero px-4 py-2 shadow-glow">
      <Gift className="h-4 w-4 text-white shrink-0" />
      <span className="text-sm font-semibold text-white">100% gratuito · Para sempre</span>
    </div>
    <div className="text-center space-y-1">
      <h2 className="font-display text-2xl font-bold max-w-xs mx-auto text-foreground">
        Junte-se a milhares de usuários felizes
      </h2>
      <p className="text-muted-foreground text-sm">Feito para orar ou receber orações.</p>
    </div>
    <div className="w-full max-w-sm space-y-3">
      {TESTIMONIALS.map((testimonial) => (
        <div
          key={testimonial.name}
          className="rounded-2xl bg-card border border-border/50 shadow-card p-4"
        >
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
            ))}
          </div>
          <p className="text-sm text-foreground/90 mb-2">"{testimonial.text}"</p>
          <p className="text-xs font-medium text-muted-foreground">{testimonial.name}</p>
        </div>
      ))}
    </div>
  </div>
);

const STEPS = [StepLogo, StepThemes, StepFreeAndTestimonials];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const handleContinue = () => {
    if (step === TOTAL_STEPS - 1) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      navigate('/auth', { replace: true });
      return;
    }
    setStep((current) => current + 1);
  };

  const CurrentStep = STEPS[step];

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[hsl(var(--celestial-light))] via-background to-background pt-safe pb-safe">
      <SEO
        title="Bem-vindo — App da Oração"
        description="O primeiro app que conecta propósito e oração do Brasil."
        path="/onboarding"
      />

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-2 shrink-0">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-primary' : 'w-1.5 bg-primary/20'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col"
          >
            <CurrentStep />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-8 pt-4 shrink-0">
        <Button
          size="lg"
          onClick={handleContinue}
          className="w-full h-12 text-base rounded-2xl shadow-elevated"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
