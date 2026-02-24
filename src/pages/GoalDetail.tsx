import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Sparkles, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useAwardXP } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function GoalDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const awardXP = useAwardXP();
  const [addOpen, setAddOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const { data: goal } = useQuery({
    queryKey: ["goal", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: invite } = useQuery({
    queryKey: ["sponsor-invite", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsor_relationships")
        .select("invite_code")
        .eq("young_person_user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const addSavings = useMutation({
    mutationFn: async () => {
      const newAmount = Number(goal!.current_amount) + Number(amount);
      const { error } = await supabase
        .from("savings_goals")
        .update({ current_amount: newAmount })
        .eq("id", id!);
      if (error) throw error;
      return newAmount;
    },
    onSuccess: (newAmount) => {
      qc.invalidateQueries({ queryKey: ["goal", id] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["all-goals"] });
      setAddOpen(false);
      setAmount("");
      toast.success(`Added £${Number(amount).toFixed(2)} to savings! 🎉`);
      awardXP.mutate({ amount: 15, reason: "Added to savings" });

      // Milestone XP
      const pct = (newAmount / Number(goal!.target_amount)) * 100;
      if (pct >= 100) awardXP.mutate({ amount: 50, reason: "Goal reached! 🏆" });
      else if (pct >= 50) awardXP.mutate({ amount: 25, reason: "50% milestone" });
      else if (pct >= 25) awardXP.mutate({ amount: 10, reason: "25% milestone" });
    },
  });

  const createInvite = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sponsor_relationships").insert({
        young_person_user_id: user!.id,
        goal_id: id!,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sponsor-invite"] });
      toast.success("Invite created!");
    },
  });

  if (!goal) return <AppLayout><div className="pt-20 text-center text-muted-foreground">Loading...</div></AppLayout>;

  const pct = Number(goal.target_amount) > 0 ? Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100) : 0;

  return (
    <AppLayout>
      <div className="pt-6 pb-4">
        <Link to="/goals" className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to goals
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-2xl font-display font-bold">{goal.name}</h1>
            {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
          </div>

          {/* Progress */}
          <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
            <div className="text-center mb-4">
              <p className="text-3xl font-display font-bold text-gradient-primary">
                £{Number(goal.current_amount).toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">of £{Number(goal.target_amount).toFixed(0)} target</p>
            </div>
            <Progress value={pct} className="h-3 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{pct.toFixed(0)}% complete</span>
              {goal.target_date && (
                <span>Target: {new Date(goal.target_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
              )}
            </div>
          </div>

          {/* Add savings */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-12 rounded-xl gradient-primary text-primary-foreground border-0 font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Add to savings
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">Add savings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  type="number"
                  placeholder="Amount (£)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 rounded-xl text-lg"
                  autoFocus
                />
                <Button
                  onClick={() => addSavings.mutate()}
                  disabled={!amount || addSavings.isPending}
                  className="w-full h-12 rounded-xl gradient-primary text-primary-foreground border-0"
                >
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Tip */}
          <div className="bg-card rounded-xl p-4 border border-border/50 flex gap-3">
            <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Saving tip</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try the "£1 challenge" — save £1 the first week, £2 the second, and so on. By week 12 you'll have saved £78!
              </p>
            </div>
          </div>

          {/* Sponsor invite */}
          <div className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <p className="text-sm font-display font-semibold">Invite a sponsor</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              In the future, your sponsor will be able to see your goal and optionally match some of your savings.
            </p>
            {invite?.invite_code ? (
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Your invite code</p>
                <p className="font-display font-bold text-lg tracking-wider">{invite.invite_code}</p>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => createInvite.mutate()}
                disabled={createInvite.isPending}
              >
                Generate invite code
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
