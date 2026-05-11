import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Copy, Check, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { trackPixCopy } from '@/lib/analytics';

const PIX_KEY = 'apoio@appdaoracao.com';

export default function Donation() {
  const navigate = useNavigate();
  const [copiedPix, setCopiedPix] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopiedPix(true);
      trackPixCopy();
      toast.success('Chave PIX copiada!');
      setTimeout(() => setCopiedPix(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Apoie o App da Oração</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sua contribuição nos ajuda a manter o app gratuito e disponível para todos
            </p>
          </div>

          <div className="bg-background rounded-2xl shadow-xl border p-6 space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para início
            </Button>

            <div className="space-y-4 p-4 rounded-xl bg-muted/50 border">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <div className="p-1.5 rounded-md bg-green-500/10">
                  <Copy className="h-4 w-4 text-green-600" />
                </div>
                Chave PIX
              </div>

              <div className="flex items-center gap-2">
                <Input value={PIX_KEY} readOnly className="bg-background font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopyPix} className="shrink-0">
                  {copiedPix ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <Button onClick={handleCopyPix} className="w-full gap-2">
                {copiedPix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedPix ? 'Chave copiada!' : 'Copiar chave PIX'}
              </Button>

              <div className="bg-background/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Como doar via PIX:</p>
                <ol className="text-xs text-muted-foreground/80 space-y-0.5 list-decimal list-inside">
                  <li>Copie a chave PIX acima</li>
                  <li>Abra o app do seu banco</li>
                  <li>Faça um PIX com o valor desejado</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-primary">
              <Heart className="h-5 w-5 fill-primary" />
              <span className="text-sm font-medium">Que Deus abençoe você!</span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Doação 100% segura via PIX
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
