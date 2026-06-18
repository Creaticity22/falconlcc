import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Sparkles, ChevronDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import HeroBanner from "@/components/HeroBanner";
import GoalCard from "@/components/GoalCard";
import GoalTemplateSelector from "@/components/GoalTemplateSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useAwardXP } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent, trackOnce } from "@/lib/analytics";
import { toast } from "sonner";

export default function Goals() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const awardXP = useAwardXP();
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [templateCode, setTemplateCode] = useState<string | null>(null);
  const [roundUpOpen, setRoundUpOpen] = useState(false);

  const { data: goals, isLoading } = useQuery({
    queryKey: ["all-goals", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: monthExpenses } = useQuery({
    queryKey: ["round-up-expenses", user?.id],
    queryFn: async () => {
      const start = new Date();
      start.setDate(1);
      const { data } = await supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", user!.id)
        .gte("expense_date", start.toISOString().split("T")[0]);
      return data ?? [];
    },
    enabled: !!user,
  });

  const roundUpTotal = useMemo(() => {
    if (!monthExpenses) return 0;
    return monthExpenses.reduce((sum, e) => {
      const amt = Number(e.amount);
      return sum + (Math.ceil(amt) - amt);
    }, 0);
  }, [monthExpenses]);

  const openRoundUpGoal = () => {
    setName("Round-up savings");
    setTarget("50");
    setDesc("Small change adds up — start a round-up savings habit.");
    setTemplateCode(null);
    setShowForm(true);
    setOpen(true);
  };

  const createGoal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("savings_goals").insert({
        user_id: user!.id,
        name,
        target_amount: Number(target),
        target_date: date || null,
        description: desc || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-goals"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      resetForm();
      toast.success("Goal created! 🎯");
      awardXP.mutate({ amount: 20, reason: "New savings goal" });
      trackEvent("goal_created");
      if (!goals || goals.length === 0) trackOnce("first_goal_created");
    },
  });

  const resetForm = () => {
    setOpen(false);
    setShowForm(false);
    setName("");
    setTarget("");
    setDate("");
    setDesc("");
    setTemplateCode(null);
  };

  const handleTemplateSelect = (t: any) => {
    setName(t.name);
    setTarget(String(t.suggested_min_amount));
    setDesc(t.description);
    setTemplateCode(t.code);
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + t.suggested_timeframe_months);
    setDate(futureDate.toISOString().split("T")[0]);
    setShowForm(true);
  };

  return (
    <AppLayout>
      <div className="pt-6 md:pt-10 pb-6 md:pb-8 space-y-4">
        <HeroBanner
          eyebrow="Savings"
          title="My Goals"
          sideBySideFrom="md"
          logoSizeSm={72}
          logoSizeMd={96}
          logoSizeLg={120}
        />
        <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl gradient-primary text-primary-foreground border-0">
              <Plus className="w-4 h-4 mr-1" /> New goal
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {showForm ? "Set up your goal" : "Create new goal"}
              </DialogTitle>
            </DialogHeader>

            {!showForm ? (
              <GoalTemplateSelector
                onSelect={handleTemplateSelect}
                onSkip={() => setShowForm(true)}
              />
            ) : (
              <div className="space-y-4 pt-2">
                {templateCode && (
                  <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                )}
                <Input placeholder="Goal name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" />
                <Input type="number" placeholder="Target amount (£)" value={target} onChange={(e) => setTarget(e.target.value)} className="h-12 rounded-xl" />
                <Input type="date" placeholder="Target date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl" />
                {!templateCode && (
                  <Textarea placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} className="rounded-xl" />
                )}
                <Button
                  onClick={() => createGoal.mutate()}
                  disabled={!name || !target || createGoal.isPending}
                  className="w-full h-12 rounded-xl gradient-primary text-primary-foreground border-0"
                >
                  Create goal
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : goals && goals.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center">
            <Target className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display font-semibold text-lg">No goals yet</h2>
          <p className="text-sm text-muted-foreground">Start saving towards something that matters to you</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {goals?.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GoalCard
                id={g.id}
                name={g.name}
                targetAmount={Number(g.target_amount)}
                currentAmount={Number(g.current_amount)}
                targetDate={g.target_date ?? undefined}
              />
            </motion.div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
