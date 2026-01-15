import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Política de Privacidade</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: 15 de Janeiro de 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">1. Informações que Coletamos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coletamos as seguintes informações quando você usa o App da Oração:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Dados de cadastro:</strong> nome, email e foto de perfil (opcional)</li>
              <li><strong>Conteúdo:</strong> pedidos de oração e interações na plataforma</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de dispositivo e navegador</li>
              <li><strong>Dados de uso:</strong> páginas visitadas e funcionalidades utilizadas</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">2. Como Usamos suas Informações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Fornecer e manter o serviço</li>
              <li>Personalizar sua experiência</li>
              <li>Processar doações e assinaturas</li>
              <li>Enviar notificações importantes sobre o serviço</li>
              <li>Prevenir fraudes e garantir a segurança</li>
              <li>Melhorar nossos serviços</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">3. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos suas informações pessoais. Podemos compartilhar dados com:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Outros usuários:</strong> pedidos de oração públicos são visíveis para a comunidade</li>
              <li><strong>Prestadores de serviço:</strong> processadores de pagamento (MercadoPago) e hospedagem</li>
              <li><strong>Autoridades:</strong> quando exigido por lei</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">4. Segurança dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, 
              incluindo criptografia de dados em trânsito e em repouso, e controle de acesso restrito.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">5. Seus Direitos (LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Solicitar portabilidade dos dados</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies essenciais para o funcionamento do serviço, como autenticação e preferências. 
              Não utilizamos cookies de rastreamento de terceiros para publicidade.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">7. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta, 
              seus dados serão removidos em até 30 dias, exceto quando necessário para obrigações legais.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">8. Menores de Idade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O serviço não é destinado a menores de 13 anos. Menores entre 13 e 18 anos devem 
              ter consentimento dos pais ou responsáveis para utilizar a plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">9. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas 
              através do aplicativo ou por email.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">10. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato:
            </p>
            <p className="text-muted-foreground">
              Email: privacidade@appdaoracao.com.br
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
