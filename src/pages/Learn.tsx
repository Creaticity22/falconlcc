import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import LessonCard from "@/components/LessonCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LESSONS } from "@/lib/lessons";

export default function Learn() {
  const { user } = useAuth();

  const { data: completedLessons } = useQuery({
    queryKey: ["completed-lessons", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user!.id);
      return data?.map((l) => l.lesson_id) ?? [];
    },
    enabled: !!user,
  });

  const completed = completedLessons ?? [];
  const nextLesson = LESSONS.find((l) => !completed.includes(l.id));

  // Group by topic
  const topics = [...new Set(LESSONS.map((l) => l.topic))];

  return (
    <AppLayout>
      <div className="pt-8 pb-4">
        <h1 className="text-2xl font-display font-bold">Learning Hub</h1>
        <p className="text-sm text-muted-foreground">
          {completed.length}/{LESSONS.length} lessons completed
        </p>
      </div>

      {/* My path */}
      {nextLesson && (
        <section className="mb-8">
          <h2 className="font-display font-semibold text-base mb-3">My path</h2>
          <LessonCard lesson={nextLesson} isNext />
        </section>
      )}

      {/* Browse topics */}
      <section>
        <h2 className="font-display font-semibold text-base mb-3">Browse topics</h2>
        <div className="space-y-3">
          {LESSONS.map((lesson, i) => (
            <motion.div key={lesson.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <LessonCard
                lesson={lesson}
                completed={completed.includes(lesson.id)}
                isNext={nextLesson?.id === lesson.id}
              />
            </motion.div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
