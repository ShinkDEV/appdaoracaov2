import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Megaphone,
  Monitor,
  Smartphone,
  CheckCircle2,
  XCircle,
  Heart,
  Users,
  Eye,
  Mail
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(120),
  email: z.string().trim().email('E-mail inválido').max(255),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Conte um pouco sobre o que deseja anunciar').max(2000),
});

export default function Advertise() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('advertise_contacts').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Erro ao enviar. Tente novamente.');
      return;
    }
    toast.success('Contato enviado! Retornaremos em até 48h úteis.');
    setForm({ name: '', email: '', phone: '', company: '', message: '' });
    setOpen(false);
  };

  return (
    <Layout>
      <SEO
        title="Anuncie no App da Oração — Alcance milhares de cristãos"
        description="Divulgue sua igreja, produto ou ministério para uma comunidade engajada de cristãos. Banners e anúncios segmentados."
        path="/anuncie"
      />
      <div className="space-y-8 pb-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Megaphone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Anuncie no App da Oração</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Alcance milhares de cristãos engajados em oração e propósito. 
            Divulgue sua igreja, ministério, evento ou produto alinhado aos valores cristãos.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">1000+</p>
              <p className="text-sm text-muted-foreground">Usuários ativos</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">5000+</p>
              <p className="text-sm text-muted-foreground">Visualizações/mês</p>
            </CardContent>
          </Card>
          <Card className="text-center col-span-2 md:col-span-1">
            <CardContent className="pt-6">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Público cristão</p>
            </CardContent>
          </Card>
        </div>

        {/* Banner Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Especificações do Banner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Seu banner será exibido no topo da página inicial, garantindo máxima visibilidade 
              para todos os usuários do aplicativo.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Desktop</span>
                </div>
                <div className="aspect-[3/1] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                  <span className="text-muted-foreground font-mono text-sm">1200 x 400 px</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Proporção 3:1</p>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Mobile</span>
                </div>
                <div className="aspect-[2/1] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 max-w-[200px] mx-auto">
                  <span className="text-muted-foreground font-mono text-sm">600 x 300 px</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Proporção 2:1</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm">
                <strong>Formatos aceitos:</strong> JPG, PNG, WebP<br />
                <strong>Tamanho máximo:</strong> 2MB por imagem<br />
                <strong>Recomendação:</strong> Use imagens de alta qualidade e textos legíveis
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Requisitos e Diretrizes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                O que aceitamos
              </h3>
              <ul className="space-y-2">
                {[
                  'Igrejas e ministérios cristãos',
                  'Eventos cristãos (conferências, retiros, congressos)',
                  'Livros e conteúdos de edificação espiritual',
                  'Músicas e artistas gospel',
                  'Produtos e serviços alinhados aos valores cristãos',
                  'Instituições de caridade e projetos missionários',
                  'Cursos e formações teológicas',
                  'Aplicativos e ferramentas para vida cristã',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                O que NÃO aceitamos
              </h3>
              <ul className="space-y-2">
                {[
                  'Conteúdo que contradiga os princípios bíblicos',
                  'Jogos de azar, apostas ou similares',
                  'Bebidas alcoólicas e tabaco',
                  'Conteúdo adulto ou sensual',
                  'Falsas promessas de cura ou prosperidade',
                  'Discurso de ódio ou discriminação',
                  'Política partidária',
                  'Esquemas financeiros ou pirâmides',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Pricing placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Valores e Contratação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Oferecemos planos flexíveis para atender às necessidades do seu ministério ou negócio. 
              Entre em contato para receber uma proposta personalizada.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Semanal</Badge>
              <Badge variant="secondary">Mensal</Badge>
              <Badge variant="secondary">Trimestral</Badge>
              <Badge variant="secondary">Campanhas especiais</Badge>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Entrar em contato
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Quero anunciar</DialogTitle>
                  <DialogDescription>
                    Preencha seus dados e entraremos em contato em até 48 horas úteis.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="ad-name">Nome *</Label>
                    <Input id="ad-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} required />
                  </div>
                  <div>
                    <Label htmlFor="ad-email">E-mail *</Label>
                    <Input id="ad-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} required />
                  </div>
                  <div>
                    <Label htmlFor="ad-phone">Telefone / WhatsApp</Label>
                    <Input id="ad-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={40} />
                  </div>
                  <div>
                    <Label htmlFor="ad-company">Igreja / Empresa</Label>
                    <Input id="ad-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} maxLength={120} />
                  </div>
                  <div>
                    <Label htmlFor="ad-message">Mensagem *</Label>
                    <Textarea id="ad-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} rows={4} required placeholder="Conte sobre o que deseja divulgar..." />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? 'Enviando...' : 'Enviar contato'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <p className="text-xs text-center text-muted-foreground">
              Responderemos em até 48 horas úteis
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
