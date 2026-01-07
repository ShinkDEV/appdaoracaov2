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
        className="fixed bottom-32 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-float flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow active:scale-95 md:hidden"
        aria-label="Criar pedido de oração"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe md:hidden">
        <div className="relative mx-auto max-w-md">
          {/* Liquid glass container */}
          <div className="liquid-glass flex items-center justify-around px-2 py-3">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-500 ease-out min-w-[60px]",
                    active
                      ? "text-primary"
                      : "text-muted-foreground/70 hover:text-foreground"
                  )}
                >
                  {/* Active indicator blob */}
                  {active && (
                    <span className="absolute inset-0 bg-primary/10 rounded-2xl animate-scale-in" />
                  )}

                  {/* Icon with glow effect when active */}
                  <span className={cn(
                    "relative z-10 transition-all duration-300",
                    active && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  )}>
                    <item.icon
                      className={cn(
                        "h-6 w-6 transition-transform duration-300",
                        active && "scale-110"
                      )}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </span>

                  {/* Label */}
                  <span className={cn(
                    "relative z-10 text-[11px] font-medium transition-all duration-300",
                    active && "font-semibold"
                  )}>
                    {item.label}
                  </span>

                  {/* Active dot indicator */}
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-fade-in" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom glow effect */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary/20 blur-2xl rounded-full opacity-50 pointer-events-none" />
        </div>
      </nav>
    </>
  );
};
