import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function CommunityInsights() {
  const { data: profile } = useProfile();

  const { data: stats } = useQuery({
    queryKey: ["community-stats"],
    queryFn: async () => {
      // Count total lessons completed across all users
      const { count: lessonCount } = await supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true });

      // Count total users (profiles)
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Most popular goal names
      const { data: goals } = await supabase
        .from("savings_goals")
        .select("name")
        .limit(100);

      // Simple frequency count of goal names
      const nameFreq: Record<string, number> = {};
      goals?.forEach((g) => {
        const key = g.name.toLowerCase();
        nameFreq[key] = (nameFreq[key] || 0) + 1;
      });
      const topGoals = Object.entries(nameFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));

      const avgLessons =
        userCount && userCount > 0 && lessonCount
          ? Math.round(lessonCount / userCount)
          : 0;

      return { avgLessons, topGoals, userCount: userCount ?? 0 };
    },
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  });

  if (!stats || stats.userCount < 2) return null;

  return (
    <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-primary" />
        <p className="text-sm font-display font-semibold">What others are doing</p>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">
        Anonymised insights from Falcon users — no individual data is ever shared.
      </p>
      <div className="space-y-2">
        {stats.topGoals.length > 0 && (
          <div className="flex items-start gap-2 text-xs">
            <Target className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <span>
              Falcon users most often save for:{" "}
              <span className="font-medium">{stats.topGoals.join(" & ")}</span>
            </span>
          </div>
        )}
        {stats.avgLessons > 0 && (
          <div className="flex items-start gap-2 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-xp shrink-0 mt-0.5" />
            <span>
              On average, users have completed{" "}
              <span className="font-medium">{stats.avgLessons} lesson{stats.avgLessons !== 1 ? "s" : ""}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
