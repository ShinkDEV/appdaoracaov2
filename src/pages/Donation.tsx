import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Copy, Check, CreditCard, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const DONATION_VALUES = [5, 10, 20, 50, 100];
const PIX_KEY = 'apoio@appdaoracao.com';

// CPF mask function
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// CPF validation function
const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  
  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;
  
  return true;
};

type Step = 'select-value' | 'card-form' | 'success';
type DonationType = 'one-time' | 'monthly';

declare global {
  interface Window {
    MercadoPago: new (publicKey: string) => MercadoPagoInstance;
  }
}

interface MercadoPagoInstance {
  cardForm: (options: CardFormOptions) => CardFormInstance;
}

interface CardFormOptions {
  amount: string;
  iframe: boolean;
  form: {
    id: string;
    cardNumber: { id: string; placeholder: string };
    expirationDate: { id: string; placeholder: string };
    securityCode: { id: string; placeholder: string };
    cardholderName: { id: string; placeholder: string };
    issuer: { id: string; placeholder: string };
    installments: { id: string; placeholder: string };
    identificationType: { id: string; placeholder: string };
    identificationNumber: { id: string; placeholder: string };
    cardholderEmail: { id: string; placeholder: string };
  };
  callbacks: {
    onFormMounted: (error: Error | null) => void;
    onSubmit: (event: Event) => void;
    onFetching: (resource: string) => () => void;
  };
}

interface CardFormInstance {
  getCardFormData: () => CardFormData;
  createCardToken: () => Promise<{ token: string }>;
  unmount: () => void;
}

interface CardFormData {
  token: string;
  installments: number;
  paymentMethodId: string;
  issuerId: string;
  identificationType: string;
  identificationNumber: string;
  cardholderEmail: string;
}

