import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Award, ShieldCheck, Sparkles, Linkedin, X } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import LessonCard from "@/components/LessonCard";
import ResourceCard from "@/components/ResourceCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useResources } from "@/hooks/useResources";
import {
  useBadgeCatalogue,
  useCertificateCatalogue,
  useUserBadges,
  useUserCertificates,
} from "@/hooks/useAchievements";
import { supabase } from "@/integrations/supabase/client";
import { LESSONS } from "@/lib/lessons";
import { MONEY_MOMENTS } from "@/lib/moneyMoments";

const TUTORIAL_KEY = "falcon.achievements.tutorialSeen.v1";

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
      <div className="pt-6 md:pt-10 pb-6 md:pb-8">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-accent mb-2">Learning Hub</p>
        <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
          Master your <span className="text-gradient-primary">money skills</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          {completed.length}/{LESSONS.length} lessons completed
        </p>
      </div>

      {/* Damien Talks Money */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
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

      {/* Real-life money moments */}
      <section className="mb-8">
        <h2 className="font-display font-semibold text-base mb-1">Real‑life money moments</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Step-by-step guides for big money milestones
        </p>
        <div className="space-y-2">
          {MONEY_MOMENTS.map((moment, i) => (
            <Link key={moment.id} to={`/learn/moment/${moment.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3 hover:border-primary/30 transition-colors"
              >
                <span className="text-2xl">{moment.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{moment.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{moment.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.div>
            </Link>
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
      <section className="pb-6">
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
