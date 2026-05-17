import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, MoreVertical, PlusSquare, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

const InstallSEO = () => (
  <SEO
    title="Instalar App da Oração no celular — Passo a passo"
    description="Instale o App da Oração no seu Android ou iPhone em segundos e tenha acesso rápido aos pedidos e devocionais."
    path="/instalar"
  />
);

const Install = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast.success("App instalado com sucesso!");
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-b from-primary/20 to-background pt-12 pb-8 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">App Instalado!</h1>
            <p className="text-muted-foreground">O App da Oração já está instalado no seu dispositivo.</p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Você pode acessar o app diretamente da sua tela inicial.
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Voltar para o App
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Instalar App</h1>
        </div>
      </div>

      <div className="bg-gradient-to-b from-primary/20 to-background pt-8 pb-6 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🙏</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Instale o App da Oração</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Tenha acesso rápido aos pedidos de oração diretamente da sua tela inicial
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Install Button (if supported) */}
        {isInstallable && (
          <Button onClick={handleInstall} size="lg" className="w-full gap-2 h-14 text-base">
            <Download className="w-5 h-5" />
            Instalar Agora
          </Button>
        )}

        {/* iOS Instructions */}
        {isIOS && !isInstallable && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="w-5 h-5 text-primary" />
                Instruções para iPhone/iPad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium">Toque no botão Compartilhar</p>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                    <Share className="w-4 h-4" />
                    <span>Na barra inferior do Safari</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium">Selecione "Adicionar à Tela de Início"</p>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                    <PlusSquare className="w-4 h-4" />
                    <span>Role para baixo se necessário</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium">Toque em "Adicionar"</p>
                  <p className="text-sm text-muted-foreground mt-1">O app aparecerá na sua tela inicial</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Android Instructions */}
        {isAndroid && !isInstallable && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="w-5 h-5 text-primary" />
                Instruções para Android
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium">Toque no menu do navegador</p>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                    <MoreVertical className="w-4 h-4" />
                    <span>Três pontos no canto superior</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium">Selecione "Instalar aplicativo"</p>
                  <p className="text-sm text-muted-foreground mt-1">Ou "Adicionar à tela inicial"</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium">Confirme a instalação</p>
                  <p className="text-sm text-muted-foreground mt-1">O app aparecerá na sua tela inicial</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generic Instructions (Desktop or unknown) */}
        {!isIOS && !isAndroid && !isInstallable && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="w-5 h-5" />
                Como instalar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium">Acesse o menu do navegador</p>
                  <p className="text-muted-foreground text-sm mt-1">Toque nos três pontos ou ícone de compartilhar</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium">Selecione "Adicionar à tela inicial"</p>
                  <p className="text-muted-foreground text-sm mt-1">Ou "Instalar aplicativo"</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium">Confirme a instalação</p>
                  <p className="text-muted-foreground text-sm mt-1">O app aparecerá na sua tela inicial</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Benefícios do App</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm">Acesso rápido pela tela inicial</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm">Carregamento mais rápido</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm">Funciona mesmo offline</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm">Experiência como app nativo</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => navigate("/")} className="w-full">
          Voltar para o App
        </Button>
      </div>
    </div>
  );
};

export default Install;
