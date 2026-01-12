import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PixChargeRequest {
  amount: number; // in cents
  description?: string;
  payerName?: string;
  payerCpf?: string;
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('EFI_CLIENT_ID');
  const clientSecret = Deno.env.get('EFI_CLIENT_SECRET');
  const certificate = Deno.env.get('EFI_CERTIFICATE');

  if (!clientId || !clientSecret || !certificate) {
    throw new Error('Missing EFI Bank credentials');
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  // EFI Bank OAuth2 endpoint
  const response = await fetch('https://pix.api.efipay.com.br/oauth/token', {
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

async function createPixCharge(accessToken: string, charge: PixChargeRequest) {
  const txid = crypto.randomUUID().replace(/-/g, '').substring(0, 35);
  
  const chargeBody: Record<string, unknown> = {
    calendario: {
      expiracao: 3600, // 1 hour expiration
    },
    valor: {
      original: (charge.amount / 100).toFixed(2),
    },
    chave: Deno.env.get('EFI_PIX_KEY') || '', // PIX key from EFI account
    infoAdicionais: [
      {
        nome: 'App da Oração',
        valor: charge.description || 'Doação',
      },
    ],
  };

  // Add payer info if provided
  if (charge.payerName && charge.payerCpf) {
    chargeBody.devedor = {
      nome: charge.payerName,
      cpf: charge.payerCpf.replace(/\D/g, ''),
    };
  }

  const response = await fetch(`https://pix.api.efipay.com.br/v2/cob/${txid}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(chargeBody),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('EFI Charge Error:', error);
    throw new Error('Failed to create PIX charge');
  }

  const chargeData = await response.json();
  
  // Get QR Code
  const qrResponse = await fetch(`https://pix.api.efipay.com.br/v2/loc/${chargeData.loc.id}/qrcode`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!qrResponse.ok) {
    const error = await qrResponse.text();
    console.error('EFI QR Error:', error);
    throw new Error('Failed to get QR Code');
  }

  const qrData = await qrResponse.json();

  return {
    txid,
    pixCopiaECola: chargeData.pixCopiaECola,
    qrcode: qrData.qrcode,
    imagemQrcode: qrData.imagemQrcode,
    valor: chargeData.valor.original,
    expiracao: chargeData.calendario.expiracao,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PixChargeRequest = await req.json();

    if (!body.amount || body.amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating PIX charge for amount:', body.amount);

    const accessToken = await getAccessToken();
    const charge = await createPixCharge(accessToken, body);

    console.log('PIX charge created successfully:', charge.txid);

    return new Response(
      JSON.stringify(charge),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating PIX charge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
