import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bird, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Auth() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [showEmail, setShowEmail] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Bird className="w-10 h-10 text-primary" />
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
      } else if (isSignUp) {
        toast.success("Check your email to verify your account!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className="w-20 h-20 rounded-2xl gradient-primary mx-auto flex items-center justify-center shadow-lg"
          >
            <Bird className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold">Falcon</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Level up your money skills
          </p>
        </div>

        {/* Auth buttons */}
        <div className="space-y-3">
          <Button
            onClick={signInWithGoogle}
            className="w-full h-12 rounded-xl font-semibold text-sm gradient-primary text-primary-foreground border-0 shadow-md"
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
              className="w-full h-12 rounded-xl font-semibold text-sm"
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
                className="h-12 rounded-xl"
                required
              />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
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
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
              </button>
            </motion.form>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          Falcon is educational only and does not provide regulated financial advice.
        </p>
      </motion.div>
    </div>
  );
}
