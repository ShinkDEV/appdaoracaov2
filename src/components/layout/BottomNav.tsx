import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, HandHeart, User, Menu, Plus, BookOpen, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems: NavItem[] = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: HandHeart, label: 'Orações', path: '/minhas-oracoes' },
    { icon: BookOpen, label: 'Palavra', path: '/orando-a-palavra', disabled: true, comingSoon: true },
    { icon: User, label: 'Perfil', path: user ? '/perfil' : '/auth' },
    { icon: Menu, label: 'Mais', path: '/configuracoes' },
  ];

  const handleNewPrayer = () => {
    if (user) {
      navigate('/novo-pedido');
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleNewPrayer}
        className="fixed bottom-24 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Criar pedido de oração"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/30 pb-safe">
        <div className="flex items-center justify-around px-2 sm:px-4 md:px-8 py-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  if (item.disabled) {
                    toast.info('Em breve!', {
                      description: 'Esta funcionalidade estará disponível em breve.',
                    });
                    return;
                  }
                  navigate(item.path);
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-2.5 rounded-2xl transition-all duration-200 min-w-[56px] sm:min-w-[64px]",
                  item.disabled 
                    ? "opacity-50 cursor-not-allowed"
                    : active
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <item.icon
                    className={cn(
                      "h-5 w-5 sm:h-6 sm:w-6 transition-colors",
                      item.disabled 
                        ? "text-muted-foreground/60"
                        : active ? "text-primary" : "text-muted-foreground"
                    )}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                  {item.comingSoon && (
                    <Lock className="absolute -top-1 -right-1 h-2.5 w-2.5 text-muted-foreground" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] sm:text-xs font-medium transition-colors",
                  item.disabled
                    ? "text-muted-foreground/60"
                    : active ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>

                {/* Active dot indicator */}
                {active && !item.disabled && (
                  <span className="absolute -bottom-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
