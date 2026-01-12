import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CardPaymentRequest {
  amount: number; // in cents
  cardToken: string;
  installments: number;
  customer: {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
  };
  billingAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
  };
}

interface TokenizeCardRequest {
  brand: string;
  number: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('EFI_CLIENT_ID');
  const clientSecret = Deno.env.get('EFI_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing EFI Bank credentials');
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  // EFI Bank OAuth2 endpoint for charges API (not PIX - no mTLS required)
  const response = await fetch('https://cobrancas.api.efipay.com.br/v1/authorize', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('EFI Auth Error:', error);
    throw new Error('Failed to authenticate with EFI Bank');
  }

  const data = await response.json();
  return data.access_token;
}

async function getPaymentToken(accessToken: string, card: TokenizeCardRequest): Promise<string> {
  const response = await fetch('https://cobrancas.api.efipay.com.br/v1/card', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      brand: card.brand,
      number: card.number,
      cvv: card.cvv,
      expiration_month: card.expirationMonth,
      expiration_year: card.expirationYear,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('EFI Card Token Error:', error);
    throw new Error('Failed to tokenize card');
  }

  const data = await response.json();
  return data.data.payment_token;
}

async function createCardPayment(accessToken: string, payment: CardPaymentRequest) {
  // First, create the charge
  const chargeResponse = await fetch('https://cobrancas.api.efipay.com.br/v1/charge', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [
        {
          name: 'Doação App da Oração',
          value: payment.amount,
          amount: 1,
        },
      ],
    }),
  });

  if (!chargeResponse.ok) {
    const error = await chargeResponse.text();
    console.error('EFI Charge Create Error:', error);
    throw new Error('Failed to create charge');
  }

  const chargeData = await chargeResponse.json();
  const chargeId = chargeData.data.charge_id;

  // Then, pay the charge with card
  const payResponse = await fetch(`https://cobrancas.api.efipay.com.br/v1/charge/${chargeId}/pay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payment: {
        credit_card: {
          installments: payment.installments,
          payment_token: payment.cardToken,
          billing_address: {
            street: payment.billingAddress.street,
            number: payment.billingAddress.number,
            neighborhood: payment.billingAddress.neighborhood,
            city: payment.billingAddress.city,
            state: payment.billingAddress.state,
            zipcode: payment.billingAddress.zipcode.replace(/\D/g, ''),
          },
          customer: {
            name: payment.customer.name,
            email: payment.customer.email,
            cpf: payment.customer.cpf.replace(/\D/g, ''),
            phone_number: payment.customer.phone?.replace(/\D/g, '') || '',
          },
        },
      },
    }),
  });

  if (!payResponse.ok) {
    const error = await payResponse.text();
    console.error('EFI Payment Error:', error);
    throw new Error('Failed to process payment');
  }

  const payData = await payResponse.json();

  return {
    chargeId,
    status: payData.data.status,
    total: payData.data.total,
    installments: payment.installments,
    installmentValue: Math.round(payment.amount / payment.installments),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = await getAccessToken();

    // Route: /tokenize - Get payment token for card
    if (path === 'tokenize') {
      const body: TokenizeCardRequest = await req.json();
      
      if (!body.number || !body.cvv || !body.expirationMonth || !body.expirationYear || !body.brand) {
        return new Response(
          JSON.stringify({ error: 'Missing card details' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentToken = await getPaymentToken(accessToken, body);

      return new Response(
        JSON.stringify({ paymentToken }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: /pay - Process payment
    if (path === 'pay') {
      const body: CardPaymentRequest = await req.json();

      if (!body.amount || body.amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid amount' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!body.cardToken) {
        return new Response(
          JSON.stringify({ error: 'Missing card token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Processing card payment for amount:', body.amount);

      const result = await createCardPayment(accessToken, body);

      console.log('Payment processed successfully:', result.chargeId);

      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default: get installments info
    const body = await req.json();
    const amount = body.amount || 0;
    
    // Calculate installment options (up to 12x)
    const installments = [];
    for (let i = 1; i <= 12; i++) {
      const installmentValue = Math.round(amount / i);
      if (installmentValue >= 500) { // Minimum R$ 5,00 per installment
        installments.push({
          installment: i,
          value: installmentValue,
          total: installmentValue * i,
          hasInterest: i > 1, // Example: interest from 2x
        });
      }
    }

    return new Response(
      JSON.stringify({ installments }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
