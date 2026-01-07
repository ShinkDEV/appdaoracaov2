import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Copy, Check, ExternalLink, CreditCard, Mail, Instagram, Youtube } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DONATION_VALUES = [5, 10, 20, 50, 100];

// PIX key for donations
const PIX_KEY = 'pix@appdaoracao.com.br';
const CONTACT_EMAIL = 'contato@appdaoracao.com';

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const finalValue = selectedValue || (customValue ? parseFloat(customValue) : 0);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopiedPix(true);
      toast.success('Chave PIX copiada!');
      setTimeout(() => setCopiedPix(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopiedEmail(true);
      toast.success('E-mail copiado!');
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleSelectValue = (value: number) => {
    setSelectedValue(value);
    setCustomValue('');
  };

  const handleCustomValueChange = (value: string) => {
    setCustomValue(value);
    setSelectedValue(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
            Fazer uma Doação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card Section */}
          <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-primary font-medium">
              <CreditCard className="h-5 w-5" />
              Doar com Cartão
            </div>
            
            {/* Value selection */}
            <div className="space-y-3">
              <Label className="text-muted-foreground">Escolha um valor</Label>
              <div className="grid grid-cols-3 gap-2">
                {DONATION_VALUES.map((value) => (
                  <Button
                    key={value}
                    variant={selectedValue === value ? 'default' : 'outline'}
                    onClick={() => handleSelectValue(value)}
                    className={cn(
                      "h-11",
                      selectedValue === value && "bg-primary shadow-md"
                    )}
                  >
                    R$ {value}
                  </Button>
                ))}
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="Outro valor (R$)"
                    value={customValue}
                    onChange={(e) => handleCustomValueChange(e.target.value)}
                    className="text-center"
                  />
                </div>
              </div>
            </div>

            {/* Card donation button */}
            <Button 
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold gap-2 shadow-lg"
              disabled={finalValue <= 0}
              asChild
            >
              <a href="https://apoia.se/appdaoracao" target="_blank" rel="noopener noreferrer">
                <CreditCard className="h-5 w-5" />
                Doar R$ {finalValue > 0 ? finalValue.toFixed(2).replace('.', ',') : '0,00'}
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">
                Ou, doar com PIX
              </span>
            </div>
          </div>

          {/* PIX Section */}
          <div className="space-y-4 p-4 rounded-xl bg-muted/50 border">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <div className="p-1.5 rounded-md bg-green-500/10">
                <Copy className="h-4 w-4 text-green-600" />
              </div>
              Chave PIX
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={PIX_KEY}
                readOnly
                className="bg-background font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPix}
                className="shrink-0"
              >
                {copiedPix ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-background/50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Como doar via PIX:</p>
              <ol className="text-xs text-muted-foreground/80 space-y-0.5 list-decimal list-inside">
                <li>Copie a chave PIX acima</li>
                <li>Abra o app do seu banco</li>
                <li>Faça um PIX com o valor desejado</li>
              </ol>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-dashed">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              Contato
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={CONTACT_EMAIL}
                readOnly
                className="bg-background font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyEmail}
                className="shrink-0"
              >
                {copiedEmail ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Dúvidas ou sugestões? Entre em contato conosco!
            </p>
          </div>

          {/* Social Media Section */}
          <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5 border">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Heart className="h-4 w-4 text-pink-600" />
              </div>
              Siga-nos nas redes sociais
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2 h-11"
                asChild
              >
                <a href="https://instagram.com/appdaoracao" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <span className="text-sm">@appdaoracao</span>
                </a>
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 gap-2 h-11"
                asChild
              >
                <a href="https://www.youtube.com/@appdaoracao" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-5 w-5 text-red-600" />
                  <span className="text-sm">App da Oração</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
