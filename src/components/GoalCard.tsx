import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface GoalCardProps {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
}

export default function GoalCard({ id, name, targetAmount, currentAmount, targetDate }: GoalCardProps) {
  const pct = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

  return (
    <Link to={`/goals/${id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-card rounded-xl p-4 border border-border/50 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-sm truncate">{name}</h3>
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span>£{currentAmount.toFixed(0)} / £{targetAmount.toFixed(0)}</span>
              <span>{pct.toFixed(0)}%</span>
            </div>
            <Progress value={pct} className="mt-2 h-2" />
            {targetDate && (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Target: {new Date(targetDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
