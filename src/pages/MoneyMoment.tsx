import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, ExternalLink } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import ResourceCard from "@/components/ResourceCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useResources } from "@/hooks/useResources";
import { MONEY_MOMENTS } from "@/lib/moneyMoments";

export default function MoneyMoment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const moment = MONEY_MOMENTS.find((m) => m.id === id);
  const [step, setStep] = useState(0);

  const { data: resources } = useResources(moment?.resourceTopics ?? [], 3);

  if (!moment) {
    return (
      <AppLayout>
        <div className="pt-20 text-center text-muted-foreground">Flow not found</div>
      </AppLayout>
    );
  }

  const totalSteps = moment.steps.length;
  const isLastStep = step === totalSteps - 1;
  const showResources = isLastStep;
  const currentStep = moment.steps[step];
  const pct = ((step + 1) / totalSteps) * 100;

  return (
    <AppLayout>
      <div className="pt-6 pb-4">
        <Link to="/learn" className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Learn
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{moment.emoji}</span>
          <div>
            <h1 className="text-xl font-display font-bold">{moment.title}</h1>
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </p>
          </div>
        </div>

        <Progress value={pct} className="h-2 mb-6" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-card rounded-xl p-5 border border-border/50 shadow-sm">
              <h2 className="font-display font-semibold text-base mb-3">{currentStep.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentStep.body}</p>
            </div>

            {currentStep.checklist && (
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Things to think about
                </p>
                <ul className="space-y-2.5">
                  {currentStep.checklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {!isLastStep ? (
            <Button
              className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground border-0"
              onClick={() => setStep(step + 1)}
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground border-0"
              onClick={() => navigate("/learn")}
            >
              Done ✓
            </Button>
          )}
        </div>

        {/* Resources & AI button on last step */}
        {showResources && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            {resources && resources.length > 0 && (
              <div>
                <p className="text-sm font-display font-semibold mb-2">Trusted resources</p>
                <div className="space-y-2">
                  {resources.map((r) => (
                    <ResourceCard key={r.id} resource={r} />
                  ))}
                </div>
              </div>
            )}

            <Link
              to={`/ai?prompt=${encodeURIComponent(moment.aiPrompt)}`}
              className="block"
            >
              <div className="bg-card rounded-xl p-4 border border-primary/20 flex items-center gap-3 hover:border-primary/40 transition-colors">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Ask the AI about this</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{moment.aiPrompt}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
