import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CardPaymentRequest {
  token: string;
  transactionAmount: number;
  installments: number;
  paymentMethodId: string;
  issuerId?: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

interface PublicKeyRequest {
  action: 'get-public-key';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid auth for all operations
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const publicKey = Deno.env.get('MERCADOPAGO_PUBLIC_KEY');

    if (!accessToken) {
      throw new Error('Missing Mercado Pago credentials');
    }

    const body = await req.json();

    // Return public key for frontend SDK (now requires authentication)
    if (body.action === 'get-public-key') {
      return new Response(
        JSON.stringify({ publicKey }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process card payment
    const paymentData: CardPaymentRequest = body;

    if (!paymentData.token || !paymentData.transactionAmount || !paymentData.payer?.email) {
      return new Response(
        JSON.stringify({ error: 'Missing required payment data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing Mercado Pago payment:', {
      userId,
      amount: paymentData.transactionAmount,
      installments: paymentData.installments,
      email: paymentData.payer.email,
    });

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        token: paymentData.token,
        transaction_amount: paymentData.transactionAmount,
        installments: paymentData.installments,
        payment_method_id: paymentData.paymentMethodId,
        issuer_id: paymentData.issuerId,
        description: 'Doação App da Oração',
        statement_descriptor: 'APP DA ORACAO',
        payer: {
          email: paymentData.payer.email,
          identification: paymentData.payer.identification,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago API Error:', result);
      const errorMessage = result.message || result.cause?.[0]?.description || 'Payment failed';
      return new Response(
        JSON.stringify({ error: errorMessage, details: result }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment processed successfully:', {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      userId,
    });

    return new Response(
      JSON.stringify({
        id: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        transactionAmount: result.transaction_amount,
        installments: result.installments,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
