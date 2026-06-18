import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Star, Trophy } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAwardXP } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { LESSONS } from "@/lib/lessons";
import { trackEvent } from "@/lib/analytics";

type Phase = "reading" | "quiz" | "complete";

export default function Lesson() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const awardXP = useAwardXP();
  const lesson = LESSONS.find((l) => l.id === id);

  const [phase, setPhase] = useState<Phase>("reading");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const saveProgress = useMutation({
    mutationFn: async (score: number) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("lesson_progress").upsert({
        user_id: user.id,
        lesson_id: id!,
        score,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["completed-lessons"] });
    },
  });

  if (!lesson) return <Navigate to="/learn" replace />;

  const quiz = lesson.quiz;
  const isCorrect = selected !== null && selected === quiz[currentQ]?.correctIndex;
  const score = answers.filter((a, i) => a === quiz[i]?.correctIndex).length;

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
  };

  const nextQuestion = () => {
    const newAnswers = [...answers, selected!];
    setAnswers(newAnswers);
    setSelected(null);
    setShowResult(false);

    if (currentQ + 1 < quiz.length) {
      setCurrentQ(currentQ + 1);
    } else {
      const finalScore = newAnswers.filter((a, i) => a === quiz[i]?.correctIndex).length;
      setPhase("complete");
      saveProgress.mutate(finalScore);
      awardXP.mutate({ amount: lesson.xpReward, reason: `Completed "${lesson.title}"` });
      trackEvent("lesson_completed", { lesson_id: lesson.id });
    }
  };

  return (
    <AppLayout>
      <div className="pt-6 pb-4">
        <Link to="/learn" className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Learn
        </Link>

        <h1 className="text-2xl font-display font-bold mb-1">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground">{lesson.topic} · +{lesson.xpReward} XP</p>
      </div>

      <AnimatePresence mode="wait">
        {phase === "reading" && (
          <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-4 mb-8">
              {lesson.content.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="text-sm leading-relaxed"
                >
                  {para}
                </motion.p>
              ))}
            </div>
            <Button
              onClick={() => setPhase("quiz")}
              className="w-full h-12 rounded-xl gradient-primary text-primary-foreground border-0 font-semibold"
            >
              Start quiz ({quiz.length} questions)
            </Button>
          </motion.div>
        )}

        {phase === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex gap-1.5 mb-6">
              {quiz.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < currentQ ? "bg-success" : i === currentQ ? "gradient-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground mb-2">Question {currentQ + 1} of {quiz.length}</p>
            <h2 className="font-display font-semibold text-lg mb-4">{quiz[currentQ].question}</h2>

            <div className="space-y-3 mb-6">
              {quiz[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    showResult && i === quiz[currentQ].correctIndex
                      ? "border-success bg-success/10 text-success"
                      : showResult && i === selected && i !== quiz[currentQ].correctIndex
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : selected === i
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {showResult && i === quiz[currentQ].correctIndex && <CheckCircle2 className="w-4 h-4 text-success" />}
                    {showResult && i === selected && i !== quiz[currentQ].correctIndex && <XCircle className="w-4 h-4 text-destructive" />}
                    {opt}
                  </div>
                </button>
              ))}
            </div>

            {showResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Button onClick={nextQuestion} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground border-0">
                  {currentQ + 1 < quiz.length ? "Next question" : "See results"}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === "complete" && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full gradient-accent mx-auto flex items-center justify-center shadow-lg"
            >
              <Trophy className="w-10 h-10 text-accent-foreground" />
            </motion.div>

            <div>
              <h2 className="text-2xl font-display font-bold">Lesson complete!</h2>
              <p className="text-muted-foreground mt-1">
                You scored {answers.filter((a, i) => a === quiz[i]?.correctIndex).length}/{quiz.length}
              </p>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-2 text-xp font-display font-bold text-lg animate-xp-pop">
              <Star className="w-5 h-5" />
              +{lesson.xpReward} XP
            </motion.div>

            <div className="bg-card rounded-xl p-4 border border-border/50 text-left">
              <p className="font-display font-semibold text-sm mb-2">Key takeaways</p>
              <ul className="space-y-1">
                {lesson.takeaways.map((t, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/learn">
              <Button className="w-full h-12 rounded-xl gradient-primary text-primary-foreground border-0 font-semibold">
                Back to Learning Hub
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
