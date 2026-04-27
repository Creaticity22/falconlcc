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
      whileHover={{ y: -2 }}
      className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)] group"
    >
      {/* Accent strip */}
      <div className={`${gradient} h-1 w-full`} />
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{title}</span>
          <div className={`w-8 h-8 rounded-lg ${gradient} flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl md:text-3xl font-display font-bold tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
