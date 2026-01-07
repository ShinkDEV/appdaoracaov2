import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Plus, Trash2, Globe, Search, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BannedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  created_at: string;
}

export function BannedIPs() {
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    ip_address: '',
    reason: '',
  });

  useEffect(() => {
    fetchBannedIPs();
  }, []);

  const fetchBannedIPs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('banned_ips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar IPs banidos');
      console.error(error);
    } else {
      setBannedIPs(data || []);
    }
    setLoading(false);
  };

  const addBannedIP = async () => {
    if (!formData.ip_address) {
      toast.error('Endereço IP é obrigatório');
      return;
    }

    // Validate IP format (basic validation)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(formData.ip_address)) {
      toast.error('Formato de IP inválido');
      return;
    }

    const { error } = await supabase
      .from('banned_ips')
      .insert({
        ip_address: formData.ip_address,
        reason: formData.reason || null,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('Este IP já está banido');
      } else {
        toast.error('Erro ao banir IP');
        console.error(error);
      }
    } else {
      toast.success('IP banido com sucesso');
      setDialogOpen(false);
      setFormData({ ip_address: '', reason: '' });
      fetchBannedIPs();
    }
  };

  const removeBan = async (ipId: string) => {
    const { error } = await supabase
      .from('banned_ips')
      .delete()
      .eq('id', ipId);

    if (error) {
      toast.error('Erro ao remover ban');
      console.error(error);
    } else {
      toast.success('Ban removido com sucesso');
      fetchBannedIPs();
    }
  };

  const filteredIPs = bannedIPs.filter(ip => 
    ip.ip_address.includes(searchQuery) ||
    ip.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/10">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{bannedIPs.length}</p>
            <p className="text-sm text-muted-foreground">IPs banidos</p>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>IPs Banidos</CardTitle>
            <CardDescription>Gerencie endereços IP bloqueados no sistema</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Banir IP</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Banir IP</DialogTitle>
                <DialogDescription>
                  Adicione um endereço IP à lista de bloqueio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="ip_address">Endereço IP *</Label>
                  <Input
                    id="ip_address"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    placeholder="192.168.1.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo (opcional)</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Motivo do ban"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={addBannedIP} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Banir IP
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por IP ou motivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {bannedIPs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum IP banido</p>
              <p className="text-sm">Clique em "Banir IP" para adicionar</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endereço IP</TableHead>
                    <TableHead className="hidden sm:table-cell">Motivo</TableHead>
                    <TableHead className="hidden md:table-cell">Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIPs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum IP encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIPs.map((ip) => (
                      <TableRow key={ip.id}>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">{ip.ip_address}</code>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {ip.reason || '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(ip.created_at), { addSuffix: true, locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1.5">
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Remover</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover ban</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover o ban do IP {ip.ip_address}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeBan(ip.id)}>
                                  Remover Ban
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
