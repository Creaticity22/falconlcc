import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Award, ShieldCheck, Sparkles, Linkedin, X } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import HeroBanner from "@/components/HeroBanner";
import LessonCard from "@/components/LessonCard";
import ResourceCard from "@/components/ResourceCard";
import SponsoredBanner from "@/components/SponsoredBanner";
import ChallengesSection from "@/components/ChallengesSection";
import SavingsCalculator from "@/components/SavingsCalculator";
import { getSponsoredCampaigns } from "@/lib/sponsoredRewards";
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

  const { data: badges = [] } = useBadgeCatalogue();
  const { data: certificates = [] } = useCertificateCatalogue();
  const { data: userBadges = [] } = useUserBadges();
  const { data: userCertificates = [] } = useUserCertificates();

  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(TUTORIAL_KEY)) {
      setShowTutorial(true);
    }
  }, []);
  const dismissTutorial = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TUTORIAL_KEY, "1");
    }
    setShowTutorial(false);
  };

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
        <HeroBanner
          eyebrow="Learning Hub"
          title={<>Master your <span className="text-gradient-primary">money skills</span></>}
          subtitle={`${completed.length}/${LESSONS.length} lessons completed`}
          sideBySideFrom="md"
          logoSizeSm={72}
          logoSizeMd={96}
          logoSizeLg={120}
        />
      </div>

      {/* Badges & Certificates – prominent entry */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-10"
      >
        <Link
          to="/achievements"
          className="group relative block overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/25 via-card to-accent/15 p-5 md:p-7 hover:border-primary/50 transition-colors"
        >
          <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-primary grid place-items-center shrink-0 shadow-lg">
              <Award className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-primary font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> New · Achievements
              </div>
              <h2 className="font-display font-bold text-xl md:text-2xl leading-tight">
                Earn badges & shareable certificates
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xl">
                Stack badges as you learn. Unlock verifiable certificates for LinkedIn and your CV.
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs flex-wrap">
                <span className="inline-flex items-baseline gap-1">
                  <span className="font-display font-bold text-base">{userBadges.length}</span>
                  <span className="text-muted-foreground">/{badges.length} badges</span>
                </span>
                <span className="inline-flex items-baseline gap-1">
                  <span className="font-display font-bold text-base">{userCertificates.length}</span>
                  <span className="text-muted-foreground">/{certificates.length} certificates</span>
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1 text-sm text-primary font-semibold shrink-0">
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
        <button
          onClick={() => setShowTutorial(true)}
          className="mt-2 text-[11px] text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" /> How do badges & certificates work?
        </button>
      </motion.section>

      {/* Sponsored learning opportunities */}
      {(() => {
        const sponsored = getSponsoredCampaigns("learn");
        if (sponsored.length === 0) return null;
        return (
          <section className="mb-8" aria-label="Sponsored learning opportunities">
            <h2 className="font-display font-semibold text-base mb-1">Sponsored opportunities</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Extra rewards from partners who support youth financial education.
            </p>
            <div className="space-y-3">
              {sponsored.map((c) => (
                <SponsoredBanner key={c.id} campaign={c} variant="compact" />
              ))}
            </div>
          </section>
        );
      })()}

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

      {/* First-time tutorial */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] grid place-items-center bg-background/80 backdrop-blur-sm p-4"
            onClick={dismissTutorial}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-card border border-primary/30 p-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
              <button
                onClick={dismissTutorial}
                className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full hover:bg-secondary/70 z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl gradient-primary grid place-items-center mb-4 shadow-lg">
                  <Award className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="text-[11px] uppercase tracking-widest text-primary font-bold mb-1">
                  Welcome to Falcon Achievements
                </div>
                <h3 className="font-display font-bold text-2xl leading-tight mb-3">
                  Turn learning into proof of skill
                </h3>
                <ul className="space-y-3 text-sm text-foreground/85 mb-5">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary grid place-items-center text-xs font-bold shrink-0">1</span>
                    <span><b>Earn badges</b> automatically as you complete lessons, hit goals and build healthy money habits.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary grid place-items-center text-xs font-bold shrink-0">2</span>
                    <span><b>Stack badges</b> to unlock tiered <b>certificates</b> in budgeting, saving and money knowledge.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary grid place-items-center text-xs font-bold shrink-0">3</span>
                    <span className="inline-flex items-start gap-1.5">
                      <Linkedin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span><b>Share</b> each one with a public verification link — perfect for LinkedIn and your CV.</span>
                    </span>
                  </li>
                </ul>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={dismissTutorial}>
                    Got it
                  </Button>
                  <Button asChild size="sm" className="flex-1" onClick={dismissTutorial}>
                    <Link to="/achievements">
                      Explore <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

