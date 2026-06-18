import { useState } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";

const STORAGE_KEY = "falcon.personal.nudge.v1";

interface PersonalNudge {
  message: string;
  to: string;
}

function pickNudge(income_band: string | null, saving_for: string | null): PersonalNudge | null {
  if (income_band === "50-150" || income_band === "150+") {
    return {
      message: "💰 Got a job? Make sure you understand your payslip.",
      to: "/learn/moment/first-payslip",
    };
  }
  if (saving_for === "travel") {
    return { message: "✈️ Saving for travel? Check out our savings goal templates.", to: "/goals" };
  }
  if (saving_for === "tech") {
    return { message: "📱 Saving for tech? See how close you could get in 6 months.", to: "/goals" };
  }
  if (saving_for === "independence") {
    return {
      message: "🏠 Thinking about independence? Our Moving Out money moment has you covered.",
      to: "/learn/moment/moving-out",
    };
  }
  return null;
}

export default function PersonalNudgeCard() {
  const { data: profile } = useProfile();
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem(STORAGE_KEY),
  );

  if (!profile || dismissed) return null;
  const nudge = pickNudge(profile.income_band, profile.saving_for);
  if (!nudge) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="mb-6 rounded-2xl p-4 bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug mb-2">{nudge.message}</p>
          <Link
            to={nudge.to}
            onClick={dismiss}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-glow"
          >
            Take a look <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="w-7 h-7 grid place-items-center rounded-full hover:bg-secondary/70 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
