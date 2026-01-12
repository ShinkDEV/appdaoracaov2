import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Copy, Check, Mail, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DONATION_VALUES = [5, 10, 20, 50, 100];
const PIX_KEY = 'pix@appdaoracao.com.br';
const CONTACT_EMAIL = 'contato@appdaoracao.com';

const CARD_BRANDS = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'American Express' },
  { value: 'hipercard', label: 'Hipercard' },
];

type Step = 'select-value' | 'card-form' | 'success';

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const [step, setStep] = useState<Step>('select-value');
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [installments, setInstallments] = useState('1');

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');

  const finalValue = selectedValue || (customValue ? parseFloat(customValue) : 0);

  const resetForm = () => {
    setStep('select-value');
    setSelectedValue(null);
    setCustomValue('');
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setCardBrand('');
    setInstallments('1');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerCpf('');
    setCustomerPhone('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
    setZipcode('');
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

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

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const formatZipcode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
  };

  const handleProcessPayment = async () => {
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv || !cardBrand) {
      toast.error('Preencha todos os dados do cartão');
      return;
    }

    if (!customerName || !customerEmail || !customerCpf) {
      toast.error('Preencha os dados pessoais');
      return;
    }

    if (!street || !number || !neighborhood || !city || !state || !zipcode) {
      toast.error('Preencha o endereço completo');
      return;
    }

    setIsProcessing(true);

    try {
      const [expirationMonth, expirationYear] = cardExpiry.split('/');
      
      // Step 1: Tokenize card
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('efi-card-payment/tokenize', {
        body: {
          brand: cardBrand,
          number: cardNumber.replace(/\s/g, ''),
          cvv: cardCvv,
          expirationMonth,
          expirationYear: `20${expirationYear}`,
        },
      });

      if (tokenError || !tokenData?.paymentToken) {
        throw new Error(tokenError?.message || 'Erro ao processar cartão');
      }

      // Step 2: Process payment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('efi-card-payment/pay', {
        body: {
          amount: Math.round(finalValue * 100),
          cardToken: tokenData.paymentToken,
          installments: parseInt(installments),
          customer: {
            name: customerName,
            email: customerEmail,
            cpf: customerCpf,
            phone: customerPhone,
          },
          billingAddress: {
            street,
            number,
            neighborhood,
            city,
            state,
            zipcode,
          },
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message || 'Erro ao processar pagamento');
      }

      setStep('success');
      toast.success('Doação realizada com sucesso!');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSelectValue = () => (
    <div className="space-y-6">
      {/* Card Section */}
      <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 text-primary font-medium">
          <CreditCard className="h-5 w-5" />
          Doar com Cartão
        </div>
        
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

        <Button 
          className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold gap-2 shadow-lg"
          disabled={finalValue <= 0}
          onClick={() => setStep('card-form')}
        >
          <CreditCard className="h-5 w-5" />
          Continuar - R$ {finalValue > 0 ? finalValue.toFixed(2).replace('.', ',') : '0,00'}
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
          <Input value={PIX_KEY} readOnly className="bg-background font-mono text-sm" />
          <Button variant="outline" size="icon" onClick={handleCopyPix} className="shrink-0">
            {copiedPix ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

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
          <Input value={CONTACT_EMAIL} readOnly className="bg-background font-mono text-sm" />
          <Button variant="outline" size="icon" onClick={handleCopyEmail} className="shrink-0">
            {copiedEmail ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Dúvidas ou sugestões? Entre em contato conosco!
        </p>
      </div>
    </div>
  );

  const renderCardForm = () => (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => setStep('select-value')} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-muted-foreground">Valor da doação</p>
        <p className="text-2xl font-bold text-primary">R$ {finalValue.toFixed(2).replace('.', ',')}</p>
      </div>

      {/* Card Details */}
      <div className="space-y-3">
        <Label className="font-medium">Dados do Cartão</Label>
        
        <Select value={cardBrand} onValueChange={setCardBrand}>
          <SelectTrigger>
            <SelectValue placeholder="Bandeira do cartão" />
          </SelectTrigger>
          <SelectContent>
            {CARD_BRANDS.map((brand) => (
              <SelectItem key={brand.value} value={brand.value}>
                {brand.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Número do cartão"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          maxLength={19}
        />

        <Input
          placeholder="Nome impresso no cartão"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="MM/AA"
            value={cardExpiry}
            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
            maxLength={5}
          />
          <Input
            placeholder="CVV"
            value={cardCvv}
            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            type="password"
          />
        </div>

        <Select value={installments} onValueChange={setInstallments}>
          <SelectTrigger>
            <SelectValue placeholder="Parcelas" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => {
              const installmentValue = finalValue / n;
              if (installmentValue >= 5) {
                return (
                  <SelectItem key={n} value={n.toString()}>
                    {n}x de R$ {installmentValue.toFixed(2).replace('.', ',')}
                  </SelectItem>
                );
              }
              return null;
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Customer Info */}
      <div className="space-y-3">
        <Label className="font-medium">Dados Pessoais</Label>
        <Input placeholder="Nome completo" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <Input placeholder="E-mail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="CPF" value={customerCpf} onChange={(e) => setCustomerCpf(formatCpf(e.target.value))} maxLength={14} />
          <Input placeholder="Telefone" value={customerPhone} onChange={(e) => setCustomerPhone(formatPhone(e.target.value))} maxLength={15} />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-3">
        <Label className="font-medium">Endereço de Cobrança</Label>
        <Input placeholder="CEP" value={zipcode} onChange={(e) => setZipcode(formatZipcode(e.target.value))} maxLength={9} />
        <div className="grid grid-cols-3 gap-2">
          <Input className="col-span-2" placeholder="Rua" value={street} onChange={(e) => setStreet(e.target.value)} />
          <Input placeholder="Nº" value={number} onChange={(e) => setNumber(e.target.value)} />
        </div>
        <Input placeholder="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
        <div className="grid grid-cols-3 gap-2">
          <Input className="col-span-2" placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input placeholder="UF" value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} />
        </div>
      </div>

      <Button
        className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold gap-2"
        onClick={handleProcessPayment}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Confirmar Doação
          </>
        )}
      </Button>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6 py-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground">Doação Realizada!</h3>
        <p className="text-muted-foreground">
          Muito obrigado pela sua contribuição de R$ {finalValue.toFixed(2).replace('.', ',')}
        </p>
        <p className="text-sm text-muted-foreground">
          Que Deus abençoe você e sua família! 🙏
        </p>
      </div>
      <Button onClick={() => handleClose(false)} className="w-full">
        Fechar
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
            Fazer uma Doação
          </DialogTitle>
        </DialogHeader>

        {step === 'select-value' && renderSelectValue()}
        {step === 'card-form' && renderCardForm()}
        {step === 'success' && renderSuccess()}
      </DialogContent>
    </Dialog>
  );
}
