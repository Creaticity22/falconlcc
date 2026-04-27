/**
 * Sponsored Rewards – data-driven partner campaigns.
 *
 * Falcon does NOT show traditional ads. Every entry here MUST tie sponsored
 * content to a learning, behaviour, or rewards mechanic. Campaigns can be
 * rotated by editing this file — no other code changes required.
 *
 * Placement values (must match values used by SponsoredBanner consumers):
 *   - "dashboard"          → home dashboard rail
 *   - "rewards"            → rewards marketplace
 *   - "mission_header"     → top of a learning mission
 *   - "badge_header"       → header strip of a sponsored badge / certificate
 *   - "learn"              → learning hub sponsored opportunities rail
 */

import virtualSportLogo from "@/assets/sponsors/virtual-sport-group.jpg";

export type SponsorPlacement =
  | "dashboard"
  | "rewards"
  | "mission_header"
  | "badge_header"
  | "learn";

export type SponsorRewardMechanic =
  | "bonus_xp"
  | "sponsored_reward"
  | "sponsored_mission"
  | "sponsored_badge";

export interface SponsorPartner {
  /** Stable id used in code (e.g. for badge sponsorship lookup). */
  id: string;
  name: string;
  logoUrl: string;
  /** Optional brand colour (HSL string, no `hsl()` wrapper) used for soft accents only. */
  accentHsl?: string;
  /** Public partner site, opened in a new tab. */
  websiteUrl?: string;
  /** Short, youth-friendly description shown on disclosure / detail. */
  description?: string;
}

export interface SponsoredCampaign {
  id: string;
  partnerId: string;
  /** Short headline – keep to one line on mobile. */
  headline: string;
  /** Optional sub-line for additional context. */
  subline?: string;
  /** Call-to-action label (e.g. "Start mission", "Redeem"). Optional. */
  ctaLabel?: string;
  /** Internal route OR external URL. External links open in a new tab. */
  ctaHref?: string;
  /** What the user actually earns. Reward-first framing. */
  reward: {
    mechanic: SponsorRewardMechanic;
    /** Plain-English description of the reward. */
    label: string;
    /** Optional bonus XP amount when mechanic = bonus_xp. */
    xp?: number;
  };
  placements: SponsorPlacement[];
  /** ISO start / end – campaign hidden outside this window. */
  startsAt: string;
  endsAt: string;
  /** Optional: the badge code this campaign sponsors (for badge_header). */
  sponsoredBadgeCode?: string;
}

// --------------------------------------------------------------------------
// Partners
// --------------------------------------------------------------------------

export const SPONSOR_PARTNERS: Record<string, SponsorPartner> = {
  virtual_sport_group: {
    id: "virtual_sport_group",
    name: "Virtual Sport Group",
    logoUrl: virtualSportLogo,
    accentHsl: "28 88% 58%",
    websiteUrl: "https://virtualsportgroup.com",
    description:
      "Virtual Sport Group supports young people building healthy money habits through sport, teamwork and skill-building.",
  },
};

// --------------------------------------------------------------------------
// Campaigns
// --------------------------------------------------------------------------

export const SPONSORED_CAMPAIGNS: SponsoredCampaign[] = [
  {
    id: "vsg_smart_saving_mission",
    partnerId: "virtual_sport_group",
    headline: "Double XP on the Smart Saving mission",
    subline: "Complete a saving lesson this week to earn 2× XP, sponsored by Virtual Sport Group.",
    ctaLabel: "Start mission",
    ctaHref: "/learn",
    reward: {
      mechanic: "bonus_xp",
      label: "+50 bonus XP on completion",
      xp: 50,
    },
    placements: ["dashboard", "learn"],
    startsAt: "2025-01-01",
    endsAt: "2099-12-31",
  },
  {
    id: "vsg_rewards_market",
    partnerId: "virtual_sport_group",
    headline: "Redeem XP for sport & wellbeing vouchers",
    subline: "Sponsored rewards from Virtual Sport Group — turn learning into real-world perks.",
    ctaLabel: "View rewards",
    ctaHref: "/rewards",
    reward: {
      mechanic: "sponsored_reward",
      label: "Sponsored reward in the marketplace",
    },
    placements: ["rewards", "dashboard"],
    startsAt: "2025-01-01",
    endsAt: "2099-12-31",
  },
  {
    id: "vsg_smart_saver_badge",
    partnerId: "virtual_sport_group",
    headline: "Smart Saving — powered by Virtual Sport Group",
    subline: "This badge is supported by a partner who believes in young people's financial confidence.",
    reward: {
      mechanic: "sponsored_badge",
      label: "Sponsored badge",
    },
    placements: ["badge_header"],
    startsAt: "2025-01-01",
    endsAt: "2099-12-31",
    sponsoredBadgeCode: "saver_first_goal",
  },
];

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function isLive(c: SponsoredCampaign, now = new Date()): boolean {
  const start = new Date(c.startsAt).getTime();
  const end = new Date(c.endsAt).getTime();
  const t = now.getTime();
  return t >= start && t <= end;
}

export function getSponsoredCampaigns(
  placement: SponsorPlacement,
  opts?: { badgeCode?: string }
): Array<SponsoredCampaign & { partner: SponsorPartner }> {
  return SPONSORED_CAMPAIGNS.filter((c) => {
    if (!c.placements.includes(placement)) return false;
    if (!isLive(c)) return false;
    if (placement === "badge_header" && opts?.badgeCode) {
      return c.sponsoredBadgeCode === opts.badgeCode;
    }
    return true;
  })
    .map((c) => {
      const partner = SPONSOR_PARTNERS[c.partnerId];
      if (!partner) return null;
      return { ...c, partner };
    })
    .filter(Boolean) as Array<SponsoredCampaign & { partner: SponsorPartner }>;
}

export function getPartner(partnerId: string): SponsorPartner | undefined {
  return SPONSOR_PARTNERS[partnerId];
}
