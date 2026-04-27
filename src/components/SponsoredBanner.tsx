import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Gift, Target, Award, Info } from "lucide-react";
import { useState } from "react";
import {
  SponsoredCampaign,
  SponsorPartner,
  SponsorRewardMechanic,
} from "@/lib/sponsoredRewards";

interface SponsoredBannerProps {
  campaign: SponsoredCampaign & { partner: SponsorPartner };
  /**
   * Visual variant. Cards mirror Falcon's existing surfaces.
   * - "dashboard": full-width card with prominent reward chip
   * - "compact":   shorter card for rails / lists
   * - "header":    inline strip used for badge / mission headers
   */
  variant?: "dashboard" | "compact" | "header";
  className?: string;
}

const REWARD_ICON: Record<SponsorRewardMechanic, typeof Sparkles> = {
  bonus_xp: Sparkles,
  sponsored_reward: Gift,
  sponsored_mission: Target,
  sponsored_badge: Award,
};

function isExternal(href?: string) {
  if (!href) return false;
  return /^https?:\/\//i.test(href);
}

export default function SponsoredBanner({
  campaign,
  variant = "dashboard",
  className = "",
}: SponsoredBannerProps) {
  const [showInfo, setShowInfo] = useState(false);
  const { partner } = campaign;
  const RewardIcon = REWARD_ICON[campaign.reward.mechanic];
  const external = isExternal(campaign.ctaHref);

  const Wrapper: React.ElementType =
    campaign.ctaHref && !external ? Link : campaign.ctaHref ? "a" : "div";
  const wrapperProps: Record<string, unknown> = campaign.ctaHref
    ? external
      ? { href: campaign.ctaHref, target: "_blank", rel: "noopener noreferrer" }
      : { to: campaign.ctaHref }
    : {};

  if (variant === "header") {
    return (
      <div
        className={`relative flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2 ${className}`}
        role="complementary"
        aria-label={`Sponsored by ${partner.name}`}
      >
        <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground shrink-0">
          Sponsored
        </span>
        <div className="w-7 h-7 rounded-md overflow-hidden bg-card border border-border/40 shrink-0">
          <img
            src={partner.logoUrl}
            alt={`${partner.name} logo`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <p className="text-xs text-foreground/85 leading-snug truncate">
          <span className="font-semibold">{campaign.headline}</span>
          <span className="text-muted-foreground"> · {partner.name}</span>
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      <Wrapper
        {...wrapperProps}
        className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-colors"
        aria-label={`Sponsored opportunity from ${partner.name}: ${campaign.headline}`}
      >
        {/* Subtle accent wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5 pointer-events-none" />

        <div
          className={`relative flex ${
            variant === "compact" ? "p-4 gap-3" : "p-5 md:p-6 gap-4 md:gap-5"
          } items-center`}
        >
          {/* Partner logo */}
          <div
            className={`${
              variant === "compact" ? "w-12 h-12" : "w-16 h-16 md:w-20 md:h-20"
            } rounded-xl overflow-hidden bg-card border border-border/50 shrink-0 shadow-sm`}
          >
            <img
              src={partner.logoUrl}
              alt={`${partner.name} logo`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-muted-foreground bg-secondary/60 border border-border/40 px-1.5 py-0.5 rounded">
                Sponsored
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground truncate">
                {partner.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowInfo((v) => !v);
                }}
                className="ml-auto text-muted-foreground hover:text-primary transition-colors"
                aria-label="What is sponsored content?"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>

            <p
              className={`font-display font-bold leading-tight ${
                variant === "compact" ? "text-sm" : "text-base md:text-lg"
              }`}
            >
              {campaign.headline}
            </p>
            {campaign.subline && variant !== "compact" && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {campaign.subline}
              </p>
            )}

            {/* Reward chip */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] md:text-[11px] font-bold px-2 py-1 rounded-full bg-primary/12 text-primary border border-primary/25">
                <RewardIcon className="w-3 h-3" />
                {campaign.reward.label}
              </span>
              {campaign.ctaLabel && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-primary-glow ml-auto">
                  {campaign.ctaLabel}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </div>
          </div>
        </div>

        {showInfo && (
          <div className="relative px-5 md:px-6 pb-4 -mt-1">
            <p className="text-[11px] text-muted-foreground leading-relaxed bg-secondary/40 border border-border/40 rounded-lg p-2.5">
              Sponsored content on Falcon is always tied to a learning, habit, or
              reward opportunity — never a traditional ad.
              {partner.description ? ` ${partner.description}` : ""}
            </p>
          </div>
        )}
      </Wrapper>
    </motion.div>
  );
}
