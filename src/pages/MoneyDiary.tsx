import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, SmilePlus, TrendingUp, MessageCircle } from "lucide-react";
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

const MOODS = [
  { score: 1, emoji: "😰", label: "Really stressed" },
  { score: 2, emoji: "😟", label: "A bit worried" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Pretty good" },
  { score: 5, emoji: "😊", label: "Great" },
];

function getWeekStart(d: Date = new Date()): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

export default function MoneyDiary() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const awardXP = useAwardXP();
  const currentWeek = getWeekStart();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const { data: entries, isLoading } = useQuery({
    queryKey: ["diary-entries", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("money_diary_entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("week_start_date", { ascending: false })
        .limit(12);
      return data ?? [];
    },
    enabled: !!user,
  });

  const thisWeekEntry = entries?.find((e: any) => e.week_start_date === currentWeek);

  const submitEntry = useMutation({
    mutationFn: async () => {
      const mood = MOODS.find((m) => m.score === selectedMood)!;
      const { error } = await supabase.from("money_diary_entries").upsert({
        user_id: user!.id,
        mood_score: mood.score,
        mood_emoji: mood.emoji,
        note: note || null,
        week_start_date: currentWeek,
      }, { onConflict: "user_id,week_start_date" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diary-entries"] });
      toast.success("Diary entry saved! 📝");
      awardXP.mutate({ amount: 10, reason: "Weekly money reflection" });
      setSelectedMood(null);
      setNote("");
    },
  });

  // Simple insights
  const recentEntries = entries?.slice(0, 8) ?? [];
  const avgMood = recentEntries.length > 0
    ? recentEntries.reduce((s: number, e: any) => s + e.mood_score, 0) / recentEntries.length
    : null;
  const lowStreak = recentEntries.length >= 3 && recentEntries.slice(0, 3).every((e: any) => e.mood_score <= 2);

  const moodLabel = avgMood
    ? avgMood >= 4 ? "positive" : avgMood >= 3 ? "okay" : "stressed"
    : null;

  return (
    <AppLayout>
      <div className="pt-6 pb-4 space-y-4">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <HeroBanner
          eyebrow="Wellbeing"
          title="Money Diary"
          subtitle="Track how you feel about money each week"
          sideBySideFrom="md"
          logoSizeSm={64}
          logoSizeMd={88}
          logoSizeLg={104}
        />
      </div>

      {/* Insights */}
      {moodLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-card rounded-xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Your money mood</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Most weeks you feel <span className="font-medium text-foreground">{moodLabel}</span> about money.
          </p>
        </motion.div>
      )}

      {lowStreak && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-destructive/5 rounded-xl p-4 border border-destructive/20"
        >
          <p className="text-sm font-semibold mb-1">You've felt low about money recently 💙</p>
          <p className="text-xs text-muted-foreground mb-3">
            It's completely normal, but there are things that can help.
          </p>
          <div className="flex gap-2">
            <Link to="/ai?prompt=I'm feeling stressed about money, what small steps can I take?">
              <Button size="sm" variant="outline" className="rounded-lg text-xs h-8">
                <MessageCircle className="w-3 h-3 mr-1" /> Ask the AI for ideas
              </Button>
            </Link>
            <Link to="/settings">
              <Button size="sm" variant="outline" className="rounded-lg text-xs h-8">
                See support options
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* This week's entry */}
      {!thisWeekEntry ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-5 border border-border/50 shadow-sm mb-6"
        >
          <h2 className="font-display font-semibold text-base mb-1">This week</h2>
          <p className="text-xs text-muted-foreground mb-4">How did you feel about money this week?</p>

          <div className="flex justify-between mb-4">
            {MOODS.map((mood) => (
              <button
                key={mood.score}
                onClick={() => setSelectedMood(mood.score)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  selectedMood === mood.score
                    ? "bg-primary/10 scale-110"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-[9px] text-muted-foreground leading-tight text-center">{mood.label}</span>
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Any thoughts? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-xl mb-3 text-sm"
            rows={2}
          />

          <Button
            onClick={() => submitEntry.mutate()}
            disabled={!selectedMood || submitEntry.isPending}
            className="w-full h-11 rounded-xl gradient-primary text-primary-foreground border-0"
          >
            <SmilePlus className="w-4 h-4 mr-1" /> Save this week's entry (+10 XP)
          </Button>
        </motion.div>
      ) : (
        <div className="bg-card rounded-xl p-4 border border-primary/20 mb-6">
          <p className="text-sm font-semibold flex items-center gap-2">
            <span className="text-xl">{(thisWeekEntry as any).mood_emoji}</span>
            You've reflected this week ✓
          </p>
          {(thisWeekEntry as any).note && (
            <p className="text-xs text-muted-foreground mt-1">"{(thisWeekEntry as any).note}"</p>
          )}
        </div>
      )}

      {/* Timeline */}
      {recentEntries.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-base mb-3">Your timeline</h2>
          <div className="space-y-2">
            {recentEntries.map((entry: any, i: number) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3"
              >
                <span className="text-xl">{entry.mood_emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">
                    Week of {new Date(entry.week_start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  {entry.note && (
                    <p className="text-[11px] text-muted-foreground truncate">{entry.note}</p>
                  )}
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`w-2 h-2 rounded-full ${
                        n <= entry.mood_score ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </AppLayout>
  );
}
