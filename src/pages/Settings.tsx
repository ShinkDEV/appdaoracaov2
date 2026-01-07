import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Shield, LogOut, ChevronRight, Settings as SettingsIcon, Heart, Download, Sparkles, Instagram, Youtube } from 'lucide-react';
import { DonationModal } from '@/components/donation';

const Settings = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [donationOpen, setDonationOpen] = useState(false);

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

          {/* Donation Section - Enhanced */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Apoie o App</h2>
            <Card className="overflow-hidden border-none bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-purple-500/10 shadow-lg">
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="p-4 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25">
                      <Heart className="h-7 w-7 text-white fill-white" />
                    </div>
                    <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-500 animate-pulse" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                      Ajude a manter o App da Oração
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Sua contribuição mantém o app gratuito e ajuda milhares de pessoas a compartilharem suas orações.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => setDonationOpen(true)}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 gap-2 h-12 text-base font-semibold"
                  >
                    <Heart className="h-5 w-5 fill-white/30" />
                    Fazer uma Doação
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    ❤️ Obrigado por fazer parte desta comunidade
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media Section */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Siga-nos</h2>
            <Card className="overflow-hidden border-border/50 shadow-card">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 h-12"
                    asChild
                  >
                    <a href="https://instagram.com/appdaoracao" target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      <span className="text-sm font-medium">@appdaoracao</span>
                    </a>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 h-12"
                    asChild
                  >
                    <a href="https://www.youtube.com/@appdaoracao" target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium">YouTube</span>
                    </a>
                  </Button>
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

      <DonationModal open={donationOpen} onOpenChange={setDonationOpen} />
    </div>
  );
};

export default Settings;
