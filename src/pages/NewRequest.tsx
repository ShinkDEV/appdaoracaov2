import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading';
import { ArrowLeft, EyeOff } from 'lucide-react';
import { VALIDATION } from '@/lib/constants';
import { trackPrayerCreated } from '@/lib/analytics';

const NewRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [themes, setThemes] = useState<{ id: string; name: string }[]>([]);
  const [themeId, setThemeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) navigate('/auth');
    fetchThemes();
  }, [user, navigate]);

  const fetchThemes = async () => {
    const { data } = await supabase.from('prayer_themes').select('id, name').order('display_order');
    if (data) setThemes(data);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!themeId) newErrors.themeId = 'Selecione um tema';
    if (title.length < VALIDATION.title.min) newErrors.title = `Mínimo ${VALIDATION.title.min} caracteres`;
    if (title.length > VALIDATION.title.max) newErrors.title = `Máximo ${VALIDATION.title.max} caracteres`;
    if (description.length < VALIDATION.description.min) newErrors.description = `Mínimo ${VALIDATION.description.min} caracteres`;
    if (description.length > VALIDATION.description.max) newErrors.description = `Máximo ${VALIDATION.description.max} caracteres`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('prayer_requests').insert({
        user_id: user.id,
        theme_id: themeId,
        title: title.trim(),
        description: description.trim(),
        is_anonymous: isAnonymous,
      });

      if (error) throw error;

      // Google Analytics - Track prayer request creation
      const themeName = themes.find(t => t.id === themeId)?.name || 'Unknown';
      trackPrayerCreated(themeId, themeName, isAnonymous);

      // Meta Pixel - Track prayer request creation
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Prayer Request',
          content_category: themeName,
        });
      }

      toast({ title: 'Pedido criado!', description: 'Seu pedido de oração foi enviado.' });
      navigate('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Novo Pedido de Oração</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema *</Label>
                <Select value={themeId} onValueChange={setThemeId}>
                  <SelectTrigger><SelectValue placeholder="Selecione um tema" /></SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.themeId && <p className="text-xs text-destructive">{errors.themeId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título * ({title.length}/{VALIDATION.title.max})</Label>
                <Input
                  id="title"
                  placeholder="Título do seu pedido"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={VALIDATION.title.max}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição * ({description.length}/{VALIDATION.description.max})</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva seu pedido de oração..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={VALIDATION.description.max}
                  rows={6}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="anonymous" className="font-medium cursor-pointer">Enviar anonimamente</Label>
                    <p className="text-xs text-muted-foreground">Seu nome não será exibido publicamente</p>
                  </div>
                </div>
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Enviar Pedido'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewRequest;
