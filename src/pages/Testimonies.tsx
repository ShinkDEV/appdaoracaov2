import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Heart, Plus, Trash2, MessageSquareQuote } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { VerifiedBadge } from '@/components/ui/verified-badge';
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

import { useAuth } from '@/contexts/AuthContext';
import { useTestimonies } from '@/hooks/useTestimonies';
import { cn } from '@/lib/utils';

const Testimonies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { testimonies, loading, createTestimony, toggleLike, deleteTestimony } = useTestimonies();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenCreate = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    const ok = await createTestimony({
      title: title.trim(),
      content: content.trim(),
      is_anonymous: isAnonymous,
    });
    setSubmitting(false);
    if (ok) {
      setTitle('');
      setContent('');
      setIsAnonymous(false);
      setDialogOpen(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '🙏';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/configuracoes')}
            className="rounded-full shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Sparkles className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Testemunhos</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Orações respondidas e milagres
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleOpenCreate} className="rounded-full gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Compartilhar</span>
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : testimonies.length === 0 ? (
        <div className="flex justify-center py-12">
          <EmptyState
            icon={<MessageSquareQuote className="h-14 w-14" />}
            title="Ainda não há testemunhos"
            description="Seja o primeiro a compartilhar como Deus respondeu suas orações."
            action={
              <Button onClick={handleOpenCreate} className="rounded-full gap-2 px-6">
                <Plus className="h-4 w-4" />
                Compartilhar Testemunho
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {testimonies.map((t) => (
            <Card key={t.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm shrink-0">
                    {t.author_photo_url && (
                      <AvatarImage src={t.author_photo_url} alt={t.author_display_name || ''} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-sm font-medium">
                      {t.is_anonymous ? '🙏' : getInitials(t.author_display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          'text-sm font-medium truncate',
                          !t.is_anonymous && t.author_is_supporter
                            ? 'text-[hsl(var(--supporter))]'
                            : 'text-foreground'
                        )}
                      >
                        {t.is_anonymous ? 'Anônimo' : t.author_display_name || 'Usuário'}
                      </span>
                      {!t.is_anonymous && t.author_verified && <VerifiedBadge size="sm" />}
                      {!t.is_anonymous && t.author_is_supporter && (
                        <Badge
                          variant="outline"
                          className="h-5 px-1.5 text-[10px] font-medium bg-[hsl(var(--supporter-light))] text-[hsl(var(--supporter))] border-[hsl(var(--supporter)/0.3)] gap-0.5"
                        >
                          <Heart className="h-2.5 w-2.5 fill-current" />
                          Apoiador
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      há{' '}
                      {formatDistanceToNow(new Date(t.created_at), {
                        addSuffix: false,
                        locale: ptBR,
                      })}
                    </p>
                  </div>

                  {user && t.user_id === user.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-full"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir testemunho?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTestimony(t.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <h3 className="font-semibold text-base text-foreground mb-2 leading-snug">
                  {t.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {t.content}
                </p>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40">
                  <button
                    onClick={() => toggleLike(t.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      t.has_liked
                        ? 'bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                        : 'bg-card text-muted-foreground border border-border/50 hover:border-rose-300 hover:text-rose-500'
                    )}
                  >
                    <Heart className={cn('h-4 w-4', t.has_liked && 'fill-current')} />
                    <span className="text-xs">{t.likes_count}</span>
                  </button>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Glória a Deus
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>Compartilhar Testemunho</DialogTitle>
            <DialogDescription>
              Conte como Deus respondeu sua oração e inspire outros.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="t-title">Título</Label>
              <Input
                id="t-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Deus curou minha mãe"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-content">Seu testemunho</Label>
              <Textarea
                id="t-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compartilhe a história..."
                rows={6}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {content.length}/2000
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
              <div>
                <Label htmlFor="t-anon" className="text-sm">
                  Publicar como anônimo
                </Label>
                <p className="text-xs text-muted-foreground">
                  Seu nome não será exibido.
                </p>
              </div>
              <Switch id="t-anon" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Testimonies;
