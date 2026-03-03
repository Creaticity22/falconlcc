import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_SYSTEM_PROMPT = `You are Falcon, a friendly financial literacy companion for young people aged 15–21 in the UK.

Your role:
- Help users understand budgeting, saving, interest, tax, debt, and basic investing
- Use simple, clear language appropriate for teens and young adults
- Be encouraging, positive, and non-patronising
- Give practical, actionable tips with UK-specific context (pounds, UK tax system, UK resources)
- Ask clarifying questions when helpful
- Use examples and analogies that resonate with young people

Important rules:
- NEVER provide personalised financial advice — you are educational only
- Always clarify you're not a regulated financial adviser
- If someone asks about specific investments or complex financial decisions, suggest they speak to a qualified FCA-registered adviser
- Keep responses concise and scannable — use bullet points and short paragraphs
- Use emoji sparingly to keep the tone friendly 🙂
- NEVER invent or fabricate URLs. Only link to resources from the TRUSTED RESOURCES list below.
- When your answer covers budgeting, saving, debt, or the economy, naturally suggest 1–2 relevant resources from the list. Introduce them briefly as "Here are some trusted resources from organisations like MoneyHelper, Young Money, Money Ready, or the Bank of England."
- Format resource links as markdown: [Title](url) — source_name`;

/** Detect which resource topics are relevant to the latest user message */
function detectTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const map: Record<string, string[]> = {
    budgeting: ["budget", "budgeting", "spending", "expense"],
    saving: ["saving", "save", "savings account", "emergency fund"],
    debt: ["debt", "loan", "borrow", "credit card", "bnpl", "buy now pay later"],
    investing_basics: ["invest", "investing", "stocks", "shares", "index fund"],
    economy: ["economy", "inflation", "interest rate", "bank of england"],
  };
  const found: string[] = [];
  for (const [topic, keywords] of Object.entries(map)) {
    if (keywords.some((kw) => lower.includes(kw))) found.push(topic);
  }
  return found;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Detect topics from the latest user message
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    const topics = lastUserMsg ? detectTopics(lastUserMsg.content) : [];

    // Query resources table for matching topics
    let resourceBlock = "";
    if (topics.length > 0) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseKey);

      const { data: resources } = await sb
        .from("resources")
        .select("title, url, source_name, description, topic")
        .in("topic", topics)
        .limit(6);

      if (resources && resources.length > 0) {
        const lines = resources.map(
          (r: any) => `- [${r.title}](${r.url}) — ${r.source_name} (topic: ${r.topic}): ${r.description}`
        );
        resourceBlock = `\n\nTRUSTED RESOURCES (use ONLY these URLs when suggesting links):\n${lines.join("\n")}`;
      }
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + resourceBlock;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
