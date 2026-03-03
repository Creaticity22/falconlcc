import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bird } from "lucide-react";
import { motion } from "framer-motion";
import BottomNav from "./BottomNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAIPage = location.pathname === "/ai";

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 max-w-lg mx-auto px-4">
        {children}
      </main>

      {/* Floating Ask Falcon AI button – visible on all pages except /ai */}
      {!isAIPage && (
        <Link to="/ai" className="fixed bottom-20 right-4 z-50 max-w-lg">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-2 gradient-primary text-primary-foreground pl-3 pr-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-shadow"
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
