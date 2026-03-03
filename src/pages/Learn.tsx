import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import LessonCard from "@/components/LessonCard";
import ResourceCard from "@/components/ResourceCard";
import { useAuth } from "@/hooks/useAuth";
import { useResources } from "@/hooks/useResources";
import { supabase } from "@/integrations/supabase/client";
import { LESSONS } from "@/lib/lessons";

const FEATURED_VIDEOS = [
  {
    id: "budgeting-guide",
    title: "A Young Person's Guide to Budgeting",
    source: "The Mix & The Big Issue",
    embedUrl: "https://www.youtube.com/embed/7j55GQ7f844",
  },
  {
    id: "financial-literacy",
    title: "Master Financial Literacy in 54 Minutes",
    source: "Nischa",
    embedUrl: "https://www.youtube.com/embed/vJabNEwZIuc",
  },
];

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

  // Map lesson topics to resource DB topics
  const topicMap: Record<string, string> = {
    Budgeting: "budgeting",
    Saving: "saving",
    Tax: "economy",
    Debt: "debt",
    Investing: "investing_basics",
  };

  // Derive the "current" topic from the next lesson, fallback to first topic
  const currentTopic = nextLesson?.topic ?? LESSONS[0]?.topic ?? "Budgeting";
  const resourceTopics = topicMap[currentTopic]
    ? [topicMap[currentTopic]]
    : [currentTopic.toLowerCase()];
  const { data: resources } = useResources(resourceTopics, 3);

  return (
    <AppLayout>
      <div className="pt-8 pb-4">
        <h1 className="text-2xl font-display font-bold">Learning Hub</h1>
        <p className="text-sm text-muted-foreground">
          {completed.length}/{LESSONS.length} lessons completed
        </p>
      </div>

      {/* Featured videos */}
      <section className="mb-8">
        <h2 className="font-display font-semibold text-base mb-3">Featured videos</h2>
        <div className="space-y-5">
          {FEATURED_VIDEOS.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="rounded-xl overflow-hidden border border-border/50 bg-card">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-medium leading-snug">{video.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{video.source}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    External video – tap to watch on YouTube. For education only, not personal advice.
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trusted resources */}
      {resources && resources.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display font-semibold text-base mb-3">Trusted resources</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Curated links about {currentTopic.toLowerCase()} from UK experts
          </p>
          <div className="space-y-3">
            {resources.map((r) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ResourceCard resource={r} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

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

      {/* Damien Talks Money */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 pb-6"
      >
        <h2 className="font-display font-semibold text-base mb-1">Damien Talks Money – Videos</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Curated videos from Damien Talks Money, one of the UK's biggest personal finance channels, for education and inspiration only (not personal advice).
        </p>
        <div className="relative w-full rounded-xl overflow-hidden border border-border/50" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src="https://www.youtube.com/embed/yjS6kc7LiuM"
            title="Damien Talks Money – YouTube channel"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Videos play from YouTube in a new tab or in‑player, depending on your device.
        </p>
      </motion.section>
    </AppLayout>
  );
}
