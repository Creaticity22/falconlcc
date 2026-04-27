import { motion } from "framer-motion";
import { BookOpen, Star, CheckCircle2, PlayCircle } from "lucide-react";
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
        whileHover={{ y: -2 }}
        className={`card-elevated p-4 md:p-5 group ${
          isNext ? "border-primary/50 ring-1 ring-primary/30" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105 ${
            completed
              ? "bg-success/15 ring-1 ring-success/30"
              : isNext
              ? "gradient-primary"
              : "bg-secondary"
          }`}>
            {completed ? (
              <CheckCircle2 className="w-6 h-6 text-success" />
            ) : isNext ? (
              <PlayCircle className="w-6 h-6 text-primary-foreground" />
            ) : (
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display font-bold text-base leading-tight">{lesson.title}</h3>
              {!completed && (
                <div className="flex items-center gap-1 text-xs font-bold text-accent shrink-0">
                  <Star className="w-3.5 h-3.5 fill-accent" />
                  {lesson.xpReward}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{lesson.topic}</p>
            {isNext && !completed && (
              <span className="inline-block mt-2.5 text-[10px] font-bold text-primary bg-primary/15 border border-primary/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                ▶ Up next
              </span>
            )}
            {completed && (
              <span className="inline-block mt-2.5 text-[10px] font-bold text-success bg-success/10 border border-success/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                ✓ Completed
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
