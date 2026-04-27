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
        whileHover={{ y: -2 }}
        className="card-elevated p-4 md:p-5 group"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display font-bold text-base truncate">{name}</h3>
              <span className="text-xs font-bold text-gradient-gold shrink-0">{pct.toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span>
                <span className="text-foreground font-semibold">£{currentAmount.toFixed(0)}</span>
                <span className="opacity-60"> / £{targetAmount.toFixed(0)}</span>
              </span>
            </div>
            <Progress value={pct} className="mt-2.5 h-1.5" />
            {targetDate && (
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-medium">
                Target · {new Date(targetDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
