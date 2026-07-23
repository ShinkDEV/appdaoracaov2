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
const SITE_URL = "https://appdaoracao.com";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, display_name } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email e senha são obrigatórios." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (typeof password !== "string" || password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Senha deve ter pelo menos 6 caracteres." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        display_name: display_name || "",
        name: display_name || "",
        full_name: display_name || "",
      },
    });

    if (createError) {
      const msg = (createError.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        return new Response(
          JSON.stringify({ error: "Este e-mail já está cadastrado." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      console.error("Create user error:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate confirmation link and send via Resend
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: { redirectTo: SITE_URL },
    });

    if (linkError) {
      console.error("Generate signup link error:", linkError);
    }

    const confirmUrl = linkData?.properties?.action_link || "";

    if (confirmUrl) {
      const html = renderBrandedEmail({
        heading: "Bem-vindo(a) ao App da Oração 🙏",
        preheader: "Confirme seu e-mail para começar a orar em comunidade",
        content: `
          <p style="margin:0 0 12px 0;">Olá${display_name ? `, <strong>${display_name}</strong>` : ""}!</p>
          <p style="margin:0 0 12px 0;">Que alegria ter você aqui. Para ativar sua conta e começar a orar em comunidade, confirme seu e-mail clicando no botão abaixo:</p>
        `,
        ctaLabel: "Confirmar meu e-mail",
        ctaUrl: confirmUrl,
        footerNote: "Se você não criou esta conta, pode ignorar este e-mail.",
      });

      const sendResp = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: "Confirme seu cadastro — App da Oração",
        html,
      });
      console.log("Signup email sent:", sendResp);
    }

    return new Response(
      JSON.stringify({ success: true, user_id: createData?.user?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Custom signup error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
