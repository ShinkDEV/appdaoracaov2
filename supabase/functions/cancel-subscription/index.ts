import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
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

    const tokenStr = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(tokenStr);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    const body = await req.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Missing subscriptionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the subscription belongs to the user
    const serviceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: subscription, error: subError } = await serviceRoleClient
      .from('subscriptions')
      .select('*')
      .eq('mercadopago_subscription_id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      console.error('Subscription not found or does not belong to user:', subError);
      return new Response(
        JSON.stringify({ error: 'Assinatura não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (subscription.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: 'Assinatura já está cancelada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cancel with Mercado Pago
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!accessToken) {
      throw new Error('Missing Mercado Pago credentials');
    }

    console.log('Cancelling subscription on Mercado Pago:', subscriptionId);

    const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'cancelled',
      }),
    });

    const mpResult = await mpResponse.json();

    console.log('Mercado Pago response:', JSON.stringify(mpResult, null, 2));

    if (!mpResponse.ok) {
      console.error('Mercado Pago cancellation error:', mpResult);
      // If MP returns 404, the subscription might already be cancelled or doesn't exist
      // We should still update our database
      if (mpResponse.status !== 404) {
        return new Response(
          JSON.stringify({ error: 'Erro ao cancelar assinatura no Mercado Pago', details: mpResult }),
          { status: mpResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update subscription in database
    const { error: updateError } = await serviceRoleClient
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar assinatura no banco de dados' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Subscription cancelled successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Assinatura cancelada com sucesso',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
