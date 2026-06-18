import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Bird, Loader2, Trash2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import FalconLogo from "@/components/FalconLogo";
import ResourceCard from "@/components/ResourceCard";
import { useAuth } from "@/hooks/useAuth";
import { useResources, type Resource } from "@/hooks/useResources";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackOnce } from "@/lib/analytics";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED_PROMPTS = [
  "Help me make a simple budget",
  "Explain what interest is in simple terms",
  "How can I save £50 in 2 months?",
  "What's the difference between saving and investing?",
];

const INTRO_MESSAGE =
  "Hi! I'm Falcon AI 👋 I can help with budgeting, saving, debt, tax, and investing basics. I'm educational only and not a financial adviser — for personalised advice please speak to an FCA-registered adviser.";

const DISTRESS_KEYWORDS = [
  "suicide",
  "kill myself",
  "self harm",
  "self-harm",
  "no point",
  "can't cope",
  "cant cope",
  "ending it",
];

function hasDistressSignals(text: string): boolean {
  const t = text.toLowerCase();
  return DISTRESS_KEYWORDS.some((kw) => t.includes(kw));
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/falcon-chat`;
const CHAT_STORAGE_KEY = "falcon.chat.history";
const MAX_STORED_MESSAGES = 20;

function loadStoredMessages(): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Msg =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    );
  } catch {
    return [];
  }
}

export default function AIChat() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>(() => loadStoredMessages());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefillHandled = useRef(false);

  // Persist messages to localStorage (capped)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const trimmed = messages.slice(-MAX_STORED_MESSAGES);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      /* ignore quota errors */
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  // Handle pre-filled prompt from URL
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !prefillHandled.current && messages.length === 0) {
      prefillHandled.current = true;
      setSearchParams({}, { replace: true });
      send(prompt);
    }
  }, [searchParams]);

  // Detect topics mentioned in the latest assistant message
  const detectedTopics = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return [];
    const text = lastAssistant.content.toLowerCase();
    const topicKeywords: Record<string, string[]> = {
      budgeting: ["budget", "budgeting", "spending plan"],
      saving: ["saving", "savings", "save money", "emergency fund"],
      debt: ["debt", "borrow", "loan", "credit card", "bnpl", "buy now pay later"],
      investing_basics: ["invest", "investing", "stocks", "shares", "index fund"],
      economy: ["economy", "inflation", "interest rate", "bank of england"],
    };
    const found: string[] = [];
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((kw) => text.includes(kw))) found.push(topic);
    }
    return found;
  }, [messages]);

  const { data: chatResources } = useResources(detectedTopics, 2);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    trackOnce("first_ai_message", { length: text.trim().length });
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        toast.error("Please sign in to chat with Falcon.");
        setIsLoading(false);
        return;
      }
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (resp.status === 429) {
        toast.error("Too many requests — please wait a moment and try again.");
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Please add funds in your workspace settings.");
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 md:px-8 py-4 md:py-5 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <FalconLogo showWordmark size={72} className="drop-shadow-[0_0_20px_hsl(268_75%_55%/0.55)]" />
        <div className="ml-auto flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearChat}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear chat
            </Button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-semibold text-primary">AI Companion</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 space-y-6">
            <div className="text-center flex flex-col items-center">
              <div className="mb-4 drop-shadow-[0_0_30px_hsl(268_75%_55%/0.65)]">
                <FalconLogo showWordmark size={140} />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Ask Falcon anything about budgeting, saving, or basic investing. I'll explain it in simple language.
              </p>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm bg-card border border-border/50">
                {INTRO_MESSAGE}
              </div>
            </div>
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  className="w-full text-left p-3 rounded-xl border border-border/50 bg-card text-sm hover:border-primary/30 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground text-center px-4">
              Falcon AI is focused on money and finance topics. For other questions, it may not be able to help.
            </p>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border/50 rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
            {msg.role === "assistant" && hasDistressSignals(msg.content) && (
              <div className="mt-2 max-w-[85%] rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-foreground">
                💙 It sounds like things might be tough right now. Falcon is a money app, but your wellbeing matters more. Please reach out to{" "}
                <a
                  href="https://youngminds.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  Young Minds
                </a>{" "}
                or call Samaritans on{" "}
                <a href="tel:116123" className="underline font-semibold">
                  116 123
                </a>{" "}
                — they're free and available 24/7.
              </div>
            )}
          </motion.div>
        ))}

        {/* Want to go deeper? */}
        {!isLoading && chatResources && chatResources.length > 0 && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ml-0 max-w-[85%]">
            <p className="text-xs font-display font-semibold text-muted-foreground mb-2">Want to go deeper?</p>
            <div className="space-y-2">
              {chatResources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </motion.div>
        )}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-lg">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about money..."
            className="flex-1 h-12 rounded-xl bg-muted px-4 text-sm border-0 outline-none focus:ring-2 ring-primary/20"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-xl gradient-primary text-primary-foreground border-0 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[9px] text-muted-foreground text-center mt-2">
          Falcon is educational only — not financial advice
        </p>
      </div>
    </div>
  );
}
