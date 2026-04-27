import { motion } from "framer-motion";
import { Lock, Award, PieChart, Target, BookOpen, GraduationCap, Brain, Flame, Sparkles, Star, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/hooks/useAchievements";

const ICON_MAP: Record<string, LucideIcon> = {
  award: Award,
  "pie-chart": PieChart,
  target: Target,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  brain: Brain,
  flame: Flame,
  sparkles: Sparkles,
  star: Star,
  trophy: Trophy,
};

const TIER_GRADIENT: Record<number, string> = {
  1: "from-amber-700/40 via-amber-500/30 to-amber-300/20",
  2: "from-slate-400/40 via-slate-200/30 to-slate-50/20",
  3: "from-yellow-500/50 via-yellow-300/40 to-yellow-100/30",
};

const TIER_LABEL: Record<number, string> = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
};

interface BadgeMedallionProps {
  badge: Pick<Badge, "code" | "name" | "icon" | "tier" | "category">;
  earned: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export default function BadgeMedallion({ badge, earned, size = "md", onClick }: BadgeMedallionProps) {
  const Icon = ICON_MAP[badge.icon] ?? Award;
  const dim = size === "lg" ? 96 : size === "sm" ? 56 : 72;
  const iconSize = size === "lg" ? 40 : size === "sm" ? 22 : 30;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
      aria-label={badge.name}
    >
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        style={{ width: dim, height: dim }}
        className={`relative rounded-full grid place-items-center border-2 transition-all ${
          earned
            ? `bg-gradient-to-br ${TIER_GRADIENT[badge.tier]} border-primary/60 shadow-[0_0_30px_hsl(268_75%_55%/0.35)]`
            : "bg-secondary/40 border-border/40"
        }`}
      >
        {earned ? (
          <Icon size={iconSize} className="text-foreground drop-shadow-md" strokeWidth={2} />
        ) : (
          <Lock size={iconSize * 0.7} className="text-muted-foreground" />
        )}
        {earned && (
          <span className="absolute -bottom-1 right-0 text-[9px] font-bold uppercase tracking-wider bg-background border border-border rounded-full px-2 py-[2px] text-foreground">
            {TIER_LABEL[badge.tier]}
          </span>
        )}
      </motion.div>
      <span className={`text-xs font-semibold text-center max-w-[110px] leading-tight ${earned ? "text-foreground" : "text-muted-foreground"}`}>
        {badge.name}
      </span>
    </button>
  );
}
