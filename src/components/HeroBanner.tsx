import { motion } from "framer-motion";
import { ReactNode } from "react";
import FalconLogo from "@/components/FalconLogo";

type Breakpoint = "sm" | "md" | "lg";

interface HeroBannerProps {
  /** Small uppercase eyebrow text above the title */
  eyebrow?: ReactNode;
  /** Main heading content (string or JSX for gradient spans etc.) */
  title: ReactNode;
  /** Optional supporting paragraph beneath the title */
  subtitle?: ReactNode;
  /** Show the Falcon brand mark on the right */
  showLogo?: boolean;
  /**
   * Breakpoint at which the layout switches from stacked (mobile) to side-by-side.
   * Defaults to "sm".
   */
  sideBySideFrom?: Breakpoint;
  /** Logo size at the smallest (stacked) layout — defaults to 96 */
  logoSizeSm?: number;
  /** Logo size from `sideBySideFrom` upward — defaults to 120 */
  logoSizeMd?: number;
  /** Logo size from `md:` (≥768px) upward — defaults to 140 */
  logoSizeLg?: number;
  /** Optional element rendered in the top-right of the banner (e.g., settings link) */
  topRightSlot?: ReactNode;
  className?: string;
}

const SIDE_BY_SIDE_CLASSES: Record<Breakpoint, string> = {
  sm: "sm:flex-row sm:items-center sm:justify-between",
  md: "md:flex-row md:items-center md:justify-between",
  lg: "lg:flex-row lg:items-center lg:justify-between",
};

const LOGO_MD_HEIGHT_CLASSES: Record<Breakpoint, string> = {
  sm: "sm:!h-[var(--hero-logo-md)]",
  md: "md:!h-[var(--hero-logo-md)]",
  lg: "lg:!h-[var(--hero-logo-md)]",
};

export default function HeroBanner({
  eyebrow,
  title,
  subtitle,
  showLogo = true,
  sideBySideFrom = "sm",
  logoSizeSm = 96,
  logoSizeMd = 120,
  logoSizeLg = 140,
  topRightSlot,
  className = "",
}: HeroBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl gradient-hero border border-border/60 p-6 md:p-12 ${className}`}
      style={
        {
          ["--hero-logo-md" as string]: `${logoSizeMd}px`,
        } as React.CSSProperties
      }
    >
      {topRightSlot && (
        <div className="absolute top-4 right-4 z-20">{topRightSlot}</div>
      )}
      <div
        className={`relative z-10 flex flex-col-reverse gap-6 ${SIDE_BY_SIDE_CLASSES[sideBySideFrom]}`}
      >
        <div className="space-y-3 max-w-2xl flex-1 min-w-0">
          {eyebrow && (
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-semibold text-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl md:text-6xl font-display font-bold leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm md:text-lg text-muted-foreground max-w-md">
              {subtitle}
            </p>
          )}
        </div>
        {showLogo && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
            className="shrink-0 self-center sm:self-auto"
          >
            <FalconLogo
              showWordmark
              size={logoSizeSm}
              className={`drop-shadow-[0_0_40px_hsl(268_75%_55%/0.7)] ${LOGO_MD_HEIGHT_CLASSES[sideBySideFrom]} md:!h-[${logoSizeLg}px]`}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
