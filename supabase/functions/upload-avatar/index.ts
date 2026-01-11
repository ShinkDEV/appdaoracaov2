import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get R2 credentials
    const accountId = Deno.env.get('R2_ACCOUNT_ID');
    const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY');
    const bucketName = Deno.env.get('R2_BUCKET_NAME');

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return new Response(
        JSON.stringify({ error: 'R2 configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique filename
    const fileName = `${user.id}/${user.id}-${Date.now()}.jpg`;
    
    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Create AWS4 signature for R2
    const date = new Date();
    const dateStr = date.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 8);
    const dateTimeStr = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    
    const region = 'auto';
    const service = 's3';
    const host = `${accountId}.r2.cloudflarestorage.com`;
    const url = `https://${host}/${bucketName}/${fileName}`;
    
    // Create canonical request
    const method = 'PUT';
    const canonicalUri = `/${bucketName}/${fileName}`;
    const canonicalQueryString = '';
    const payloadHash = await sha256Hex(new Uint8Array(fileBuffer));
    
    const canonicalHeaders = [
      `content-type:${file.type || 'image/jpeg'}`,
      `host:${host}`,
      `x-amz-content-sha256:${payloadHash}`,
      `x-amz-date:${dateTimeStr}`,
    ].join('\n') + '\n';
    
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
    
    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');
    
    const canonicalRequestHash = await sha256Hex(new TextEncoder().encode(canonicalRequest));
    
    // Create string to sign
    const credentialScope = `${dateStr}/${region}/${service}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      dateTimeStr,
      credentialScope,
      canonicalRequestHash,
    ].join('\n');
    
    // Calculate signature
    const signingKey = await getSignatureKey(secretAccessKey, dateStr, region, service);
    const signature = await hmacHex(signingKey, stringToSign);
    
    // Create authorization header
    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    // Upload to R2
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'image/jpeg',
        'Host': host,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': dateTimeStr,
        'Authorization': authorizationHeader,
      },
      body: fileBuffer,
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('R2 upload error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to upload to R2', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Construct public URL
    const publicUrl = `https://pub-45973938291a4fa2a2bcfb9a2c6a9aec.r2.dev/${fileName}`;
    
    // Update profile with new photo URL
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ photo_url: publicUrl })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Profile update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, url: publicUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions for AWS4 signing
async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const keyBuffer = key instanceof Uint8Array ? key.buffer as ArrayBuffer : key;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

async function hmacHex(key: ArrayBuffer, data: string): Promise<string> {
  const result = await hmac(key, data);
  return Array.from(new Uint8Array(result))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<ArrayBuffer> {
  const kDate = await hmac(new TextEncoder().encode('AWS4' + key), dateStamp);
  const kRegion = await hmac(kDate, regionName);
  const kService = await hmac(kRegion, serviceName);
  const kSigning = await hmac(kService, 'aws4_request');
  return kSigning;
}
