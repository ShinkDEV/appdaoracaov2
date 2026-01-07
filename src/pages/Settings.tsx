import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, User, Shield, LogOut, ChevronRight, Settings as SettingsIcon, Heart, Download } from 'lucide-react';

const Settings = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground text-sm">Gerencie sua conta e preferências</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Install App - visible to everyone */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">App</h2>
            <Card className="overflow-hidden border-border/50 shadow-card">
              <CardContent className="p-0">
                <button onClick={() => navigate('/instalar')} className="w-full flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Download className="h-5 w-5" /></div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">Instalar App</p>
                    <p className="text-sm text-muted-foreground">Adicionar à tela inicial</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Admin section */}
          {isAdmin && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Administração</h2>
              <Card className="overflow-hidden border-border/50 shadow-card">
                <CardContent className="p-0">
                  <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Shield className="h-5 w-5" /></div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">Painel Administrativo</p>
                      <p className="text-sm text-muted-foreground">Gerenciar usuários e pedidos</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                  </button>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Apoie o App</h2>
            <Card className="overflow-hidden border-border/50 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500/20 to-red-500/20 text-pink-600"><Heart className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <p className="font-medium text-pink-600">Fazer uma Doação</p>
                    <p className="text-sm text-muted-foreground">Ajude a manter o app funcionando</p>
                  </div>
                  <Heart className="h-5 w-5 text-pink-500 fill-pink-500/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {user && (
            <Card className="overflow-hidden border-border/50 shadow-card">
              <CardContent className="p-0">
                <button onClick={handleSignOut} className="w-full flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50">
                  <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive"><LogOut className="h-5 w-5" /></div>
                  <p className="font-medium text-destructive">Sair da conta</p>
                </button>
              </CardContent>
            </Card>
          )}
        </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground">App da Oração v1.1.0</p>
      </div>
    </div>
  );
};

export default Settings;
