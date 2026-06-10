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
    everyday_money: ["everyday money", "bills", "housing", "rent", "pay cheque", "payslip"],
    benefits: ["benefits", "universal credit", "entitled", "support payment"],
    financial_independence: ["financial independence", "leaving home", "move out", "first job"],
    teacher_resources: ["teacher", "classroom", "lesson plan", "curriculum", "school"],
    scams: ["scam", "fraud", "phishing", "fake", "con artist"],
    cost_of_living: ["cost of living", "energy bills", "rising costs", "afford"],
    student_finance: ["student finance", "student loan", "tuition", "maintenance loan", "university fee"],
    education_transition: ["uni", "university", "college", "sixth form", "apprenticeship"],
    disability_support: ["disability", "disabled", "accessibility", "additional needs"],
    care_leavers: ["care leaver", "care home", "foster", "looked after"],
    hardship: ["hardship", "struggling", "money worries", "debt advice", "food bank"],
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
    // --- Authentication: require a valid user JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const jwt = authHeader.slice("Bearer ".length);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(jwt);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const rawMessages = body?.messages;

    // --- Input validation: shape, size, role, length ---
    const MAX_MESSAGES = 40;
    const MAX_CONTENT_CHARS = 2000;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(JSON.stringify({ error: "messages must be a non-empty array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (rawMessages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: `messages exceeds maximum of ${MAX_MESSAGES}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
    for (const m of rawMessages) {
      if (!m || typeof m !== "object") {
        return new Response(JSON.stringify({ error: "invalid message entry" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (m.role !== "user" && m.role !== "assistant") {
        return new Response(JSON.stringify({ error: "message role must be 'user' or 'assistant'" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (typeof m.content !== "string" || m.content.length === 0) {
        return new Response(JSON.stringify({ error: "message content must be a non-empty string" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (m.content.length > MAX_CONTENT_CHARS) {
        return new Response(JSON.stringify({ error: `message content exceeds ${MAX_CONTENT_CHARS} chars` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      messages.push({ role: m.role, content: m.content });
    }

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
