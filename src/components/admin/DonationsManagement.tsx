import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Heart,
  Search,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Subscription {
  id: string;
  user_id: string;
  mercadopago_subscription_id: string;
  status: string;
  amount: number;
  payer_email: string | null;
  next_payment_date: string | null;
  created_at: string;
  cancelled_at: string | null;
  profile?: {
    display_name: string | null;
    photo_url: string | null;
  };
}

export function DonationsManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Fetch profiles for user_ids
      const userIds = [...new Set(subsData?.map(s => s.user_id) || [])];
      
      let profilesMap: Record<string, { display_name: string | null; photo_url: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, photo_url')
          .in('id', userIds);
        
        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.id] = { display_name: p.display_name, photo_url: p.photo_url };
            return acc;
          }, {} as Record<string, { display_name: string | null; photo_url: string | null }>);
        }
      }

      // Combine subscriptions with profiles
      const subscriptionsWithProfiles = (subsData || []).map(sub => ({
        ...sub,
        profile: profilesMap[sub.user_id] || undefined
      })) as Subscription[];

      setSubscriptions(subscriptionsWithProfiles);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800">
            Pausado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      (sub.payer_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (sub.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      sub.mercadopago_subscription_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && sub.status === 'active') ||
      (filter === 'cancelled' && sub.status === 'cancelled');
    
    return matchesSearch && matchesFilter;
  });

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const totalMonthlyRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + (s.amount || 0), 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/50">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Apoiadores Ativos</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Mensal</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMonthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50">
                <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Assinaturas</p>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-pink-500" />
              <CardTitle className="text-lg">Doações e Assinaturas</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por e-mail, nome ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'active' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('active')}
              >
                Ativos
              </Button>
              <Button 
                variant={filter === 'cancelled' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('cancelled')}
              >
                Cancelados
              </Button>
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todos
              </Button>
            </div>
          </div>

          {/* Table */}
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Nenhuma assinatura encontrada</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apoiador</TableHead>
                    <TableHead className="hidden md:table-cell">E-mail</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.profile?.display_name || 'Usuário'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {subscription.payer_email || '-'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(subscription.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {format(new Date(subscription.created_at), "dd/MM/yy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSubscription(subscription)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Detalhes da Assinatura
            </DialogTitle>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Apoiador</Label>
                  <p className="font-medium">{selectedSubscription.profile?.display_name || 'Usuário'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">E-mail</Label>
                  <p className="font-medium">{selectedSubscription.payer_email || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Valor Mensal</Label>
                  <p className="font-medium text-lg text-green-600 dark:text-green-400">
                    {formatCurrency(selectedSubscription.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">ID MercadoPago</Label>
                <p className="text-sm font-mono bg-muted/50 p-2 rounded break-all">
                  {selectedSubscription.mercadopago_subscription_id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Início
                  </Label>
                  <p className="text-sm">
                    {format(new Date(selectedSubscription.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                {selectedSubscription.next_payment_date && (
                  <div>
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Próximo Pagamento
                    </Label>
                    <p className="text-sm">
                      {format(new Date(selectedSubscription.next_payment_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>

              {selectedSubscription.cancelled_at && (
                <div>
                  <Label className="text-muted-foreground text-xs">Cancelado em</Label>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {format(new Date(selectedSubscription.cancelled_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground text-xs">ID do Usuário</Label>
                <p className="text-xs font-mono bg-muted/50 p-2 rounded break-all">
                  {selectedSubscription.user_id}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
