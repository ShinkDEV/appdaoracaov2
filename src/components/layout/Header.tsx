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
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/30 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={logoAppDaOracao}
              alt="App da Oração"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/novo-pedido')}
                  className="gap-2 rounded-full px-5"
                >
                  <Plus className="h-4 w-4" />
                  Novo Pedido
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                        <AvatarImage src={profile?.photo_url || undefined} alt={profile?.display_name || 'Perfil'} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                          {getInitials(profile?.display_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-elevated">
                    <div className="px-3 py-2.5 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
                      <p className="text-sm font-semibold">{profile?.display_name || 'Usuário'}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/perfil')} className="rounded-lg mx-1 cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-lg mx-1 cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Administração
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive rounded-lg mx-1 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/auth')} className="rounded-full">
                  Entrar
                </Button>
                <Button variant="default" onClick={() => navigate('/auth?modo=cadastro')} className="rounded-full px-5">
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
