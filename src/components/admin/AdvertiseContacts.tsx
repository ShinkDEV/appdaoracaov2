import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import { Mail, Phone, Building2, Trash2, Megaphone } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  new: { label: 'Novo', variant: 'default' },
  in_progress: { label: 'Em contato', variant: 'secondary' },
  done: { label: 'Concluído', variant: 'outline' },
  archived: { label: 'Arquivado', variant: 'destructive' },
};

export const AdvertiseContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('advertise_contacts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Erro ao carregar contatos');
    setContacts((data as Contact[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('advertise_contacts').update({ status }).eq('id', id);
    if (error) return toast.error('Erro ao atualizar');
    setContacts((c) => c.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const updateNotes = async (id: string, admin_notes: string) => {
    const { error } = await supabase.from('advertise_contacts').update({ admin_notes }).eq('id', id);
    if (error) return toast.error('Erro ao salvar nota');
    toast.success('Nota salva');
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este contato?')) return;
    const { error } = await supabase.from('advertise_contacts').delete().eq('id', id);
    if (error) return toast.error('Erro ao excluir');
    setContacts((c) => c.filter((x) => x.id !== id));
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Contatos de Anunciantes ({contacts.length})</h2>
      </div>

      {contacts.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhum contato recebido ainda.</CardContent></Card>
      ) : (
        contacts.map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge variant={STATUS_LABEL[c.status]?.variant || 'default'}>
                  {STATUS_LABEL[c.status]?.label || c.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {c.email}
                </a>
                {c.phone && (
                  <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-primary hover:underline">
                    <Phone className="h-3.5 w-3.5" /> {c.phone}
                  </a>
                )}
                {c.company && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" /> {c.company}
                  </span>
                )}
              </div>
              <div className="p-3 rounded-md bg-muted/50 whitespace-pre-wrap">{c.message}</div>

              <div className="grid sm:grid-cols-[200px_1fr] gap-3 pt-2">
                <Select value={c.status} onValueChange={(v) => updateStatus(c.id, v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="in_progress">Em contato</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Notas internas..."
                  defaultValue={c.admin_notes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (c.admin_notes || '')) updateNotes(c.id, e.target.value);
                  }}
                  rows={2}
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" variant="ghost" onClick={() => remove(c.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
