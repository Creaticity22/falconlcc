import { motion } from "framer-motion";
import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  gradient?: string;
}

export default function KPICard({ title, value, subtitle, icon, gradient = "gradient-primary" }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
    >
      <div className={`${gradient} p-4 text-primary-foreground`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium opacity-90">{title}</span>
          <div className="opacity-80">{icon}</div>
        </div>
        <p className="text-2xl font-display font-bold">{value}</p>
        {subtitle && <p className="text-xs opacity-80 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
