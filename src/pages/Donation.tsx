import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Copy, Check, CreditCard, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { initMercadoPago, CardNumber, ExpirationDate, SecurityCode, createCardToken } from '@mercadopago/sdk-react';

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

export default function Donation() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select-value');
  const [donationType, setDonationType] = useState<DonationType>('one-time');
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMpInitialized, setIsMpInitialized] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  
  // Form fields
  const [cardholderName, setCardholderName] = useState('');
  const [cardholderEmail, setCardholderEmail] = useState('');
  const [identificationType, setIdentificationType] = useState('CPF');
  const [identificationNumber, setIdentificationNumber] = useState('');

  const finalValue = selectedValue || (customValue ? parseFloat(customValue) : 0);

  // Fetch public key and initialize Mercado Pago SDK
  useEffect(() => {
    const initMP = async () => {
      if (step === 'card-form' && !isMpInitialized) {
        try {
          const { data, error } = await supabase.functions.invoke('mercadopago-payment', {
            body: { action: 'get-public-key' },
          });

          if (error || !data?.publicKey) {
            console.error('Error fetching public key:', error);
            toast.error('Erro ao carregar formulário de pagamento');
            return;
          }

          setPublicKey(data.publicKey);
          initMercadoPago(data.publicKey, { locale: 'pt-BR' });
          setIsMpInitialized(true);
          console.log('MercadoPago SDK initialized');
        } catch (error) {
          console.error('Error initializing MercadoPago:', error);
          toast.error('Erro ao inicializar pagamento');
        }
      }
    };

    initMP();
  }, [step, isMpInitialized]);

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
    // Validate cardholder name
    if (!cardholderName || cardholderName.trim().length < 3) {
      toast.error('Nome do titular inválido. Digite o nome impresso no cartão.');
      return;
    }

    // Validate CPF
    if (!validateCPF(identificationNumber)) {
      toast.error('CPF inválido. Verifique o número informado.');
      return;
    }

    // Validate email
    if (!cardholderEmail || !cardholderEmail.includes('@')) {
      toast.error('E-mail inválido. Verifique o endereço informado.');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Creating card token...');
      
      // Create card token using the React SDK
      const tokenResponse = await createCardToken({
        cardholderName: cardholderName,
        identificationType: identificationType,
        identificationNumber: identificationNumber.replace(/\D/g, ''),
      });

      console.log('Token response:', tokenResponse);

      if (!tokenResponse?.id) {
        console.error('No token received:', tokenResponse);
        toast.error('Erro ao processar cartão. Verifique os dados.');
        setIsProcessing(false);
        return;
      }

      console.log('Token created successfully:', tokenResponse.id);

      const { data, error } = await supabase.functions.invoke('mercadopago-payment', {
        body: {
          token: tokenResponse.id,
          transactionAmount: finalValue,
          installments: 1,
          paymentMethodId: tokenResponse.first_six_digits ? 'visa' : 'master', // Will be determined by the API
          donationType: donationType,
          payer: {
            email: cardholderEmail,
            identification: {
              type: identificationType,
              number: identificationNumber.replace(/\D/g, ''),
            },
          },
        },
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Erro ao processar pagamento');
      }

      if (data?.error) {
        console.error('Payment API error:', data.error);
        throw new Error(data.error);
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
        console.error('Payment not approved:', data);
        throw new Error(data.statusDetail || data.error || 'Pagamento não aprovado');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento';
      
      // Translate common error messages
      if (errorMessage.includes('cardNumber') || errorMessage.includes('card number')) {
        toast.error('Número do cartão inválido');
      } else if (errorMessage.includes('securityCode') || errorMessage.includes('CVV') || errorMessage.includes('security code')) {
        toast.error('CVV inválido');
      } else if (errorMessage.includes('expirationDate') || errorMessage.includes('expiration')) {
        toast.error('Data de validade inválida');
      } else if (errorMessage.includes('cardholderName')) {
        toast.error('Nome do titular inválido');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSelectValue = () => (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar para início
      </Button>

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
              <button
                key={value}
                onClick={() => handleSelectValue(value)}
                className={cn(
                  "py-3 px-4 rounded-lg text-sm font-semibold transition-all border",
                  selectedValue === value
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background border-border hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                R$ {value}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
            <Input
              type="number"
              placeholder="Outro valor"
              value={customValue}
              onChange={(e) => handleCustomValueChange(e.target.value)}
              className="pl-10"
              min={1}
            />
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

      {!isMpInitialized ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando formulário...</span>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
          <div className="space-y-3">
            <Label className="font-medium">Dados do Cartão</Label>
            
            <div className="space-y-2">
              <div className="h-12 border rounded-md overflow-hidden bg-background">
                <CardNumber 
                  placeholder="Número do cartão"
                  style={{
                    height: '100%',
                    padding: '0 12px',
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 border rounded-md overflow-hidden bg-background">
                  <ExpirationDate 
                    placeholder="MM/AA"
                    style={{
                      height: '100%',
                      padding: '0 12px',
                    }}
                  />
                </div>
                <div className="h-12 border rounded-md overflow-hidden bg-background">
                  <SecurityCode 
                    placeholder="CVV"
                    style={{
                      height: '100%',
                      padding: '0 12px',
                    }}
                  />
                </div>
              </div>
              
              <input 
                type="text" 
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="w-full h-12 px-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Nome impresso no cartão"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Dados Pessoais</Label>
            <input 
              type="email" 
              value={cardholderEmail}
              onChange={(e) => setCardholderEmail(e.target.value)}
              className="w-full h-12 px-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Seu e-mail"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={identificationType}
                onChange={(e) => setIdentificationType(e.target.value)}
                className="h-12 px-3 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
              </select>
              <input 
                type="text" 
                value={identificationNumber}
                onChange={(e) => setIdentificationNumber(formatCPF(e.target.value))}
                className="h-12 px-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold gap-2"
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
      </div>
      <div className="flex items-center justify-center gap-2 text-primary">
        <Heart className="h-5 w-5 fill-primary" />
        <span className="font-medium">Que Deus abençoe você!</span>
      </div>
      <Button 
        variant="outline" 
        className="gap-2"
        onClick={() => {
          setStep('select-value');
          setSelectedValue(null);
          setCustomValue('');
          setCardholderName('');
          setCardholderEmail('');
          setIdentificationNumber('');
        }}
      >
        Fazer outra doação
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-6 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Apoie o App da Oração</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sua contribuição nos ajuda a manter o app gratuito e disponível para todos
            </p>
          </div>

          {/* Content Card */}
          <div className="bg-background rounded-2xl shadow-xl border p-6">
            {step === 'select-value' && renderSelectValue()}
            {step === 'card-form' && renderCardForm()}
            {step === 'success' && renderSuccess()}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Todas as doações são processadas de forma segura
          </p>
        </div>
      </div>
    </Layout>
  );
}
