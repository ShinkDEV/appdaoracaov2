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
import { HandHeart, FileText, Plus, ArrowLeft, Trash2, Users, Clock } from 'lucide-react';
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
          <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium shrink-0">
            {getThemeName(prayer.theme_id)}
          </Badge>
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant={actionVariant} 
                size="sm" 
                className="gap-1.5 text-xs h-8 w-full sm:w-auto"
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
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 max-w-6xl">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">Minhas Orações</h1>
            <p className="text-muted-foreground text-xs md:text-sm">Acompanhe seus pedidos e orações</p>
          </div>
        </div>

        <Tabs defaultValue="prayers" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full max-w-xs md:max-w-md grid-cols-2 bg-muted/50 rounded-full p-1 h-auto">
            <TabsTrigger value="prayers" className="rounded-full gap-1.5 md:gap-2 text-xs md:text-sm py-2.5 md:py-3 px-3 md:px-4">
              <HandHeart className="h-4 w-4" />
              <span>Orando</span>
              {prayingFor.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {prayingFor.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-full gap-1.5 md:gap-2 text-xs md:text-sm py-2.5 md:py-3 px-3 md:px-4">
              <FileText className="h-4 w-4" />
              <span>Meus Pedidos</span>
              {myRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {myRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prayers">
            {loadingPraying ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : prayingFor.length === 0 ? (
              <EmptyState
                icon={<HandHeart className="h-12 w-12 md:h-16 md:w-16" />}
                title="Nenhuma oração ainda"
                description="Você ainda não está orando por nenhum pedido. Explore os pedidos e comece a orar!"
                action={<Button onClick={() => navigate('/')} className="rounded-full px-6">Ver Pedidos</Button>}
              />
            ) : (
              <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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

          <TabsContent value="requests">
            {loadingRequests ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : myRequests.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-12 w-12 md:h-16 md:w-16" />}
                title="Nenhum pedido ainda"
                description="Você ainda não criou nenhum pedido de oração."
                action={
                  <Button onClick={() => navigate('/novo-pedido')} className="rounded-full px-6 gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Pedido
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => navigate('/novo-pedido')} className="rounded-full gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Pedido
                  </Button>
                </div>
                <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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
