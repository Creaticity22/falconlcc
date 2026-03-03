import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface GoalTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  suggested_min_amount: number;
  suggested_max_amount: number;
  suggested_timeframe_months: number;
  default_topic: string;
  resource_topics: string[];
}

interface Props {
  onSelect: (template: GoalTemplate) => void;
  onSkip: () => void;
}

const TEMPLATE_EMOJIS: Record<string, string> = {
  emergency_cushion: "🛟",
  driving_lessons: "🚗",
  uni_move_in: "🎓",
  new_phone: "📱",
};

export default function GoalTemplateSelector({ onSelect, onSkip }: Props) {
  const { data: templates } = useQuery({
    queryKey: ["goal-templates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("goal_templates")
        .select("*")
        .order("created_at");
      return (data ?? []) as GoalTemplate[];
    },
  });

  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm text-muted-foreground">
        Pick a template to get started quickly, or create your own.
      </p>

      <div className="space-y-2">
        {templates?.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(t)}
            className="w-full text-left bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors flex items-center gap-3"
          >
            <span className="text-2xl">{TEMPLATE_EMOJIS[t.code] ?? "🎯"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
              <p className="text-[10px] text-primary mt-0.5">
                £{t.suggested_min_amount}–£{t.suggested_max_amount} · {t.suggested_timeframe_months} months
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </motion.button>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full h-11 rounded-xl"
        onClick={onSkip}
      >
        <Sparkles className="w-4 h-4 mr-1" /> Start from scratch
      </Button>
    </div>
  );
}
