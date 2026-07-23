// Send email via Resend connector (gateway)
// Public endpoint — validate inputs carefully

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM_DEFAULT = "App da Oração <no-reply@appdaoracao.com>";

interface SendEmailBody {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  reply_to?: string;
}

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: SendEmailBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const recipients = Array.isArray(body.to) ? body.to : [body.to];
  if (!recipients.length || !recipients.every(isEmail)) {
    return new Response(JSON.stringify({ error: "Invalid recipient email" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!body.subject || typeof body.subject !== "string" || body.subject.length > 200) {
    return new Response(JSON.stringify({ error: "Invalid subject" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!body.html && !body.text) {
    return new Response(JSON.stringify({ error: "Provide html or text" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payload: Record<string, unknown> = {
    from: body.from || FROM_DEFAULT,
    to: recipients,
    subject: body.subject,
  };
  if (body.html) payload.html = body.html;
  if (body.text) payload.text = body.text;
  if (body.reply_to && isEmail(body.reply_to)) payload.reply_to = body.reply_to;

  const resp = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const respText = await resp.text();
  if (!resp.ok) {
    console.error(`Resend error [${resp.status}]: ${respText}`);
    return new Response(
      JSON.stringify({ error: "Send failed", status: resp.status, details: respText }),
      { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(respText, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
