import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { renderBrandedEmail } from "../_shared/email-layout.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "App da Oração <no-reply@appdaoracao.com>";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirect_to } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: redirect_to || "https://appdaoracao.com/redefinir-senha",
      },
    });

    // Do not reveal whether the email exists.
    if (linkError) {
      console.error("Generate recovery link error:", linkError.message);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resetUrl = linkData?.properties?.action_link || "";
    const userName =
      linkData?.user?.user_metadata?.display_name ||
      linkData?.user?.user_metadata?.name ||
      linkData?.user?.user_metadata?.full_name ||
      "";

    if (resetUrl) {
      const html = renderBrandedEmail({
        heading: "Redefinir sua senha 🔐",
        preheader: "Link para criar uma nova senha no App da Oração",
        content: `
          <p style="margin:0 0 12px 0;">Olá${userName ? `, <strong>${userName}</strong>` : ""}!</p>
          <p style="margin:0 0 12px 0;">Recebemos uma solicitação para redefinir a senha da sua conta no <strong>App da Oração</strong>. Clique no botão abaixo para criar uma nova senha:</p>
        `,
        ctaLabel: "Redefinir minha senha",
        ctaUrl: resetUrl,
        footerNote: "Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este e-mail — sua conta continua segura.",
      });

      const sendResp = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: "Redefinir sua senha — App da Oração",
        html,
      });
      console.log("Recovery email sent:", sendResp);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Custom recovery error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
