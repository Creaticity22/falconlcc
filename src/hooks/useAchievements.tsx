import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  skills: string[];
  criteria: string;
  tier: number;
  icon: string;
  color: string;
  sort_order: number;
}

export interface Certificate {
  id: string;
  code: string;
  name: string;
  description: string;
  skills: string[];
  required_badge_codes: string[];
  tier: number;
  issuer: string;
  sort_order: number;
}

export interface UserBadge {
  id: string;
  badge_code: string;
  verification_code: string;
  issued_at: string;
  recipient_name: string | null;
}

export interface UserCertificate {
  id: string;
  certificate_code: string;
  verification_code: string;
  issued_at: string;
  recipient_name: string | null;
}

export function useBadgeCatalogue() {
  return useQuery({
    queryKey: ["badges-catalogue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Badge[];
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useCertificateCatalogue() {
  return useQuery({
    queryKey: ["certificates-catalogue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Certificate[];
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useUserBadges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UserBadge[];
    },
    enabled: !!user,
  });
}

export function useUserCertificates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-certificates", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UserCertificate[];
    },
    enabled: !!user,
  });
}

export function useAwardBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (badgeCode: string) => {
      const { data, error } = await supabase.rpc("award_badge", {
        _badge_code: badgeCode,
      });
      if (error) throw error;
      return data as {
        badge_code: string;
        newly_awarded: boolean;
        certificates: Array<{ certificate_code: string }>;
      };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["user-badges"] });
      qc.invalidateQueries({ queryKey: ["user-certificates"] });
      if (data?.newly_awarded) {
        toast.success("🏅 New badge unlocked!");
      }
      if (data?.certificates?.length) {
        toast.success("🎓 New certificate earned!");
      }
    },
  });
}

/**
 * Evaluate which badges the current user has earned and silently sync them.
 * Pure additive helper — reads existing data only.
 */
export function useSyncAchievements() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) return { awarded: [] as string[] };

      const [
        budgetsRes,
        goalsRes,
        lessonsRes,
        diaryRes,
        winsRes,
        expensesRes,
        gamRes,
        ownedRes,
      ] = await Promise.all([
        supabase.from("budgets").select("monthly_income, categories").eq("user_id", user.id),
        supabase.from("savings_goals").select("target_amount, current_amount").eq("user_id", user.id),
        supabase.from("lesson_progress").select("lesson_id, score").eq("user_id", user.id),
        supabase.from("money_diary_entries").select("id").eq("user_id", user.id),
        supabase.from("money_wins").select("id").eq("user_id", user.id),
        supabase.from("expenses").select("expense_date").eq("user_id", user.id),
        supabase.from("gamification").select("xp_points, streak_days").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_badges").select("badge_code").eq("user_id", user.id),
      ]);

      const owned = new Set((ownedRes.data ?? []).map((b: any) => b.badge_code));
      const earned: string[] = [];

      const budgets = budgetsRes.data ?? [];
      const hasBudget = budgets.some(
        (b: any) =>
          Number(b.monthly_income) > 0 &&
          Array.isArray(b.categories) &&
          b.categories.length > 0
      );
      if (hasBudget) earned.push("budget_starter");

      const goals = goalsRes.data ?? [];
      if (goals.length > 0) earned.push("saver_first_goal");
      if (
        goals.some(
          (g: any) =>
            Number(g.target_amount) > 0 &&
            Number(g.current_amount) >= Number(g.target_amount) * 0.5
        )
      )
        earned.push("saver_halfway");
      if (
        goals.some(
          (g: any) =>
            Number(g.target_amount) > 0 &&
            Number(g.current_amount) >= Number(g.target_amount)
        )
      )
        earned.push("saver_complete");

      const lessons = lessonsRes.data ?? [];
      if (lessons.length >= 1) earned.push("learner_first_lesson");
      if (lessons.length >= 5) earned.push("learner_five_lessons");
      if (lessons.length >= 10) earned.push("learner_scholar");

      const diary = diaryRes.data ?? [];
      if (diary.length >= 1) earned.push("decision_reflective");

      const expenses = expensesRes.data ?? [];
      const distinctDays = new Set(expenses.map((e: any) => e.expense_date));
      if (distinctDays.size >= 7) earned.push("decision_aware");

      const wins = winsRes.data ?? [];
      if (wins.length >= 1) earned.push("milestone_first_win");

      const gam = gamRes.data;
      const xp = Number(gam?.xp_points ?? 0);
      const streak = Number(gam?.streak_days ?? 0);
      if (xp >= 100) earned.push("milestone_xp_100");
      if (xp >= 500) earned.push("milestone_xp_500");
      if (xp >= 1000) earned.push("milestone_xp_1000");
      if (streak >= 7) earned.push("behaviour_streak_7");
      if (streak >= 30) earned.push("behaviour_streak_30");

      const toAward = earned.filter((c) => !owned.has(c));
      const newlyAwarded: string[] = [];

      for (const code of toAward) {
        const { data, error } = await supabase.rpc("award_badge", { _badge_code: code });
        if (!error && (data as any)?.newly_awarded) {
          newlyAwarded.push(code);
        }
      }
      return { awarded: newlyAwarded };
    },
    onSuccess: (res) => {
      if (res.awarded.length > 0) {
        qc.invalidateQueries({ queryKey: ["user-badges"] });
        qc.invalidateQueries({ queryKey: ["user-certificates"] });
        toast.success(
          res.awarded.length === 1
            ? "🏅 New badge unlocked!"
            : `🏅 ${res.awarded.length} new badges unlocked!`
        );
      }
    },
  });
}

/** Public verification lookups — work for anon and authenticated users. */
export async function fetchBadgeByVerificationCode(code: string) {
  const { data: ub, error } = await supabase
    .from("user_badges")
    .select("badge_code, verification_code, issued_at, recipient_name")
    .eq("verification_code", code)
    .maybeSingle();
  if (error) throw error;
  if (!ub) return null;
  const { data: badge } = await supabase
    .from("badges")
    .select("*")
    .eq("code", ub.badge_code)
    .maybeSingle();
  return { userBadge: ub, badge: badge as Badge | null };
}

export async function fetchCertificateByVerificationCode(code: string) {
  const { data: uc, error } = await supabase
    .from("user_certificates")
    .select("certificate_code, verification_code, issued_at, recipient_name")
    .eq("verification_code", code)
    .maybeSingle();
  if (error) throw error;
  if (!uc) return null;
  const { data: cert } = await supabase
    .from("certificates")
    .select("*")
    .eq("code", uc.certificate_code)
    .maybeSingle();
  return { userCertificate: uc, certificate: cert as Certificate | null };
}
