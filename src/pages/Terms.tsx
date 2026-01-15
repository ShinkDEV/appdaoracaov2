import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Termos de Uso</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: 15 de Janeiro de 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e usar o App da Oração, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              O App da Oração é uma plataforma comunitária que permite aos usuários compartilhar pedidos de oração, 
              orar por outros membros da comunidade e receber apoio espiritual.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar determinadas funcionalidades, você precisará criar uma conta. 
              Você é responsável por manter a confidencialidade de suas credenciais e por todas as atividades 
              que ocorram em sua conta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">4. Conduta do Usuário</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao usar nosso serviço, você concorda em:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Não publicar conteúdo ofensivo, difamatório ou ilegal</li>
              <li>Respeitar outros usuários e suas crenças</li>
              <li>Não utilizar a plataforma para spam ou propaganda não autorizada</li>
              <li>Não tentar acessar contas de outros usuários</li>
              <li>Não utilizar o serviço para fins comerciais sem autorização</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">5. Conteúdo do Usuário</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você mantém todos os direitos sobre o conteúdo que publica. Ao compartilhar pedidos de oração, 
              você concede ao App da Oração uma licença para exibir esse conteúdo aos demais usuários da plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">6. Doações e Assinaturas</h2>
            <p className="text-muted-foreground leading-relaxed">
              Doações e assinaturas são voluntárias e não reembolsáveis, exceto quando exigido por lei. 
              Os valores arrecadados são utilizados para manutenção e melhoria do serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">7. Modificações do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar ou descontinuar o serviço a qualquer momento, 
              com ou sem aviso prévio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O App da Oração é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. 
              Não nos responsabilizamos por danos indiretos decorrentes do uso do serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">9. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes termos, entre em contato através do email: contato@appdaoracao.com.br
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;