export default function Donation() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select-value');
  const [donationType, setDonationType] = useState<DonationType>('one-time');
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMpLoaded, setIsMpLoaded] = useState(false);
  const [cardFormInstance, setCardFormInstance] = useState<CardFormInstance | null>(null);
  const [isFormMounted, setIsFormMounted] = useState(false);

  const finalValue = selectedValue || (customValue ? parseFloat(customValue) : 0);

  // Load Mercado Pago SDK
  useEffect(() => {
    if (step === 'card-form' && !isMpLoaded) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => setIsMpLoaded(true);
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [step, isMpLoaded]);

  // Initialize card form
  useEffect(() => {
    const initCardForm = async () => {
      if (step !== 'card-form' || !isMpLoaded || !window.MercadoPago) return;

      try {
        const { data, error } = await supabase.functions.invoke('mercadopago-payment', {
          body: { action: 'get-public-key' },
        });

        if (error || !data?.publicKey) {
          toast.error('Erro ao carregar formulário de pagamento');
          return;
        }

        const mp = new window.MercadoPago(data.publicKey);

        const cardForm = mp.cardForm({
          amount: finalValue.toString(),
          iframe: true,
          form: {
            id: 'mp-card-form',
            cardNumber: { id: 'mp-card-number', placeholder: 'Número do cartão' },
            expirationDate: { id: 'mp-expiration-date', placeholder: 'MM/AA' },
            securityCode: { id: 'mp-security-code', placeholder: 'CVV' },
            cardholderName: { id: 'mp-cardholder-name', placeholder: 'Nome no cartão' },
            issuer: { id: 'mp-issuer', placeholder: 'Banco emissor' },
            installments: { id: 'mp-installments', placeholder: 'Parcelas' },
            identificationType: { id: 'mp-identification-type', placeholder: 'Tipo de documento' },
            identificationNumber: { id: 'mp-identification-number', placeholder: 'CPF' },
            cardholderEmail: { id: 'mp-cardholder-email', placeholder: 'E-mail' },
          },
          callbacks: {
            onFormMounted: (error) => {
              if (error) {
                console.error('CardForm mount error:', error);
                toast.error('Erro ao carregar formulário');
                setIsFormMounted(false);
              } else {
                setIsFormMounted(true);
              }
            },
            onSubmit: async (event) => {
              event.preventDefault();
              await handlePayment();
            },
            onFetching: (resource) => {
              console.log('Fetching:', resource);
              return () => {};
            },
          },
        });

        setCardFormInstance(cardForm);
      } catch (error) {
        console.error('Error initializing card form:', error);
        toast.error('Erro ao inicializar pagamento');
      }
    };

    initCardForm();

    return () => {
      if (cardFormInstance && isFormMounted) {
        try {
          cardFormInstance.unmount();
        } catch (e) {
          console.log('CardForm already unmounted');
        }
        setIsFormMounted(false);
      }
    };
  }, [step, isMpLoaded, finalValue]);

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

  const handleSelectValue = (value: number) => {
    setSelectedValue(value);
    setCustomValue('');
  };

  const handleCustomValueChange = (value: string) => {
    setCustomValue(value);
    setSelectedValue(null);
  };

  const handlePayment = async () => {
    if (!cardFormInstance) {
      toast.error('Formulário não carregado');
      return;
    }

    // Validate CPF before processing
    const cpfInput = document.getElementById('mp-identification-number') as HTMLInputElement;
    if (cpfInput && !validateCPF(cpfInput.value)) {
      toast.error('CPF inválido. Verifique o número informado.');
      return;
    }

    setIsProcessing(true);

    try {
      const tokenResponse = await cardFormInstance.createCardToken();
      
      if (!tokenResponse?.token) {
        toast.error('Erro ao processar cartão. Verifique os dados.');
        setIsProcessing(false);
        return;
      }

      const formData = cardFormInstance.getCardFormData();

      const { data, error } = await supabase.functions.invoke('mercadopago-payment', {
        body: {
          token: tokenResponse.token,
          transactionAmount: finalValue,
          installments: donationType === 'monthly' ? 1 : parseInt(String(formData.installments || 1), 10),
          paymentMethodId: formData.paymentMethodId,
          issuerId: formData.issuerId,
          donationType: donationType,
          payer: {
            email: formData.cardholderEmail,
            identification: {
              type: formData.identificationType,
              number: formData.identificationNumber,
            },
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao processar pagamento');
      }

      if (data.status === 'approved') {
        setStep('success');
        if (data.isSubscription) {
          toast.success('Apoio mensal ativado com sucesso!');
        } else {
          toast.success('Doação realizada com sucesso!');
        }
      } else if (data.status === 'in_process' || data.status === 'pending') {
        setStep('success');
        toast.info('Pagamento em análise');
      } else {
        throw new Error(data.statusDetail || 'Pagamento não aprovado');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento';
      if (errorMessage.includes('cardNumber') || errorMessage.includes('securityCode') || errorMessage.includes('expirationDate')) {
        toast.error('Verifique os dados do cartão');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSelectValue = () => (
    <div className="space-y-6">
      {/* Donation Type Toggle */}
      <div className="flex rounded-lg bg-muted p-1">
        <button
          onClick={() => setDonationType('one-time')}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
            donationType === 'one-time'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Doação Única
        </button>
        <button
          onClick={() => setDonationType('monthly')}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5",
            donationType === 'monthly'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Mensal
        </button>
      </div>

      {donationType === 'monthly' && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-primary font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Doação recorrente
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            O valor será cobrado automaticamente todo mês. Você pode cancelar a qualquer momento.
          </p>
        </div>
      )}

      {/* Card Section */}
      <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 text-primary font-medium">
          <CreditCard className="h-5 w-5" />
          {donationType === 'monthly' ? 'Apoio Mensal com Cartão' : 'Doar com Cartão'}
        </div>
        
        <div className="space-y-3">
          <Label className="text-muted-foreground">
            {donationType === 'monthly' ? 'Valor mensal' : 'Escolha um valor'}
          </Label>
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
                R$ {value}{donationType === 'monthly' ? '/mês' : ''}
              </Button>
            ))}
            <div className="col-span-3">
              <Input
                type="number"
                placeholder={donationType === 'monthly' ? 'Outro valor mensal (R$)' : 'Outro valor (R$)'}
                value={customValue}
                onChange={(e) => handleCustomValueChange(e.target.value)}
                className="text-center"
              />
            </div>
          </div>
        </div>

        <Button 
          className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold gap-2 shadow-lg"
          disabled={finalValue < 1}
          onClick={() => setStep('card-form')}
        >
          <CreditCard className="h-5 w-5" />
          Continuar - R$ {finalValue > 0 ? finalValue.toFixed(2).replace('.', ',') : '0,00'}
          {donationType === 'monthly' ? '/mês' : ''}
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
    </div>
  );

  const renderCardForm = () => (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => setStep('select-value')} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-muted-foreground">
          {donationType === 'monthly' ? 'Valor mensal' : 'Valor da doação'}
        </p>
        <p className="text-2xl font-bold text-primary">
          R$ {finalValue.toFixed(2).replace('.', ',')}
          {donationType === 'monthly' && <span className="text-sm font-normal">/mês</span>}
        </p>
        {donationType === 'monthly' && (
          <p className="text-xs text-muted-foreground mt-1">
            Cobrança recorrente mensal
          </p>
        )}
      </div>

      {!isMpLoaded ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando...</span>
        </div>
      ) : (
        <form id="mp-card-form" className="space-y-4">
          <div className="space-y-3">
            <Label className="font-medium">Dados do Cartão</Label>
            <div id="mp-card-number" className="h-10 border rounded-md"></div>
            <div className="grid grid-cols-2 gap-2">
              <div id="mp-expiration-date" className="h-10 border rounded-md"></div>
              <div id="mp-security-code" className="h-10 border rounded-md"></div>
            </div>
            <input 
              type="text" 
              id="mp-cardholder-name" 
              className="w-full h-10 px-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nome impresso no cartão"
            />
            {/* Hidden - auto-populated by MP SDK based on card number */}
            <select id="mp-issuer" className="hidden"></select>
            <select id="mp-installments" className="w-full h-10 px-3 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Parcelas</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Dados Pessoais</Label>
            <input 
              type="email" 
              id="mp-cardholder-email" 
              className="w-full h-10 px-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Seu e-mail"
            />
            <div className="grid grid-cols-2 gap-2">
              <select id="mp-identification-type" className="h-10 px-3 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Documento</option>
              </select>
              <input 
                type="text" 
                id="mp-identification-number" 
                className="h-10 px-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="000.000.000-00"
                maxLength={14}
                onChange={(e) => {
                  e.target.value = formatCPF(e.target.value);
                }}
              />
            </div>
          </div>

          <Button
            type="button"
            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold gap-2"
            onClick={handlePayment}
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
        </form>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Pagamento processado com segurança pelo Mercado Pago
      </p>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6 py-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground">
          {donationType === 'monthly' ? 'Apoio Mensal Ativado!' : 'Doação Realizada!'}
        </h3>
        <p className="text-muted-foreground">
          {donationType === 'monthly' 
            ? `Muito obrigado! Você agora apoia com R$ ${finalValue.toFixed(2).replace('.', ',')}/mês`
            : `Muito obrigado pela sua contribuição de R$ ${finalValue.toFixed(2).replace('.', ',')}`
          }
        </p>
        {donationType === 'monthly' && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 mt-2">
            A cobrança será feita automaticamente todo mês. Para cancelar, entre em contato conosco.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Que Deus abençoe você e sua família! 🙏
        </p>
      </div>
      <Button onClick={() => navigate('/')} className="w-full">
        Voltar ao Início
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Fazer uma Doação</h1>
          <p className="text-muted-foreground mt-2">
            Sua doação ajuda a manter o App da Oração funcionando
          </p>
        </div>

        {/* Content */}
        <div className="bg-card rounded-xl border p-6">
          {step === 'select-value' && renderSelectValue()}
          {step === 'card-form' && renderCardForm()}
          {step === 'success' && renderSuccess()}
        </div>
      </div>
    </Layout>
  );
}
