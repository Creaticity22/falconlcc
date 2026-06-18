import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type NudgeTone = "warning" | "positive" | "info";
interface Nudge {
  id: string;
  tone: NudgeTone;
  message: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const dismissKey = (id: string) => `falcon.nudge.${id}.${today()}`;

const toneClass: Record<NudgeTone, string> = {
  warning: "border-l-4 border-l-amber-500 bg-amber-500/5",
  positive: "border-l-4 border-l-success bg-success/5",
  info: "border-l-4 border-l-primary bg-primary/5",
};

export default function FalconNudges() {
  const { user } = useAuth();

  const { data: budget } = useQuery({
    queryKey: ["nudge-budget", user?.id],
    queryFn: async () => {
      const month = new Date().toISOString().slice(0, 7);
      const { data } = await supabase
        .from("budgets")
        .select("monthly_income, categories")
        .eq("user_id", user!.id)
        .eq("month", month)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: expenses } = useQuery({
    queryKey: ["nudge-expenses", user?.id],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data } = await supabase
        .from("expenses")
        .select("amount, category, expense_date")
        .eq("user_id", user!.id)
        .gte("expense_date", startOfMonth.toISOString().split("T")[0]);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: goals } = useQuery({
    queryKey: ["nudge-goals", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("savings_goals")
        .select("id, updated_at")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const [, force] = useState(0);
  const isDismissed = (id: string) =>
    typeof window !== "undefined" && !!localStorage.getItem(dismissKey(id));
  const dismiss = (id: string) => {
    localStorage.setItem(dismissKey(id), "1");
    force((n) => n + 1);
  };

  if (!budget || !expenses || expenses.length < 3) return null;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  const halfwayPoint = daysInMonth / 2;
  const dayOfMonth = now.getDate();

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const income = Number(budget.monthly_income) || 0;

  const cats = (Array.isArray(budget.categories) ? budget.categories : []) as Array<{
    name: string;
    planned: number;
  }>;

  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount);
  }

  const nudges: Nudge[] = [];

  // Overspend warning
  for (const c of cats) {
    if (!c.planned || c.planned <= 0) continue;
    const spent = byCategory[c.name] ?? 0;
    const pct = (spent / c.planned) * 100;
    if (pct > 80 && daysRemaining > 7) {
      nudges.push({
        id: `overspend-${c.name}`,
        tone: "warning",
        message: `⚠️ You've spent ${Math.round(pct)}% of your ${c.name} budget — ${daysRemaining} days still to go.`,
      });
    }
  }

  // On track
  if (income > 0 && dayOfMonth >= halfwayPoint) {
    const pct = (totalSpent / income) * 100;
    if (pct < 50) {
      nudges.push({
        id: "on-track",
        tone: "positive",
        message: `🎉 You're on track this month — only ${Math.round(pct)}% of your budget spent so far.`,
      });
    }
  }

  // Top category
  const topEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  if (topEntry) {
    nudges.push({
      id: `top-${topEntry[0]}`,
      tone: "info",
      message: `📊 Your biggest spend this month is ${topEntry[0]} at £${topEntry[1].toFixed(0)}.`,
    });
  }

  // Savings encouragement
  if (goals && goals.length > 0) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const noneUpdated = goals.every(
      (g) => !g.updated_at || new Date(g.updated_at) < startOfMonth,
    );
    if (noneUpdated) {
      nudges.push({
        id: "savings-encourage",
        tone: "positive",
        message: "💰 You haven't added to your savings goals this month — even £5 helps!",
      });
    }
  }

  const visible = nudges.filter((n) => !isDismissed(n.id)).slice(0, 2);
  if (visible.length === 0) return null;

  return (
    <section className="mb-8" aria-label="Falcon Nudges">
      <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">
        Falcon Nudges
      </h2>
      <div className="space-y-2">
        <AnimatePresence>
          {visible.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`rounded-xl p-3 pr-2 flex items-start gap-2 ${toneClass[n.tone]}`}
            >
              <p className="text-sm flex-1 leading-snug">{n.message}</p>
              <button
                onClick={() => dismiss(n.id)}
                aria-label="Dismiss"
                className="w-7 h-7 grid place-items-center rounded-full hover:bg-secondary/70 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
