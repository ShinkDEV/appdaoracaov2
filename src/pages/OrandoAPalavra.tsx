import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Plus, Send, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useDevotionals } from '@/hooks/useDevotionals';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  title: z.string().trim().min(3, 'Mínimo 3 caracteres').max(80, 'Máximo 80 caracteres'),
  verse_reference: z.string().trim().max(60).optional(),
  verse_text: z.string().trim().max(400).optional(),
  content: z.string().trim().min(30, 'Mínimo 30 caracteres').max(2000, 'Máximo 2000 caracteres'),
});

const initials = (n?: string | null) =>
  n ? n.split(' ').map((x) => x[0]).join('').toUpperCase().slice(0, 2) : 'A';

export default function OrandoAPalavra() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { daily, list, loading, submit, refetch } = useDevotionals();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    verse_reference: '',
    verse_text: '',
    content: '',
    is_anonymous: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    setErrors({});
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        if (e.path[0]) fe[e.path[0].toString()] = e.message;
      });
      setErrors(fe);
      return;
    }
    setSubmitting(true);
    const ok = await submit(parsed.data as any);
    setSubmitting(false);
    if (ok) {
      setOpen(false);
      setForm({ title: '', verse_reference: '', verse_text: '', content: '', is_anonymous: false });
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Orando a Palavra
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Devocional do dia e palavras compartilhadas pela comunidade
          </p>
        </div>
      </div>

      {/* Devocional do dia */}
      {loading ? (
        <Card className="p-6 animate-pulse h-64 bg-muted/30" />
      ) : daily ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Devocional de hoje
                </Badge>
                {daily.is_system && (
                  <Badge variant="outline" className="text-xs">Palavra do Sistema</Badge>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">{daily.title}</h2>

              {daily.verse_text && (
                <blockquote className="border-l-4 border-primary/60 pl-4 italic text-foreground/90">
                  "{daily.verse_text}"
                  {daily.verse_reference && (
                    <footer className="text-sm font-semibold not-italic text-primary mt-2">
                      — {daily.verse_reference}
                    </footer>
                  )}
                </blockquote>
              )}

              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/85 leading-relaxed">
                {daily.content}
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <Card className="p-6 text-center text-muted-foreground">
          Ainda não há devocional para hoje. Volte em alguns instantes.
        </Card>
      )}

      {/* CTA enviar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg sm:text-xl font-bold">Palavras da comunidade</h3>
        <Dialog open={open} onOpenChange={(o) => {
          if (o && !user) { navigate('/auth'); return; }
          setOpen(o);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Enviar palavra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Compartilhar uma palavra</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="d-title">Título *</Label>
                <Input
                  id="d-title"
                  maxLength={80}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex.: A paz que excede todo entendimento"
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="d-ref">Referência</Label>
                  <Input
                    id="d-ref"
                    maxLength={60}
                    value={form.verse_reference}
                    onChange={(e) => setForm({ ...form, verse_reference: e.target.value })}
                    placeholder="Filipenses 4:7"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="d-vtext">Versículo</Label>
                  <Input
                    id="d-vtext"
                    maxLength={400}
                    value={form.verse_text}
                    onChange={(e) => setForm({ ...form, verse_text: e.target.value })}
                    placeholder="Texto do versículo (opcional)"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="d-content">Reflexão *</Label>
                <Textarea
                  id="d-content"
                  rows={8}
                  maxLength={2000}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Compartilhe a palavra que Deus colocou em seu coração..."
                />
                <p className="text-xs text-muted-foreground text-right">
                  {form.content.length}/2000
                </p>
                {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="d-anon" className="text-sm">Publicar anonimamente</Label>
                  <p className="text-xs text-muted-foreground">Seu nome não aparecerá</p>
                </div>
                <Switch
                  id="d-anon"
                  checked={form.is_anonymous}
                  onCheckedChange={(v) => setForm({ ...form, is_anonymous: v })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Sua palavra passará por moderação antes de ser publicada.
              </p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {loading ? (
          <>
            <Card className="h-32 animate-pulse bg-muted/30" />
            <Card className="h-32 animate-pulse bg-muted/30" />
          </>
        ) : list.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            Ainda não há palavras compartilhadas. Seja o primeiro!
          </Card>
        ) : (
          list
            .filter((d) => d.id !== daily?.id)
            .map((d) => (
              <Card key={d.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={d.author_photo_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {d.is_anonymous || d.is_system ? '✝' : initials(d.author_display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium">
                        {d.is_system
                          ? 'Sistema'
                          : d.is_anonymous
                          ? 'Anônimo'
                          : d.author_display_name || 'Usuário'}
                      </span>
                      {d.author_verified && <VerifiedBadge />}
                      {d.author_is_supporter && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          Apoiador
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-base mt-1">{d.title}</h3>
                    {d.verse_reference && (
                      <p className="text-xs text-primary font-medium mt-0.5">
                        {d.verse_reference}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-6">
                      {d.content}
                    </p>
                  </div>
                </div>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}
