import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, PiggyBank, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import HeroBanner from "@/components/HeroBanner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useAwardXP } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackOnce } from "@/lib/analytics";

export default function MoneyWins() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const awardXP = useAwardXP();
  const [text, setText] = useState("");
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");

  const { data: wins } = useQuery({
    queryKey: ["money-wins", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("money_wins")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: goals } = useQuery({
    queryKey: ["wins-goals", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("savings_goals")
        .select("id, name, current_amount, target_amount")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const logWin = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("money_wins").insert({
        user_id: user!.id,
        text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["money-wins"] });
      toast.success("Money win logged! 🏆");
      awardXP.mutate({ amount: 10, reason: "Logged a money win" });
      if (!wins || wins.length === 0) trackOnce("first_win_logged");

      const match = text.match(/£\s*(\d+(?:\.\d+)?)/);
      if (match && goals && goals.length > 0) {
        setPendingAmount(Number(match[1]));
        setSelectedGoalId(goals[0].id);
      }
      setText("");
    },
  });

  const addToGoal = useMutation({
    mutationFn: async () => {
      const goal = goals?.find((g) => g.id === selectedGoalId);
      if (!goal || pendingAmount == null) throw new Error("Missing goal/amount");
      const newAmount = Number(goal.current_amount) + pendingAmount;
      const { error } = await supabase
        .from("savings_goals")
        .update({ current_amount: newAmount })
        .eq("id", goal.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wins-goals"] });
      qc.invalidateQueries({ queryKey: ["all-goals"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success(`£${pendingAmount} added to your goal! 🎯`);
      awardXP.mutate({ amount: 15, reason: "Added a win to a savings goal" });
      setPendingAmount(null);
    },
  });

  return (
    <AppLayout>
      <div className="pt-6 pb-4 space-y-4">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <HeroBanner
          eyebrow="Celebrate"
          title="Money Wins 🏆"
          subtitle="Celebrate your small victories – they all add up!"
          sideBySideFrom="md"
          logoSizeSm={64}
          logoSizeMd={88}
          logoSizeLg={104}
        />
      </div>

      {/* Log a win */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-5 border border-border/50 shadow-sm mb-4"
      >
        <p className="text-sm font-semibold mb-2">This week I…</p>
        <Textarea
          placeholder="e.g. cooked instead of ordering in, paid off £10 of debt, saved my first £50"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="rounded-xl mb-3 text-sm"
          rows={2}
        />
        <Button
          onClick={() => logWin.mutate()}
          disabled={!text.trim() || logWin.isPending}
          className="w-full h-11 rounded-xl gradient-accent text-accent-foreground border-0"
        >
          <Trophy className="w-4 h-4 mr-1" /> Log my win (+10 XP)
        </Button>
      </motion.div>

      <AnimatePresence>
        {pendingAmount !== null && goals && goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 rounded-xl p-4 border border-primary/30 bg-primary/5 flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <PiggyBank className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm flex-1">
                Nice win! Want to add <b>£{pendingAmount}</b> to one of your goals?
              </p>
              <button
                onClick={() => setPendingAmount(null)}
                aria-label="Dismiss"
                className="w-7 h-7 grid place-items-center rounded-full hover:bg-secondary/70 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
              <SelectTrigger className="h-10 rounded-xl bg-background">
                <SelectValue placeholder="Choose a goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => addToGoal.mutate()}
              disabled={!selectedGoalId || addToGoal.isPending}
              size="sm"
              className="rounded-xl gradient-primary text-primary-foreground border-0"
            >
              Add it (+15 XP)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past wins */}
      {wins && wins.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-base mb-3">Your wins</h2>
          <div className="space-y-2">
            {wins.map((w: any, i: number) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-3 border border-border/50 flex items-start gap-3"
              >
                <Trophy className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{w.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(w.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </AppLayout>
  );
}
