import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { LoadingPage, LoadingSpinner } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useMyPrayers } from '@/hooks/useMyPrayers';
import { HandHeart, FileText, Plus, ArrowLeft, Trash2, Users, Clock, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const MyPrayers = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { 
    prayingFor, 
    myRequests, 
    themes,
    loadingPraying, 
    loadingRequests, 
    stopPraying, 
    deleteRequest 
  } = useMyPrayers();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return <LoadingPage />;
  }

  const getThemeName = (themeId: string) => {
    return themes.find(t => t.id === themeId)?.name || themeId;
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR });
  };

  const handleShare = (prayer: any) => {
    const code = prayer.short_code || prayer.id.slice(0, 6).toUpperCase();
    const message = `Peço sua oração por esse pedido no App da Oração 🙏🏻

"${prayer.title}"

Baixe o app e busque na caixinha por ${code}

👉 https://prayer-remix-hub.lovable.app`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const PrayerItem = ({ 
    prayer, 
    onAction, 
    actionLabel, 
    actionVariant = 'destructive',
    showAuthor = true 
  }: { 
    prayer: any; 
    onAction: () => void;
    actionLabel: string;
    actionVariant?: 'destructive' | 'outline';
    showAuthor?: boolean;
  }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium shrink-0">
              {getThemeName(prayer.theme_id)}
            </Badge>
            {prayer.short_code && (
              <span className="flex items-center gap-0.5 text-[10px] sm:text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                <Hash className="h-3 w-3" />
                {prayer.short_code}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(prayer.created_at)}
          </span>
        </div>
        
        <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1.5 sm:mb-2 line-clamp-2">{prayer.title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4">{prayer.description}</p>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {showAuthor && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                  <AvatarImage src={prayer.author?.photo_url || undefined} />
                  <AvatarFallback className="text-[10px] sm:text-xs bg-primary/10 text-primary">
                    {getInitials(prayer.author?.display_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {prayer.is_anonymous ? 'Anônimo' : prayer.author?.display_name || 'Usuário'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{prayer.prayer_count} orando</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleShare(prayer)}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors rounded-full dark:text-green-500 dark:hover:bg-green-950/30"
              title="Compartilhar no WhatsApp"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="h-4 w-4 fill-current"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant={actionVariant} 
                  size="sm" 
                  className="gap-1.5 text-xs h-8 flex-1 sm:flex-none sm:w-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{actionLabel}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base sm:text-lg">Confirmar ação</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs sm:text-sm">
                    {actionLabel === 'Excluir' 
                      ? 'Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.'
                      : 'Tem certeza que deseja parar de orar por este pedido?'
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onAction} className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-3 md:gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full shrink-0 h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Minhas Orações</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Acompanhe seus pedidos e orações</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="prayers" className="space-y-6 md:space-y-8">
        <div className="flex justify-center">
          <TabsList className="inline-flex w-auto bg-muted/50 rounded-full p-1 h-auto">
            <TabsTrigger value="prayers" className="rounded-full gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6">
              <HandHeart className="h-4 w-4" />
              <span>Orando</span>
              {prayingFor.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {prayingFor.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-full gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6">
              <FileText className="h-4 w-4" />
              <span>Meus Pedidos</span>
              {myRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {myRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="prayers" className="mt-6">
          {loadingPraying ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : prayingFor.length === 0 ? (
            <div className="flex justify-center py-12">
              <EmptyState
                icon={<HandHeart className="h-14 w-14 md:h-16 md:w-16" />}
                title="Nenhuma oração ainda"
                description="Você ainda não está orando por nenhum pedido. Explore os pedidos e comece a orar!"
                action={<Button onClick={() => navigate('/')} className="rounded-full px-6">Ver Pedidos</Button>}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {prayingFor.map(prayer => (
                <PrayerItem
                  key={prayer.id}
                  prayer={prayer}
                  onAction={() => stopPraying(prayer.id)}
                  actionLabel="Remover"
                  actionVariant="outline"
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {loadingRequests ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : myRequests.length === 0 ? (
            <div className="flex justify-center py-12">
              <EmptyState
                icon={<FileText className="h-14 w-14 md:h-16 md:w-16" />}
                title="Nenhum pedido ainda"
                description="Você ainda não criou nenhum pedido de oração."
                action={
                  <Button onClick={() => navigate('/novo-pedido')} className="rounded-full px-6 gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Pedido
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center sm:justify-end">
                <Button onClick={() => navigate('/novo-pedido')} className="rounded-full gap-2 px-6">
                  <Plus className="h-4 w-4" />
                  Novo Pedido
                </Button>
              </div>
              <div className="grid gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {myRequests.map(prayer => (
                  <PrayerItem
                    key={prayer.id}
                    prayer={prayer}
                    onAction={() => deleteRequest(prayer.id)}
                    actionLabel="Excluir"
                    showAuthor={false}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyPrayers;
