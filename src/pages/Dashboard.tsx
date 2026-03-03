import { motion } from "framer-motion";
import { Bird, Wallet, PiggyBank, Zap, Flame, Plus, BookOpen, MessageCircle, SmilePlus, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import KPICard from "@/components/KPICard";
import GoalCard from "@/components/GoalCard";
import CommunityInsights from "@/components/CommunityInsights";
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
      {/* Header */}
      <div className="pt-8 pb-4 flex items-center justify-between">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            Welcome back to Falcon
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-display font-bold"
          >
            Hey {profile?.first_name ?? "there"} 👋
          </motion.h1>
        </div>
        <Link to="/settings">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Bird className="w-5 h-5 text-primary-foreground" />
          </div>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-streak/10 border border-streak/20 flex items-center gap-3"
        >
          <div className="animate-streak-glow w-10 h-10 rounded-full bg-streak flex items-center justify-center">
            <Flame className="w-5 h-5 text-streak-foreground" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm">{gamification.streak_days}-day money streak!</p>
            <p className="text-xs text-muted-foreground">Keep it going 💪</p>
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {quickActions.map((action) => (
          <Link key={action.label} to={action.to}>
            <motion.div
              whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`w-12 h-12 rounded-2xl ${action.gradient} flex items-center justify-center shadow-sm`}>
                <action.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">{action.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Savings Goals */}
      {goals && goals.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-base">My Savings Goals</h2>
            <Link to="/goals" className="text-xs text-primary font-medium">View all</Link>
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

      {/* Next lesson */}
      {nextLesson && (
        <section className="mb-6">
          <h2 className="font-display font-semibold text-base mb-3">Keep learning</h2>
          <Link to={`/learn/${nextLesson.id}`}>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-xp flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-sm">{nextLesson.title}</p>
                <p className="text-xs text-muted-foreground">{nextLesson.topic} · +{nextLesson.xpReward} XP</p>
              </div>
              <span className="text-xs font-medium text-primary">Start →</span>
            </div>
          </Link>
        </section>
      )}

      {/* Money diary & wins quick links */}
      <section className="mb-6">
        <div className="grid grid-cols-2 gap-2">
          <Link to="/diary">
            <motion.div whileTap={{ scale: 0.97 }} className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <SmilePlus className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-xs font-semibold">Money Diary</p>
              <p className="text-[10px] text-muted-foreground">Track your feelings</p>
            </motion.div>
          </Link>
          <Link to="/wins">
            <motion.div whileTap={{ scale: 0.97 }} className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <Trophy className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="text-xs font-semibold">Money Wins</p>
              <p className="text-[10px] text-muted-foreground">Celebrate victories</p>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Community insights */}
      <section className="mb-8">
        <CommunityInsights />
      </section>
    </AppLayout>
  );
}
