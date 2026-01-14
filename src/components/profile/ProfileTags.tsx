import { Lock, Heart, BadgeCheck, Info } from 'lucide-react';
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

interface ProfileTagsProps {
  isSupporter: boolean;
  isVerified: boolean;
}

export function ProfileTags({ isSupporter, isVerified }: ProfileTagsProps) {
  const navigate = useNavigate();

  const handleSupporterClick = () => {
    if (!isSupporter) {
      navigate('/doacao');
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
              </div>
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
