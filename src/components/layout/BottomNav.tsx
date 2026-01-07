import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, HandHeart, User, Menu, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems: NavItem[] = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: HandHeart, label: 'Orações', path: '/minhas-oracoes' },
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
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-4 sm:px-6 py-2.5 rounded-2xl transition-all duration-200 min-w-[64px] sm:min-w-[80px]",
                  active
                    ? "bg-primary/10"
                    : "hover:bg-muted/50"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={active ? 2.5 : 1.5}
                />
                <span className={cn(
                  "text-[10px] sm:text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>

                {/* Active dot indicator */}
                {active && (
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
