import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Shield, Plus } from 'lucide-react';
import logoAppDaOracao from '@/assets/logo-app-da-oracao.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Header: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logoAppDaOracao}
              alt="App da Oração"
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Button
                  onClick={() => navigate('/novo-pedido')}
                  className="gap-2 rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Novo Pedido
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative h-10 w-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background transition-all">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={profile?.photo_url || undefined} alt={profile?.display_name || 'Perfil'} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                          {getInitials(profile?.display_name)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl bg-popover border border-border shadow-lg">
                    <div className="px-3 py-3 border-b border-border/50">
                      <p className="text-sm font-semibold">{profile?.display_name || 'Usuário'}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    </div>
                    <div className="p-1">
                      <DropdownMenuItem onClick={() => navigate('/perfil')} className="cursor-pointer rounded-lg">
                        <User className="mr-2 h-4 w-4" />
                        Meu Perfil
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer rounded-lg">
                          <Shield className="mr-2 h-4 w-4" />
                          Administração
                        </DropdownMenuItem>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-1">
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer rounded-lg">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate('/auth')} className="rounded-full px-5">
                  Entrar
                </Button>
                <Button onClick={() => navigate('/auth?modo=cadastro')} className="rounded-full px-6 shadow-sm">
                  Cadastrar
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile - Logo only, nav is in BottomNav */}
          <div className="md:hidden" />
        </div>
      </div>
    </header>
  );
};
