import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bird, Home, PieChart, Target, BookOpen, Settings as SettingsIcon, X } from "lucide-react";
import { motion } from "framer-motion";
import BottomNav from "./BottomNav";
import FalconLogo from "./FalconLogo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/budget", icon: PieChart, label: "Budget" },
  { path: "/goals", icon: Target, label: "Goals" },
  { path: "/learn", icon: BookOpen, label: "Learn" },
];

const DEMO_EMAIL = "demo@soarwithfalcon.com";
const DEMO_BANNER_KEY = "falcon.demo.banner";

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAIPage = location.pathname === "/ai";
  const isDemo = user?.email === DEMO_EMAIL;

  const [showDemoBanner, setShowDemoBanner] = useState(false);

  useEffect(() => {
    if (isDemo && typeof window !== "undefined" && !sessionStorage.getItem(DEMO_BANNER_KEY)) {
      setShowDemoBanner(true);
    } else {
      setShowDemoBanner(false);
    }
  }, [isDemo]);

  const dismissBanner = () => {
    sessionStorage.setItem(DEMO_BANNER_KEY, "1");
    setShowDemoBanner(false);
  };

  const signUpFree = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop top bar — Netflix/YouTube style */}
      <header className="hidden md:flex sticky top-0 z-40 h-32 items-center justify-between px-8 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <Link to="/" className="flex items-center hover-scale">
          <FalconLogo showWordmark size={104} className="drop-shadow-[0_0_28px_hsl(268_75%_55%/0.6)]" />
        </Link>

        <Link
          to="/settings"
          className="w-9 h-9 rounded-full bg-secondary/60 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>
      </header>

      {showDemoBanner && (
        <div className="sticky top-0 md:top-32 z-30 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs px-4 py-2 flex items-center justify-between gap-3 shadow-sm">
          <span className="truncate">
            👀 You're in demo mode —{" "}
            <button onClick={signUpFree} className="underline font-semibold hover:opacity-90">
              Sign up free
            </button>{" "}
            to save your own data
          </span>
          <button
            onClick={dismissBanner}
            aria-label="Dismiss"
            className="shrink-0 w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <main className="pb-36 md:pb-40 max-w-lg md:max-w-6xl mx-auto px-4 md:px-8">
        {children}
      </main>

      {/* Floating Ask Falcon AI button – visible on all pages except /ai */}
      {!isAIPage && (
        <Link to="/ai" className="fixed bottom-44 md:bottom-44 right-4 md:right-8 z-50">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 gradient-primary text-primary-foreground pl-3 pr-4 py-3 rounded-full shadow-[0_8px_30px_hsl(268_75%_45%/0.5)] hover:shadow-[0_12px_40px_hsl(268_75%_45%/0.65)] transition-shadow"
          >
            <Bird className="w-4 h-4" />
            <span className="text-xs font-semibold whitespace-nowrap">Ask Falcon AI</span>
          </motion.div>
        </Link>
      )}

      <BottomNav />
    </div>
  );
}
