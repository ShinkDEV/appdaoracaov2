import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  BadgeCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Search,
  Loader2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VerificationRequest {
  id: string;
  user_id: string;
  name: string;
  email: string;
  requirement: '10k_followers' | '50k_views' | '100k_influencer';
  link: string;
  status: 'pending' | 'approved' | 'denied';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export function VerificationRequests() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('pending');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data as VerificationRequest[]) || []);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const getRequirementLabel = (req: string) => {
    switch (req) {
      case '10k_followers':
        return '10K+ seguidores + post';
      case '50k_views':
        return 'Post com 50K+ views';
      case '100k_influencer':
        return 'Influenciador 100K+';
      default:
        return req;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Negado
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleAction = async (action: 'approve' | 'deny') => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update the verification request
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'denied',
          admin_notes: adminNotes || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      // If approved, update the user's profile to verified
      if (action === 'approve') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq('id', selectedRequest.user_id);

        if (profileError) throw profileError;
      }

      toast.success(
        action === 'approve' 
          ? 'Usuário verificado com sucesso!' 
          : 'Solicitação negada'
      );
      
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || req.status === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

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
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Solicitações de Verificação</CardTitle>
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'pending' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pendentes
              </Button>
              <Button 
                variant={filter === 'approved' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('approved')}
              >
                Aprovados
              </Button>
              <Button 
                variant={filter === 'denied' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('denied')}
              >
                Negados
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
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BadgeCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">E-mail</TableHead>
                    <TableHead>Requisito</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {request.email}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {getRequirementLabel(request.requirement)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {format(new Date(request.created_at), "dd/MM/yy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminNotes(request.admin_notes || '');
                          }}
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
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-blue-500" />
              Detalhes da Solicitação
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Nome</Label>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">E-mail</Label>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Requisito</Label>
                <p className="font-medium">{getRequirementLabel(selectedRequest.requirement)}</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Link fornecido</Label>
                <a 
                  href={selectedRequest.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline break-all"
                >
                  {selectedRequest.link}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Status atual</Label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Solicitado em</Label>
                <p className="text-sm">
                  {format(new Date(selectedRequest.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Notas do administrador (opcional)</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Adicione observações sobre a decisão..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {selectedRequest.admin_notes && selectedRequest.status !== 'pending' && (
                <div>
                  <Label className="text-muted-foreground text-xs">Notas do administrador</Label>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg mt-1">{selectedRequest.admin_notes}</p>
                </div>
              )}

              {selectedRequest.reviewed_at && (
                <div>
                  <Label className="text-muted-foreground text-xs">Revisado em</Label>
                  <p className="text-sm">
                    {format(new Date(selectedRequest.reviewed_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedRequest?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('deny')}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Negar
                </Button>
                <Button
                  onClick={() => handleAction('approve')}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Aprovar e Verificar
                </Button>
              </>
            )}
            {selectedRequest?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}