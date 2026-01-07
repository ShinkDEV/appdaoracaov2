import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, HandHeart, User, Settings, Plus, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import logoAppDaOracao from '@/assets/logo-app-da-oracao.png';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

export const Sidebar: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const mainNavItems: NavItem[] = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: HandHeart, label: 'Minhas Orações', path: '/minhas-oracoes' },
    { icon: User, label: 'Perfil', path: user ? '/perfil' : '/auth' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  const adminNavItems: NavItem[] = [
    { icon: Shield, label: 'Administração', path: '/admin', adminOnly: true },
  ];

  const handleNewPrayer = () => {
    if (user) {
      navigate('/novo-pedido');
    } else {
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderNavItem = (item: NavItem) => {
    if (item.requiresAuth && !user) return null;
    if (item.adminOnly && !isAdmin) return null;

    const active = isActive(item.path);
    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className={cn("h-5 w-5", active && "text-primary")} strokeWidth={active ? 2.5 : 2} />
        <span className="text-sm">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border/40 p-4">
      {/* Logo */}
      <div className="mb-6 px-2">
        <button onClick={() => navigate('/')} className="flex items-center">
          <img
            src={logoAppDaOracao}
            alt="App da Oração"
            className="h-10 w-auto object-contain"
          />
        </button>
      </div>

      {/* New Prayer Button */}
      <Button
        onClick={handleNewPrayer}
        className="w-full gap-2 rounded-xl mb-6 h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
      >
        <Plus className="h-5 w-5" />
        Novo Pedido
      </Button>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {mainNavItems.map(renderNavItem)}
        
        {isAdmin && (
          <>
            <Separator className="my-4" />
            {adminNavItems.map(renderNavItem)}
          </>
        )}
      </nav>

      {/* User Profile / Auth */}
      <div className="mt-auto pt-4 border-t border-border/40">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={profile?.photo_url || undefined} alt={profile?.display_name || 'Perfil'} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-sm">
                  {getInitials(profile?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.display_name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="w-full rounded-xl"
            >
              Entrar
            </Button>
            <Button
              onClick={() => navigate('/auth?modo=cadastro')}
              className="w-full rounded-xl"
            >
              Cadastrar
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};
