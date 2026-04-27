import { motion } from "framer-motion";
import { Bird, Wallet, PiggyBank, Zap, Flame, Plus, BookOpen, MessageCircle, SmilePlus, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import KPICard from "@/components/KPICard";
import GoalCard from "@/components/GoalCard";
import CommunityInsights from "@/components/CommunityInsights";
import FalconLogo from "@/components/FalconLogo";
import { useProfile } from "@/hooks/useProfile";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LESSONS } from "@/lib/lessons";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: gamification } = useGamification();

  const { data: goals } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: budget } = useQuery({
    queryKey: ["current-budget", user?.id],
    queryFn: async () => {
      const month = new Date().toISOString().slice(0, 7);
      const { data } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user!.id)
        .eq("month", month)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: monthlySpent } = useQuery({
    queryKey: ["monthly-spent", user?.id],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data } = await supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", user!.id)
        .gte("expense_date", startOfMonth.toISOString().split("T")[0]);
      return data?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;
    },
    enabled: !!user,
  });

  const { data: completedLessons } = useQuery({
    queryKey: ["completed-lessons", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user!.id);
      return data?.map((l) => l.lesson_id) ?? [];
    },
    enabled: !!user,
  });

  const totalSaved = goals?.reduce((s, g) => s + Number(g.current_amount), 0) ?? 0;
  const budgetPlanned = budget ? Number(budget.monthly_income) : 0;
  const spent = monthlySpent ?? 0;

  const nextLesson = LESSONS.find((l) => !completedLessons?.includes(l.id));

  const quickActions = [
    { label: "Ask Falcon AI", icon: MessageCircle, to: "/ai", gradient: "gradient-primary" },
    { label: "Add expense", icon: Plus, to: "/budget?add=1", gradient: "gradient-accent" },
    { label: "Add savings", icon: PiggyBank, to: "/goals", gradient: "bg-success" },
    { label: "Start lesson", icon: BookOpen, to: nextLesson ? `/learn/${nextLesson.id}` : "/learn", gradient: "gradient-xp" },
  ];

  return (
    <AppLayout>
      {/* Hero header */}
      <section className="pt-6 md:pt-10 pb-6 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl gradient-hero border border-border/60 p-6 md:p-10"
        >
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-semibold text-accent">
                Welcome back
              </p>
              <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight">
                Hey {profile?.first_name ?? "there"}
                <span className="text-gradient-primary"> 👋</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                Your money, your moves. Let's keep building those skills today.
              </p>
            </div>
            <Link
              to="/settings"
              className="md:hidden w-11 h-11 rounded-full gradient-primary flex items-center justify-center shadow-lg shrink-0"
              aria-label="Settings"
            >
              <Bird className="w-5 h-5 text-primary-foreground" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        <KPICard
          title="Budget"
          value={budgetPlanned > 0 ? `£${(budgetPlanned - spent).toFixed(0)}` : "—"}
          subtitle={budgetPlanned > 0 ? `£${spent.toFixed(0)} spent` : "Not set"}
          icon={<Wallet className="w-4 h-4" />}
          gradient="gradient-primary"
        />
        <KPICard
          title="Saved"
          value={`£${totalSaved.toFixed(0)}`}
          subtitle={`${goals?.length ?? 0} goals`}
          icon={<PiggyBank className="w-4 h-4" />}
          gradient="gradient-accent"
        />
        <KPICard
          title="XP"
          value={`${gamification?.xp_points ?? 0}`}
          subtitle={gamification?.streak_days ? `${gamification.streak_days}🔥` : "Start streak!"}
          icon={<Zap className="w-4 h-4" />}
          gradient="gradient-xp"
        />
      </div>

      {/* Streak celebration */}
      {gamification && gamification.streak_days >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 md:p-5 rounded-2xl bg-streak/10 border border-streak/30 flex items-center gap-4"
        >
          <div className="animate-streak-glow w-12 h-12 rounded-full bg-streak flex items-center justify-center shadow-lg shrink-0">
            <Flame className="w-6 h-6 text-streak-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-base">{gamification.streak_days}-day money streak!</p>
            <p className="text-xs text-muted-foreground">Keep it going 💪</p>
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <section className="mb-10">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">
          Quick actions
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-4 gap-3 md:gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.to}>
              <motion.div
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -3 }}
                className="card-elevated p-3 md:p-5 flex flex-col items-center gap-2 md:gap-3 text-center"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${action.gradient} flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <span className="text-[10px] md:text-xs font-semibold leading-tight">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Two-col layout on desktop */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Savings Goals */}
        {goals && goals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl md:text-2xl">My Goals</h2>
              <Link to="/goals" className="text-xs font-semibold text-primary hover:text-primary-glow story-link">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {goals.map((g) => (
                <GoalCard
                  key={g.id}
                  id={g.id}
                  name={g.name}
                  targetAmount={Number(g.target_amount)}
                  currentAmount={Number(g.current_amount)}
                  targetDate={g.target_date ?? undefined}
                />
              ))}
            </div>
          </section>
        )}

        {/* Next lesson + diary/wins */}
        <div className="space-y-6">
          {nextLesson && (
            <section>
              <h2 className="font-display font-bold text-xl md:text-2xl mb-4">Keep learning</h2>
              <Link to={`/learn/${nextLesson.id}`}>
                <motion.div whileHover={{ y: -2 }} className="card-feature p-5 flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-2xl gradient-xp flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                    <BookOpen className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-base leading-tight">{nextLesson.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                      {nextLesson.topic} · +{nextLesson.xpReward} XP
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">Start →</span>
                </motion.div>
              </Link>
            </section>
          )}

          {/* Money diary & wins quick links */}
          <section>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/diary">
                <motion.div whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} className="card-elevated p-4 text-center">
                  <SmilePlus className="w-7 h-7 text-primary mx-auto mb-2" />
                  <p className="text-sm font-bold">Money Diary</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Track your feelings</p>
                </motion.div>
              </Link>
              <Link to="/wins">
                <motion.div whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} className="card-elevated p-4 text-center">
                  <Trophy className="w-7 h-7 text-accent mx-auto mb-2" />
                  <p className="text-sm font-bold">Money Wins</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Celebrate victories</p>
                </motion.div>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Community insights */}
      <section className="mb-8">
        <CommunityInsights />
      </section>
    </AppLayout>
  );
}
