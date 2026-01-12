import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Copy, Check, ExternalLink, CreditCard, Mail, QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DONATION_VALUES = [5, 10, 20, 50, 100];

// Contact email
const CONTACT_EMAIL = 'contato@appdaoracao.com';

interface PixChargeResponse {
  txid: string;
  pixCopiaECola: string;
  qrcode: string;
  imagemQrcode: string;
  valor: string;
  expiracao: number;
}

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixCharge, setPixCharge] = useState<PixChargeResponse | null>(null);

  const finalValue = selectedValue || (customValue ? parseFloat(customValue) : 0);

  const handleCopyPix = async () => {
    if (!pixCharge?.pixCopiaECola) return;
    try {
      await navigator.clipboard.writeText(pixCharge.pixCopiaECola);
      setCopiedPix(true);
      toast.success('Código PIX copiado!');
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
    setPixCharge(null);
  };

  const handleCustomValueChange = (value: string) => {
    setCustomValue(value);
    setSelectedValue(null);
    setPixCharge(null);
  };

  const handleGeneratePix = async () => {
    if (finalValue <= 0) {
      toast.error('Selecione um valor para doar');
      return;
    }

    setIsGeneratingPix(true);
    try {
      const { data, error } = await supabase.functions.invoke('efi-pix', {
        body: {
          amount: Math.round(finalValue * 100), // Convert to cents
          description: 'Doação App da Oração',
        },
      });

      if (error) throw error;

      setPixCharge(data);
      toast.success('QR Code PIX gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PIX:', error);
      toast.error('Erro ao gerar PIX. Tente novamente.');
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setPixCharge(null);
      setSelectedValue(null);
      setCustomValue('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                <QrCode className="h-4 w-4 text-green-600" />
              </div>
              PIX via EFI Bank
            </div>
            
            {!pixCharge ? (
              <Button
                onClick={handleGeneratePix}
                disabled={finalValue <= 0 || isGeneratingPix}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
              >
                {isGeneratingPix ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5" />
                    Gerar QR Code PIX - R$ {finalValue > 0 ? finalValue.toFixed(2).replace('.', ',') : '0,00'}
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* QR Code Image */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img 
                      src={pixCharge.imagemQrcode} 
                      alt="QR Code PIX" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>

                {/* PIX Copy and Paste */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Ou copie o código PIX:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={pixCharge.pixCopiaECola}
                      readOnly
                      className="bg-background font-mono text-xs"
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
                </div>

                {/* Value and Expiration */}
                <div className="bg-background/50 rounded-lg p-3 space-y-1 text-center">
                  <p className="text-lg font-bold text-green-600">
                    R$ {pixCharge.valor.replace('.', ',')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expira em {Math.round(pixCharge.expiracao / 60)} minutos
                  </p>
                </div>

                {/* Generate New Button */}
                <Button
                  variant="outline"
                  onClick={() => setPixCharge(null)}
                  className="w-full"
                >
                  Gerar novo QR Code
                </Button>
              </div>
            )}

            {/* Instructions */}
            {!pixCharge && (
              <div className="bg-background/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Como doar via PIX:</p>
                <ol className="text-xs text-muted-foreground/80 space-y-0.5 list-decimal list-inside">
                  <li>Selecione o valor acima</li>
                  <li>Clique em "Gerar QR Code PIX"</li>
                  <li>Escaneie ou copie o código no seu banco</li>
                </ol>
              </div>
            )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
