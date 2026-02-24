import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface GamificationData {
  id: string;
  user_id: string;
  xp_points: number;
  streak_days: number;
  last_active_date: string | null;
  badges: string[];
}

export function useGamification() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["gamification", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("gamification")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data as GamificationData;
    },
    enabled: !!user,
  });
}

export function useAwardXP() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ amount, reason }: { amount: number; reason: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data: current } = await supabase
        .from("gamification")
        .select("xp_points, streak_days, last_active_date")
        .eq("user_id", user.id)
        .single();

      if (!current) throw new Error("No gamification record");

      const today = new Date().toISOString().split("T")[0];
      const lastActive = current.last_active_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      
      let newStreak = current.streak_days;
      if (lastActive === yesterday) {
        newStreak += 1;
      } else if (lastActive !== today) {
        newStreak = 1;
      }

      const { error } = await supabase
        .from("gamification")
        .update({
          xp_points: current.xp_points + amount,
          streak_days: newStreak,
          last_active_date: today,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      return { newXP: current.xp_points + amount, amount, reason, newStreak };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["gamification"] });
      toast.success(`+${data.amount} XP — ${data.reason}! 🎉`);
    },
  });
}
