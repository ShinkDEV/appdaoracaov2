import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DONATION_VALUES = [5, 10, 20, 50, 100];

// PIX key for donations - replace with actual key
const PIX_KEY = 'pix@appdaoracao.com.br';

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [copied, setCopied] = useState(false);

  const finalValue = selectedValue || (customValue ? parseFloat(customValue) : 0);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      toast.success('Chave PIX copiada!');
      setTimeout(() => setCopied(false), 2000);
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
          {/* Value selection */}
          <div className="space-y-3">
            <Label>Escolha um valor</Label>
            <div className="grid grid-cols-3 gap-2">
              {DONATION_VALUES.map((value) => (
                <Button
                  key={value}
                  variant={selectedValue === value ? 'default' : 'outline'}
                  onClick={() => handleSelectValue(value)}
                  className={cn(
                    "h-12",
                    selectedValue === value && "bg-primary"
                  )}
                >
                  R$ {value}
                </Button>
              ))}
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="Outro valor"
                  value={customValue}
                  onChange={(e) => handleCustomValueChange(e.target.value)}
                  className="text-center"
                />
              </div>
            </div>
          </div>

          {/* PIX info */}
          <div className="space-y-3">
            <Label>Chave PIX</Label>
            <div className="flex items-center gap-2">
              <Input
                value={PIX_KEY}
                readOnly
                className="bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPix}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Como doar:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Copie a chave PIX acima</li>
              <li>Abra o app do seu banco</li>
              <li>Faça um PIX para a chave copiada</li>
              <li>Informe o valor desejado{finalValue > 0 && `: R$ ${finalValue.toFixed(2)}`}</li>
            </ol>
          </div>

          {/* Alternative payment */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">
              Prefere outro método de pagamento?
            </p>
            <Button variant="link" size="sm" className="gap-1" asChild>
              <a href="https://apoia.se/appdaoracao" target="_blank" rel="noopener noreferrer">
                Apoie pelo Apoia.se <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
