import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import HeroBanner from "@/components/HeroBanner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useAwardXP } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MoneyWins() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const awardXP = useAwardXP();
  const [text, setText] = useState("");

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
      setText("");
      toast.success("Money win logged! 🏆");
      awardXP.mutate({ amount: 10, reason: "Logged a money win" });
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
        className="bg-card rounded-xl p-5 border border-border/50 shadow-sm mb-6"
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
