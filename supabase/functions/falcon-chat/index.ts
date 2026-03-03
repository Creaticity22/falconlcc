import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_SYSTEM_PROMPT = `You are the AI money coach inside the Falcon app for UK young people aged 15–21. Your job is to explain money topics (budgeting, saving, debt, investing basics) in clear, friendly language and help users build confidence.

You are educational only and do not give personalised financial advice or tell users exactly what to buy or do. Always remind users that investing and borrowing involve risk and that they should talk to a trusted adult or regulated adviser for personal decisions.

You have access to a resources table of trusted UK links and videos (for example from MoneyHelper, Young Money, Money Ready/MyBnk, Bank of England, Barclays LifeSkills, Damien Talks Money). When you answer questions about budgeting, saving, debt or investing basics, you may suggest 1–3 relevant items from this table.

Rules for using resources:
- Only use links that already exist in the TRUSTED RESOURCES list below. Do not invent URLs.
- Present them as "trusted resources you can explore if you want to learn more", not as recommendations to take specific financial actions.
- Prefer youth‑focused and charity/official sources for teenagers.
- Format resource links as markdown: [Title](url) — source_name

Additional formatting guidelines:
- Keep responses concise and scannable — use bullet points and short paragraphs.
- Use emoji sparingly to keep the tone friendly 🙂
- Use examples and analogies that resonate with young people.
- Give practical, actionable tips with UK-specific context (pounds, UK tax system, UK resources).`;

/** Detect which resource topics are relevant to the latest user message */
function detectTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const map: Record<string, string[]> = {
    budgeting: ["budget", "budgeting", "spending", "expense"],
    saving: ["saving", "save", "savings account", "emergency fund"],
    debt: ["debt", "loan", "borrow", "credit card", "bnpl", "buy now pay later"],
    investing_basics: ["invest", "investing", "stocks", "shares", "index fund"],
    economy: ["economy", "inflation", "interest rate", "bank of england"],
    financial_literacy: ["financial literacy", "money basics", "money skills", "financial education"],
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
