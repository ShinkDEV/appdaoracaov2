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
        className="fixed bottom-28 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 md:hidden"
        aria-label="Criar pedido de oração"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/30 pb-safe md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[64px]",
                  active
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={cn(
                  "text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>

                {/* Active dot indicator */}
                {active && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
