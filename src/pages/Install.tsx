import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/20 to-background pt-12 pb-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">🙏</div>
          <h1 className="text-3xl font-bold mb-2">Instale o App da Oração</h1>
          <p className="text-muted-foreground">Tenha acesso rápido aos pedidos de oração diretamente da sua tela inicial</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Benefícios do App</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span>Acesso rápido pela tela inicial</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span>Carregamento mais rápido</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span>Experiência como app nativo</span>
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
