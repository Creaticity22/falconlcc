import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAwardXP } from "@/hooks/useGamification";
import { toast } from "sonner";

export const CHALLENGES = [
  {
    id: "no_spend_weekend",
    title: "No-spend weekend",
    description: "Log a full weekend without spending money.",
    xp: 20,
    manual: true,
  },
  {
    id: "first_50_saved",
    title: "Save your first £50",
    description: "Auto-completes when a savings goal reaches £50.",
    xp: 30,
    manual: false,
  },
  {
    id: "diary_4_weeks",
    title: "Log 4 weeks in a row in Money Diary",
    description: "Auto-completes from your diary streak.",
    xp: 25,
    manual: false,
  },
];

export default function ChallengesSection() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const awardXP = useAwardXP();

  const { data: completions = [] } = useQuery({
    queryKey: ["challenge-completions", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("challenge_completions")
        .select("challenge_id")
        .eq("user_id", user!.id);
      return data?.map((c) => c.challenge_id) ?? [];
    },
    enabled: !!user,
  });

  // Data needed for auto-completion checks
  const { data: autoData } = useQuery({
    queryKey: ["challenge-auto-data", user?.id],
    queryFn: async () => {
      const [{ data: goals }, { data: diary }] = await Promise.all([
        supabase.from("savings_goals").select("current_amount").eq("user_id", user!.id),
        supabase
          .from("money_diary_entries")
          .select("week_start_date")
          .eq("user_id", user!.id)
          .order("week_start_date", { ascending: false })
          .limit(8),
      ]);
      const hitFifty = (goals ?? []).some((g) => Number(g.current_amount) >= 50);
      const weeks = (diary ?? []).map((d) => d.week_start_date as string);
      const fourInRow = hasFourConsecutiveWeeks(weeks);
      return { hitFifty, fourInRow };
    },
    enabled: !!user,
  });

  const complete = useMutation({
    mutationFn: async ({ id, xp }: { id: string; xp: number }) => {
      const { error } = await supabase
        .from("challenge_completions")
        .insert({ user_id: user!.id, challenge_id: id });
      if (error && error.code !== "23505") throw error;
      return xp;
    },
    onSuccess: (xp, vars) => {
      qc.invalidateQueries({ queryKey: ["challenge-completions"] });
      awardXP.mutate({ amount: xp, reason: `Challenge: ${vars.id}` });
      toast.success(`Challenge complete! +${xp} XP`);
    },
  });

  // Auto-award eligible challenges
  useEffect(() => {
    if (!autoData || !user) return;
    if (autoData.hitFifty && !completions.includes("first_50_saved")) {
      complete.mutate({ id: "first_50_saved", xp: 30 });
    }
    if (autoData.fourInRow && !completions.includes("diary_4_weeks")) {
      complete.mutate({ id: "diary_4_weeks", xp: 25 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoData, completions.join("|")]);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent" />
        <h2 className="font-display font-semibold text-base">Challenges</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Quick wins that build money habits.
      </p>
      <div className="space-y-2">
        {CHALLENGES.map((c, i) => {
          const done = completions.includes(c.id);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl p-4 border flex items-center gap-3 ${
                done
                  ? "bg-success/5 border-success/30"
                  : "bg-card border-border/50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
                  done ? "bg-success/15" : "bg-primary/10"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Star className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.description}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-accent">+{c.xp} XP</div>
                {!done && c.manual && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1 h-7 text-xs rounded-lg"
                    onClick={() => complete.mutate({ id: c.id, xp: c.xp })}
                    disabled={complete.isPending}
                  >
                    Mark done
                  </Button>
                )}
                {done && <p className="text-[10px] text-success font-semibold mt-1">Done ✓</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function hasFourConsecutiveWeeks(weekStarts: string[]): boolean {
  if (weekStarts.length < 4) return false;
  const sorted = [...new Set(weekStarts)]
    .map((w) => new Date(w).getTime())
    .sort((a, b) => b - a);
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.round((sorted[i - 1] - sorted[i]) / (1000 * 60 * 60 * 24));
    if (diffDays === 7) {
      run++;
      if (run >= 4) return true;
    } else {
      run = 1;
    }
  }
  return false;
}
