import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bird, ChevronRight, Smartphone, Plane, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useAwardXP } from "@/hooks/useGamification";
import FalconLogo from "@/components/FalconLogo";

const AGE_RANGES = ["15-17", "18-21"];
const INCOME_BANDS = [
  { value: "0-50", label: "£0 – £50" },
  { value: "50-150", label: "£50 – £150" },
  { value: "150+", label: "£150+" },
];
const MONEY_GOALS = [
  "Saving for something big",
  "Managing my spending",
  "Understanding money basics",
];
const SAVING_FOR = [
  { value: "tech", label: "Tech", icon: Smartphone },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "independence", label: "Independence", icon: Sparkles },
  { value: "other", label: "Something else", icon: HelpCircle },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [incomeBand, setIncomeBand] = useState("");
  const [moneyGoal, setMoneyGoal] = useState("");
  const [otherGoal, setOtherGoal] = useState("");
  const [savingFor, setSavingFor] = useState("");

  const updateProfile = useUpdateProfile();
  const awardXP = useAwardXP();

  const canNext = () => {
    if (step === 0) return firstName.trim().length > 0;
    if (step === 1) return ageRange.length > 0;
    if (step === 2) return incomeBand.length > 0;
    if (step === 3) return moneyGoal.length > 0 || otherGoal.trim().length > 0;
    if (step === 4) return savingFor.length > 0;
    return false;
  };

  const handleFinish = async () => {
    await updateProfile.mutateAsync({
      first_name: firstName.trim(),
      age_range: ageRange,
      income_band: incomeBand,
      money_goal: moneyGoal === "Other" ? otherGoal : moneyGoal,
      saving_for: savingFor,
      onboarding_completed: true,
    });
    awardXP.mutate({ amount: 25, reason: "Completed onboarding" });
  };

  const next = () => {
    if (step < 4) setStep(step + 1);
    else handleFinish();
  };

  const slideVariants = {
    enter: { x: 80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 pt-12 pb-8">
      {/* Brand mark */}
      <div className="flex justify-center mb-8">
        <FalconLogo showWordmark size={72} className="drop-shadow-[0_0_22px_hsl(268_75%_55%/0.5)]" />
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-10 max-w-sm mx-auto w-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "gradient-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl font-display font-bold">What's your name?</h1>
                  <p className="text-sm text-muted-foreground">We'll use this to personalise your experience</p>
                </div>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="h-14 rounded-xl text-lg"
                  autoFocus
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl font-display font-bold">How old are you?</h1>
                  <p className="text-sm text-muted-foreground">This helps us tailor content for you</p>
                </div>
                <div className="space-y-3">
                  {AGE_RANGES.map((range) => (
                    <button
                      key={range}
                      onClick={() => setAgeRange(range)}
                      className={`w-full h-14 rounded-xl border-2 font-medium text-sm transition-all ${
                        ageRange === range
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      {range} years old
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl font-display font-bold">Monthly income?</h1>
                  <p className="text-sm text-muted-foreground">Roughly, from jobs, pocket money, etc.</p>
                </div>
                <div className="space-y-3">
                  {INCOME_BANDS.map((band) => (
                    <button
                      key={band.value}
                      onClick={() => setIncomeBand(band.value)}
                      className={`w-full h-14 rounded-xl border-2 font-medium text-sm transition-all ${
                        incomeBand === band.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      {band.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl font-display font-bold">Top money goal?</h1>
                  <p className="text-sm text-muted-foreground">Pick the one that matters most right now</p>
                </div>
                <div className="space-y-3">
                  {MONEY_GOALS.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => { setMoneyGoal(goal); setOtherGoal(""); }}
                      className={`w-full h-14 rounded-xl border-2 font-medium text-sm transition-all text-left px-5 ${
                        moneyGoal === goal
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                  <Input
                    value={otherGoal}
                    onChange={(e) => { setOtherGoal(e.target.value); setMoneyGoal("Other"); }}
                    placeholder="Other — type your own"
                    className="h-14 rounded-xl"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl font-display font-bold">What are you saving for?</h1>
                  <p className="text-sm text-muted-foreground">Just a fun one — no wrong answers!</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {SAVING_FOR.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setSavingFor(item.value)}
                      className={`h-28 rounded-xl border-2 font-medium text-sm transition-all flex flex-col items-center justify-center gap-2 ${
                        savingFor === item.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <item.icon className="w-7 h-7" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Button
          onClick={next}
          disabled={!canNext() || updateProfile.isPending}
          className="w-full h-14 rounded-xl font-semibold gradient-primary text-primary-foreground border-0 mt-8"
          size="lg"
        >
          {step === 4 ? (updateProfile.isPending ? "Saving..." : "Let's go! 🚀") : (
            <>
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
