import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Search, Ban, CheckCircle, Users, UserX, UserCheck, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Profile {
  id: string;
  display_name: string | null;
  photo_url: string | null;
  banned: boolean | null;
  ban_reason: string | null;
  banned_at: string | null;
  verified: boolean | null;
  verified_at: string | null;
  created_at: string;
}

export function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar usuários');
      console.error(error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const toggleBan = async (profile: Profile, reason?: string) => {
    const newBanStatus = !profile.banned;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        banned: newBanStatus,
        ban_reason: newBanStatus ? reason : null,
        banned_at: newBanStatus ? new Date().toISOString() : null,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Erro ao atualizar status do usuário');
      console.error(error);
    } else {
      toast.success(newBanStatus ? 'Usuário banido com sucesso' : 'Ban removido com sucesso');
      fetchProfiles();
    }
    setBanReason('');
  };

  const toggleVerify = async (profile: Profile) => {
    const newVerifyStatus = !profile.verified;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        verified: newVerifyStatus,
        verified_at: newVerifyStatus ? new Date().toISOString() : null,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Erro ao atualizar verificação');
      console.error(error);
    } else {
      toast.success(newVerifyStatus ? 'Usuário verificado!' : 'Verificação removida');
      fetchProfiles();
    }
  };

  const getInitials = (name: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'US';
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bannedCount = profiles.filter(p => p.banned).length;
  const activeCount = profiles.length - bannedCount;
  const verifiedCount = profiles.filter(p => p.verified).length;

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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profiles.length}</p>
              <p className="text-sm text-muted-foreground">Total de usuários</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Usuários ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <BadgeCheck className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{verifiedCount}</p>
              <p className="text-sm text-muted-foreground">Verificados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <UserX className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bannedCount}</p>
              <p className="text-sm text-muted-foreground">Banidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Visualize e gerencie todos os usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="hidden md:table-cell">Cadastro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.photo_url || undefined} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(profile.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-sm">{profile.display_name || 'Sem nome'}</p>
                              {profile.verified && (
                                <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{profile.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {profile.banned ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Banido
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/20">
                            <CheckCircle className="h-3 w-3" />
                            Ativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Verify Button */}
                          <Button
                            variant={profile.verified ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => toggleVerify(profile)}
                            className={profile.verified ? "gap-1.5 bg-primary/10 text-primary hover:bg-primary/20" : "gap-1.5"}
                          >
                            <BadgeCheck className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{profile.verified ? 'Verificado' : 'Verificar'}</span>
                          </Button>
                          
                          {/* Ban/Unban Button */}
                          {profile.banned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleBan(profile)}
                              className="gap-1.5"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Desbanir</span>
                            </Button>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="gap-1.5">
                                  <Ban className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Banir</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Banir usuário</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja banir {profile.display_name || 'este usuário'}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <Input
                                    placeholder="Motivo do ban (opcional)"
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setBanReason('')}>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => toggleBan(profile, banReason)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Confirmar Ban
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
