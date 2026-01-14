import { useState, useEffect } from 'react';
import { Lock, Heart, BadgeCheck, Info, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileTagsProps {
  isSupporter: boolean;
  isVerified: boolean;
}

type RequirementType = '10k_followers' | '50k_views' | '100k_influencer';

export function ProfileTags({ isSupporter, isVerified }: ProfileTagsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    requirement: '' as RequirementType | '',
    link: '',
  });

  useEffect(() => {
    if (user && !isVerified) {
      checkPendingRequest();
    }
  }, [user, isVerified]);

  const checkPendingRequest = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('verification_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();
    
    setHasPendingRequest(!!data);
  };

  const handleSupporterClick = () => {
    if (!isSupporter) {
      navigate('/apoio');
    }
  };

  const getRequirementLabel = (req: RequirementType) => {
    switch (req) {
      case '10k_followers':
        return 'Mais de 10 mil seguidores + postagem sobre o app';
      case '50k_views':
        return 'Postagem sobre o app com 50 mil+ visualizações';
      case '100k_influencer':
        return 'Influenciador com mais de 100 mil seguidores';
    }
  };

  const getLinkPlaceholder = () => {
    switch (formData.requirement) {
      case '10k_followers':
        return 'Link do seu perfil e da postagem';
      case '50k_views':
        return 'Link da postagem com as visualizações';
      case '100k_influencer':
        return 'Link do seu perfil';
      default:
        return 'Link do perfil ou postagem';
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para solicitar verificação');
      return;
    }

    if (!formData.name || !formData.email || !formData.requirement || !formData.link) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor, insira um e-mail válido');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          requirement: formData.requirement,
          link: formData.link.trim(),
        });

      if (error) throw error;

      toast.success('Solicitação enviada com sucesso! Analisaremos seu pedido em breve.');
      setShowVerificationForm(false);
      setFormData({ name: '', email: '', requirement: '', link: '' });
      setHasPendingRequest(true);
    } catch (error) {
      console.error('Error submitting verification request:', error);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Minhas Tags</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Como desbloquear as tags</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-amber-600 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Apoiador Mensal
                  </h4>
                  <p className="text-muted-foreground mt-1">
                    Torne-se um doador mensal para desbloquear esta tag e apoiar o crescimento do app.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4" />
                    Usuário Verificado
                  </h4>
                  <p className="text-muted-foreground mt-1">
                    Para liberar a verificação, você deve atender a um dos requisitos:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Ter mais de 10 mil seguidores e fazer uma postagem mostrando o funcionamento e link do app</li>
                    <li>Fazer uma postagem mostrando o funcionamento e link do app e atingir pelo menos 50 mil visualizações</li>
                    <li>Ser influenciador com mais de 100 mil seguidores</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-amber-800 dark:text-amber-200 text-xs">
                    <strong>Atenção:</strong> não é uma troca, é apenas uma forma de filtrar os pedidos de verificação em paralelo a divulgação do app para que mais vidas sejam alcançadas através da oração.
                  </p>
                </div>

                {!isVerified && !hasPendingRequest && (
                  <Button 
                    onClick={() => setShowVerificationForm(true)} 
                    className="w-full mt-2"
                    variant="default"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Solicitar Verificação
                  </Button>
                )}

                {!isVerified && hasPendingRequest && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                    <p className="text-blue-800 dark:text-blue-200 text-xs text-center">
                      ✓ Você já tem uma solicitação pendente em análise
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Verification Request Form Dialog */}
          <Dialog open={showVerificationForm} onOpenChange={setShowVerificationForm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                  Solicitar Verificação
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail para contato</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    maxLength={255}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Qual requisito você atende?</Label>
                  <RadioGroup
                    value={formData.requirement}
                    onValueChange={(value: RequirementType) => 
                      setFormData({ ...formData, requirement: value })
                    }
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="10k_followers" id="req1" className="mt-1" />
                      <Label htmlFor="req1" className="font-normal text-sm cursor-pointer">
                        {getRequirementLabel('10k_followers')}
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="50k_views" id="req2" className="mt-1" />
                      <Label htmlFor="req2" className="font-normal text-sm cursor-pointer">
                        {getRequirementLabel('50k_views')}
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="100k_influencer" id="req3" className="mt-1" />
                      <Label htmlFor="req3" className="font-normal text-sm cursor-pointer">
                        {getRequirementLabel('100k_influencer')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Link do perfil ou postagem</Label>
                  <Input
                    id="link"
                    placeholder={getLinkPlaceholder()}
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole o link conforme o requisito selecionado
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    Sua solicitação será analisada em até 7 dias úteis. Você receberá uma resposta no e-mail informado.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Solicitação
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <TooltipProvider>
          {/* Apoiador Mensal Tag */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={handleSupporterClick}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ease-out ${
                  isSupporter
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800 hover:shadow-md hover:shadow-amber-200/50 dark:hover:shadow-amber-900/30 hover:scale-[1.02]'
                    : 'bg-muted/30 border-border/50 opacity-60 cursor-pointer hover:opacity-100 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 hover:scale-[1.02] hover:shadow-sm'
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isSupporter
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white'
                      : 'bg-muted text-muted-foreground group-hover:bg-amber-100'
                  }`}
                >
                  {isSupporter ? (
                    <Heart className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium transition-colors duration-300 ${
                      isSupporter ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'
                    }`}
                  >
                    Apoiador Mensal
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isSupporter ? 'Obrigado pelo apoio!' : 'Clique para se tornar um doador'}
                  </p>
                </div>
                {isSupporter && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-full transition-transform duration-300 hover:scale-105">
                    Ativo
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isSupporter
                ? 'Você é um apoiador mensal!'
                : 'Clique para ir à página de doação'}
            </TooltipContent>
          </Tooltip>

          {/* Usuário Verificado Tag */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ease-out ${
                  isVerified
                    ? 'bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 border-blue-200 dark:border-blue-800 hover:shadow-md hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 hover:scale-[1.02]'
                    : 'bg-muted/30 border-border/50 opacity-60 hover:opacity-80 hover:scale-[1.01]'
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isVerified
                      ? 'bg-gradient-to-br from-blue-500 to-sky-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isVerified ? (
                    <BadgeCheck className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium transition-colors duration-300 ${
                      isVerified ? 'text-blue-700 dark:text-blue-300' : 'text-muted-foreground'
                    }`}
                  >
                    Usuário Verificado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isVerified ? 'Conta verificada' : 'Requisitos de verificação'}
                  </p>
                </div>
                {isVerified && (
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full transition-transform duration-300 hover:scale-105">
                    Ativo
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isVerified
                ? 'Sua conta é verificada!'
                : 'Clique no ícone de informação para ver os requisitos'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
