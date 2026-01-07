import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Heart } from 'lucide-react';

const DonationSuccess = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 pb-32">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Obrigado pela sua doação!
            </h1>
            <p className="text-muted-foreground text-lg">
              Sua generosidade nos ajuda a manter o App da Oração funcionando e alcançando mais pessoas.
            </p>
          </div>

          <Card className="border-border/50 shadow-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Heart className="h-5 w-5 fill-current" />
                <span className="font-semibold">Deus abençoe você!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Continue orando e compartilhando pedidos de oração com a comunidade.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              Voltar ao Início
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/configuracoes')}
              className="rounded-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Configurações
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DonationSuccess;
