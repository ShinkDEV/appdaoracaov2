import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
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
import { Search, Trash2, Pin, PinOff, BookOpen, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  theme_id: string;
  user_id: string;
  is_anonymous: boolean | null;
  is_pinned: boolean | null;
  is_deleted: boolean | null;
  created_at: string;
  author?: {
    display_name: string | null;
    email: string;
  };
}

interface Theme {
  id: string;
  name: string;
}

export function PrayerManagement() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [showDeleted]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch themes
    const { data: themesData } = await supabase
      .from('prayer_themes')
      .select('id, name');
    
    if (themesData) setThemes(themesData);

    // Fetch prayers with author info
    let query = supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!showDeleted) {
      query = query.or('is_deleted.eq.false,is_deleted.is.null');
    }

    const { data: prayersData, error } = await query;

    if (error) {
      toast.error('Erro ao carregar pedidos');
      console.error(error);
    } else if (prayersData) {
      // Fetch author profiles
      const userIds = [...new Set(prayersData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds);

      const prayersWithAuthors = prayersData.map(prayer => ({
        ...prayer,
        author: profiles?.find(p => p.id === prayer.user_id)
      }));

      setPrayers(prayersWithAuthors);
    }
    
    setLoading(false);
  };

  const togglePin = async (prayer: PrayerRequest) => {
    const { error } = await supabase
      .from('prayer_requests')
      .update({ is_pinned: !prayer.is_pinned })
      .eq('id', prayer.id);

    if (error) {
      toast.error('Erro ao atualizar pedido');
    } else {
      toast.success(prayer.is_pinned ? 'Pedido desafixado' : 'Pedido fixado');
      fetchData();
    }
  };

  const softDelete = async (prayerId: string) => {
    const { error } = await supabase
      .from('prayer_requests')
      .update({ 
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', prayerId);

    if (error) {
      toast.error('Erro ao excluir pedido');
    } else {
      toast.success('Pedido excluído com sucesso');
      fetchData();
    }
  };

  const restore = async (prayerId: string) => {
    const { error } = await supabase
      .from('prayer_requests')
      .update({ 
        is_deleted: false,
        deleted_at: null
      })
      .eq('id', prayerId);

    if (error) {
      toast.error('Erro ao restaurar pedido');
    } else {
      toast.success('Pedido restaurado com sucesso');
      fetchData();
    }
  };

  const getThemeName = (themeId: string) => {
    return themes.find(t => t.id === themeId)?.name || themeId;
  };

  const filteredPrayers = prayers.filter(prayer => 
    prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prayer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prayer.author?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prayer.author?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedCount = prayers.filter(p => p.is_pinned && !p.is_deleted).length;
  const deletedCount = prayers.filter(p => p.is_deleted).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{prayers.filter(p => !p.is_deleted).length}</p>
              <p className="text-sm text-muted-foreground">Pedidos ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <Pin className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pinnedCount}</p>
              <p className="text-sm text-muted-foreground">Pedidos fixados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-muted">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{deletedCount}</p>
              <p className="text-sm text-muted-foreground">Pedidos excluídos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Pedidos</CardTitle>
          <CardDescription>Visualize, fixe ou exclua pedidos de oração</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={showDeleted}
                onCheckedChange={setShowDeleted}
                id="show-deleted"
              />
              <label htmlFor="show-deleted" className="text-sm text-muted-foreground cursor-pointer">
                Mostrar excluídos
              </label>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead className="hidden md:table-cell">Autor</TableHead>
                  <TableHead className="hidden lg:table-cell">Tema</TableHead>
                  <TableHead className="hidden sm:table-cell">Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum pedido encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrayers.map((prayer) => (
                    <TableRow key={prayer.id} className={prayer.is_deleted ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm line-clamp-1">{prayer.title}</p>
                            {prayer.is_pinned && (
                              <Pin className="h-3 w-3 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{prayer.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          {prayer.is_anonymous ? (
                            <span className="text-muted-foreground italic">Anônimo</span>
                          ) : (
                            <span>{prayer.author?.display_name || prayer.author?.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {getThemeName(prayer.theme_id)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(prayer.created_at), { addSuffix: true, locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {prayer.is_deleted ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => restore(prayer.id)}
                              className="gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Restaurar</span>
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePin(prayer)}
                                className="gap-1.5"
                              >
                                {prayer.is_pinned ? (
                                  <PinOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Pin className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir pedido</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir este pedido? O pedido será marcado como excluído e não aparecerá mais para os usuários.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => softDelete(prayer.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
