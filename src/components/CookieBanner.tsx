import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const KEY = "falcon.cookies.accepted";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(KEY, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[60] bg-card/95 backdrop-blur-xl border-t border-border/60 px-4 py-3 md:px-8"
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <p className="text-xs md:text-sm text-foreground/90 flex-1">
              We use essential cookies only to keep you signed in. No tracking or advertising cookies.{" "}
              <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
            </p>
            <Button onClick={accept} size="sm" className="rounded-lg gradient-primary text-primary-foreground border-0 shrink-0">
              Got it
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
