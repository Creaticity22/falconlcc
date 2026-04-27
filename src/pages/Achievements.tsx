import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Share2, Copy, ExternalLink, ShieldCheck, X, Linkedin } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import FalconLogo from "@/components/FalconLogo";
import BadgeMedallion from "@/components/BadgeMedallion";
import CertificateCard from "@/components/CertificateCard";
import SponsoredBanner from "@/components/SponsoredBanner";
import { Button } from "@/components/ui/button";
import { getSponsoredCampaigns } from "@/lib/sponsoredRewards";
import {
  useBadgeCatalogue,
  useCertificateCatalogue,
  useUserBadges,
  useUserCertificates,
  useSyncAchievements,
  type Badge,
  type Certificate,
} from "@/hooks/useAchievements";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  budgeting: "Budgeting",
  saving: "Saving",
  investing: "Knowledge & Investing",
  decision: "Decision Making",
  behaviour: "Behaviour",
  milestone: "Milestones",
};

const CATEGORY_ORDER = ["budgeting", "saving", "investing", "decision", "behaviour", "milestone"];

export default function Achievements() {
  const { data: badges = [] } = useBadgeCatalogue();
  const { data: certificates = [] } = useCertificateCatalogue();
  const { data: userBadges = [] } = useUserBadges();
  const { data: userCertificates = [] } = useUserCertificates();
  const sync = useSyncAchievements();

  const [openBadge, setOpenBadge] = useState<Badge | null>(null);
  const [openCert, setOpenCert] = useState<Certificate | null>(null);

  // Run achievements sync on mount (silent, additive)
  useEffect(() => {
    sync.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const earnedBadgeMap = useMemo(
    () => new Map(userBadges.map((ub) => [ub.badge_code, ub])),
    [userBadges]
  );
  const earnedCertMap = useMemo(
    () => new Map(userCertificates.map((uc) => [uc.certificate_code, uc])),
    [userCertificates]
  );

  const grouped = useMemo(() => {
    const map: Record<string, Badge[]> = {};
    for (const b of badges) {
      (map[b.category] ||= []).push(b);
    }
    return map;
  }, [badges]);

  const earnedCount = userBadges.length;
  const totalCount = badges.length;

  return (
    <AppLayout>
      <div className="pt-6 pb-6">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground mb-5">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <div className="md:hidden mb-5">
          <FalconLogo showWordmark size={56} className="drop-shadow-[0_0_16px_hsl(268_75%_55%/0.45)]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6 md:p-10 bg-gradient-to-br from-primary/25 via-card to-accent/15 border border-primary/30"
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold mb-2">
              <ShieldCheck className="w-4 h-4" /> Falcon Achievements
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-2">
              Your badges & certificates
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Stack badges to unlock shareable certificates. Each one comes with a public verification link you can add to LinkedIn or your CV.
            </p>
            <div className="flex items-center gap-6 mt-5">
              <Stat label="Badges" value={`${earnedCount}/${totalCount}`} />
              <Stat label="Certificates" value={`${userCertificates.length}/${certificates.length}`} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Certificates */}
      <section className="space-y-4 mb-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display font-bold text-2xl">Certificates</h2>
          <span className="text-xs text-muted-foreground">Issued by Falcon</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {certificates.map((c) => {
            const earnedBadgesForCert = c.required_badge_codes.filter((b) => earnedBadgeMap.has(b)).length;
            const ucert = earnedCertMap.get(c.code);
            return (
              <CertificateCard
                key={c.code}
                certificate={c}
                earned={!!ucert}
                progress={{ earned: earnedBadgesForCert, total: c.required_badge_codes.length }}
                verificationCode={ucert?.verification_code}
                recipientName={ucert?.recipient_name}
                issuedAt={ucert?.issued_at}
                onClick={() => setOpenCert(c)}
              />
            );
          })}
        </div>
      </section>

      {/* Badges by category */}
      <section className="space-y-8 mb-10">
        <h2 className="font-display font-bold text-2xl">Badges</h2>
        {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => (
          <div key={cat}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {CATEGORY_LABELS[cat]}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {grouped[cat].map((b) => (
                <BadgeMedallion
                  key={b.code}
                  badge={b}
                  earned={earnedBadgeMap.has(b.code)}
                  onClick={() => setOpenBadge(b)}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {openBadge && (
        <DetailModal
          title={openBadge.name}
          subtitle={CATEGORY_LABELS[openBadge.category]}
          description={openBadge.description}
          criteria={openBadge.criteria}
          skills={openBadge.skills}
          earned={earnedBadgeMap.has(openBadge.code)}
          issuedAt={earnedBadgeMap.get(openBadge.code)?.issued_at}
          verificationCode={earnedBadgeMap.get(openBadge.code)?.verification_code}
          kind="badge"
          badgeCode={openBadge.code}
          onClose={() => setOpenBadge(null)}
        />
      )}

      {openCert && (
        <DetailModal
          title={openCert.name}
          subtitle={`Falcon · Tier ${openCert.tier}`}
          description={openCert.description}
          criteria={`Earn all of: ${openCert.required_badge_codes
            .map((c) => badges.find((b) => b.code === c)?.name ?? c)
            .join(", ")}`}
          skills={openCert.skills}
          earned={earnedCertMap.has(openCert.code)}
          issuedAt={earnedCertMap.get(openCert.code)?.issued_at}
          verificationCode={earnedCertMap.get(openCert.code)?.verification_code}
          kind="certificate"
          onClose={() => setOpenCert(null)}
        />
      )}
    </AppLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-display font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

interface DetailModalProps {
  title: string;
  subtitle: string;
  description: string;
  criteria: string;
  skills: string[];
  earned: boolean;
  issuedAt?: string;
  verificationCode?: string;
  kind: "badge" | "certificate";
  onClose: () => void;
}

function DetailModal({
  title,
  subtitle,
  description,
  criteria,
  skills,
  earned,
  issuedAt,
  verificationCode,
  kind,
  onClose,
}: DetailModalProps) {
  const verifyUrl = verificationCode
    ? `${window.location.origin}/verify/${kind === "badge" ? "b" : "c"}/${verificationCode}`
    : "";

  const copyLink = async () => {
    if (!verifyUrl) return;
    await navigator.clipboard.writeText(verifyUrl);
    toast.success("Verification link copied");
  };

  const shareLinkedIn = () => {
    if (!verifyUrl) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-card border border-border/60 p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full hover:bg-secondary/70"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 grid place-items-center rounded-xl gradient-primary text-primary-foreground">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              {subtitle}
            </div>
            <h3 className="font-display font-bold text-xl leading-tight">{title}</h3>
          </div>
        </div>

        <p className="text-sm text-foreground/80 mb-3">{description}</p>

        <div className="rounded-lg bg-secondary/40 border border-border/40 p-3 mb-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            How to earn
          </div>
          <p className="text-xs text-foreground/80">{criteria}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.map((s) => (
            <span
              key={s}
              className="text-[10px] font-medium px-2 py-[3px] rounded-full bg-secondary/60 border border-border/40"
            >
              {s}
            </span>
          ))}
        </div>

        {earned && verificationCode ? (
          <div className="space-y-3">
            <div className="text-[11px] text-muted-foreground">
              Issued{" "}
              {issuedAt &&
                new Date(issuedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
              · by Falcon
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={copyLink} variant="secondary" size="sm" className="w-full">
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy link
              </Button>
              <Button onClick={shareLinkedIn} size="sm" className="w-full">
                <Linkedin className="w-3.5 h-3.5 mr-1.5" /> Share
              </Button>
            </div>
            <Link
              to={`/verify/${kind === "badge" ? "b" : "c"}/${verificationCode}`}
              className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
            >
              View public verification page <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 p-3 text-center text-xs text-muted-foreground">
            Locked — complete the criteria above to unlock.
          </div>
        )}
      </motion.div>
    </div>
  );
}
