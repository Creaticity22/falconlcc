import { motion } from "framer-motion";
import { Bird } from "lucide-react";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ fullScreen = false, size = 40, className = "" }: LoadingSpinnerProps) {
  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      <Bird style={{ width: size, height: size }} className="text-primary" />
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>;
}
