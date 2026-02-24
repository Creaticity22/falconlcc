import { motion } from "framer-motion";
import { BookOpen, Star, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Lesson } from "@/lib/lessons";

interface LessonCardProps {
  lesson: Lesson;
  completed?: boolean;
  isNext?: boolean;
}

export default function LessonCard({ lesson, completed, isNext }: LessonCardProps) {
  return (
    <Link to={`/learn/${lesson.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`bg-card rounded-xl p-4 border shadow-sm ${
          isNext ? "border-primary/30 ring-2 ring-primary/10" : "border-border/50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            completed ? "bg-success/10" : isNext ? "gradient-primary" : "bg-muted"
          }`}>
            {completed ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <BookOpen className={`w-5 h-5 ${isNext ? "text-primary-foreground" : "text-muted-foreground"}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">{lesson.title}</h3>
              {!completed && (
                <div className="flex items-center gap-1 text-xs text-xp font-medium">
                  <Star className="w-3 h-3" />
                  {lesson.xpReward} XP
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{lesson.topic}</p>
            {isNext && !completed && (
              <span className="inline-block mt-2 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Up next
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
