import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bird, Home, PieChart, Target, BookOpen, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import BottomNav from "./BottomNav";
import FalconLogo from "./FalconLogo";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/budget", icon: PieChart, label: "Budget" },
  { path: "/goals", icon: Target, label: "Goals" },
  { path: "/learn", icon: BookOpen, label: "Learn" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAIPage = location.pathname === "/ai";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop top bar — Netflix/YouTube style */}
      <header className="hidden md:flex sticky top-0 z-40 h-16 items-center justify-between px-8 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <Link to="/" className="flex items-center gap-2">
          <FalconLogo size={36} />
          <span className="font-display font-bold text-lg tracking-tight">Falcon</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground bg-secondary/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="desktop-active"
                    className="absolute inset-x-3 -bottom-[14px] h-[3px] rounded-full gradient-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/settings"
          className="w-9 h-9 rounded-full bg-secondary/60 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>
      </header>

      <main className="pb-24 md:pb-12 max-w-lg md:max-w-6xl mx-auto px-4 md:px-8">
        {children}
      </main>

      {/* Floating Ask Falcon AI button – visible on all pages except /ai */}
      {!isAIPage && (
        <Link to="/ai" className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50">
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
