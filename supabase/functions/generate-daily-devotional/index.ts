import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Today in BRT
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" });
    const today = fmt.format(new Date()); // YYYY-MM-DD

    // Skip if already exists for today
    const { data: existing } = await supabase
      .from("devotionals")
      .select("id")
      .eq("featured_date", today)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ ok: true, skipped: true, id: existing.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate with Lovable AI
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você é um pastor cristão evangélico que escreve devocionais curtos, edificantes e bíblicos em português brasileiro. Responda APENAS com JSON válido.",
          },
          {
            role: "user",
            content: `Crie um devocional para hoje (${today}). Responda em JSON com os campos:
{
  "title": "título curto e inspirador (até 60 caracteres)",
  "verse_reference": "referência bíblica (ex: João 3:16)",
  "verse_text": "texto completo do versículo",
  "content": "reflexão de 3 a 5 parágrafos, tom acolhedor, prático, encorajador (300-500 palavras)"
}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      console.error("AI error", aiRes.status, err);
      return new Response(JSON.stringify({ error: "AI failed", detail: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const raw = aiJson.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    const { data: inserted, error } = await supabase
      .from("devotionals")
      .insert({
        title: String(parsed.title ?? "Palavra do dia").slice(0, 200),
        verse_reference: parsed.verse_reference ?? null,
        verse_text: parsed.verse_text ?? null,
        content: String(parsed.content ?? ""),
        is_system: true,
        status: "approved",
        featured_date: today,
        user_id: null,
      })
      .select("id")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, id: inserted.id, date: today }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
