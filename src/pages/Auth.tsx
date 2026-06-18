import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import FalconLogo from "@/components/FalconLogo";

const AGE_KEY = "falcon.agecheck.v1";

type AgeStage = "ask" | "under16" | "done";

export default function Auth() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [ageStage, setAgeStage] = useState<AgeStage>("done");
  const [showEmail, setShowEmail] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSending, setResetSending] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "demo@soarwithfalcon.com",
        password: "FalconDemo2026!",
      });
      if (error) {
        toast.error("Demo not available right now — please sign up instead.");
      } else {
        trackEvent("demo_login");
      }
    } catch {
      toast.error("Demo not available right now — please sign up instead.");
    } finally {
      setDemoLoading(false);
    }
  };



  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(AGE_KEY)) setAgeStage("ask");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <FalconLogo size={56} />
        </motion.div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    try {
      const fn = isSignUp ? signUpWithEmail : signInWithEmail;
      const { error } = await fn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        if (isSignUp) {
          toast.success("Check your email to verify your account!");
        }
        trackEvent(isSignUp ? "signup" : "login", { method: "email" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + "/auth",
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Check your email for a reset link.");
        setShowReset(false);
        setResetEmail("");
      }
    } finally {
      setResetSending(false);
    }
  };

  const acceptAge = (under16: boolean) => {
    localStorage.setItem(AGE_KEY, under16 ? "under16" : "16plus");
    setAgeStage("done");
  };

  // ===== Age gate =====
  if (ageStage === "ask") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8 text-center"
        >
          <div className="flex justify-center">
            <FalconLogo showWordmark size={140} />
          </div>
          <h1 className="font-display text-2xl font-bold">How old are you?</h1>
          <div className="space-y-3">
            <Button
              onClick={() => acceptAge(false)}
              className="w-full h-12 rounded-xl font-semibold gradient-primary text-primary-foreground border-0"
            >
              16 or over
            </Button>
            <Button
              onClick={() => setAgeStage("under16")}
              variant="outline"
              className="w-full h-12 rounded-xl font-semibold bg-secondary/40 border-border/60"
            >
              Under 16
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (ageStage === "under16") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6 text-center"
        >
          <div className="flex justify-center">
            <FalconLogo showWordmark size={120} />
          </div>
          <h2 className="font-display text-xl font-bold">You can still use Falcon!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We recommend a parent or guardian reads our{" "}
            <Link to="/privacy" className="text-primary underline">Privacy Policy</Link> with you first.
          </p>
          <Button
            onClick={() => acceptAge(true)}
            className="w-full h-12 rounded-xl font-semibold gradient-primary text-primary-foreground border-0"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  // ===== Main auth =====
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background relative overflow-hidden py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm space-y-10 relative z-10"
      >
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
            className="flex justify-center drop-shadow-[0_8px_30px_hsl(268_75%_45%/0.5)]"
          >
            <FalconLogo showWordmark size={200} />
          </motion.div>
          <p className="text-base md:text-lg text-muted-foreground font-medium">
            Level up your money skills
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => {
              trackEvent("login", { method: "google" });
              signInWithGoogle();
            }}
            className="w-full h-12 rounded-xl font-semibold text-sm gradient-primary text-primary-foreground border-0 shadow-[0_8px_30px_hsl(268_75%_45%/0.45)] hover:shadow-[0_12px_40px_hsl(268_75%_45%/0.6)] transition-shadow"
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {!showEmail ? (
            <Button
              onClick={() => setShowEmail(true)}
              variant="outline"
              className="w-full h-12 rounded-xl font-semibold text-sm bg-secondary/40 border-border/60 hover:bg-secondary"
              size="lg"
            >
              <Mail className="w-4 h-4 mr-2" />
              Continue with email
            </Button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleEmailAuth}
              className="space-y-3"
            >
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-secondary/40 border-border/60"
                required
              />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-secondary/40 border-border/60"
                minLength={6}
                required
              />
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl font-semibold gradient-primary text-primary-foreground border-0"
              >
                {submitting ? "..." : isSignUp ? "Sign up" : "Sign in"}
              </Button>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
                </button>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setShowReset((v) => !v)}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
          )}

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <Button
            onClick={handleDemo}
            disabled={demoLoading}
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold text-sm bg-secondary/30 border-border/60 hover:bg-secondary"
            size="lg"
          >
            {demoLoading ? "Signing in…" : "👀 Try a live demo — no sign-up needed"}
          </Button>
        </div>


              {showReset && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 pt-2 border-t border-border/40"
                >
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="h-11 rounded-xl bg-secondary/40 border-border/60"
                  />
                  <Button
                    type="button"
                    onClick={handleReset}
                    disabled={resetSending}
                    variant="outline"
                    className="w-full h-11 rounded-xl"
                  >
                    {resetSending ? "Sending..." : "Send reset link"}
                  </Button>
                </motion.div>
              )}
            </motion.form>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-center gap-3 text-[11px] text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
            <span>·</span>
            <Link to="/help" className="hover:text-foreground">Help</Link>
          </div>
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            Falcon is educational only and does not provide regulated financial advice.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
