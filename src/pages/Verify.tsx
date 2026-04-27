import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ShieldCheck, Award, ExternalLink, Copy, Linkedin } from "lucide-react";
import FalconLogo from "@/components/FalconLogo";
import { Button } from "@/components/ui/button";
import {
  fetchBadgeByVerificationCode,
  fetchCertificateByVerificationCode,
  type Badge,
  type Certificate,
} from "@/hooks/useAchievements";
import { toast } from "sonner";

interface VerifiedBadge {
  kind: "badge";
  catalogue: Badge;
  issuedAt: string;
  recipientName: string | null;
  verificationCode: string;
}
interface VerifiedCertificate {
  kind: "certificate";
  catalogue: Certificate;
  issuedAt: string;
  recipientName: string | null;
  verificationCode: string;
}

type VerifiedItem = VerifiedBadge | VerifiedCertificate;

export default function Verify() {
  const { kind, code } = useParams<{ kind: string; code: string }>();
  const [item, setItem] = useState<VerifiedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!code) return;
      setLoading(true);
      try {
        if (kind === "b") {
          const res = await fetchBadgeByVerificationCode(code);
          if (!active) return;
          if (res?.badge) {
            setItem({
              kind: "badge",
              catalogue: res.badge,
              issuedAt: res.userBadge.issued_at,
              recipientName: res.userBadge.recipient_name,
              verificationCode: res.userBadge.verification_code,
            });
          } else {
            setNotFound(true);
          }
        } else if (kind === "c") {
          const res = await fetchCertificateByVerificationCode(code);
          if (!active) return;
          if (res?.certificate) {
            setItem({
              kind: "certificate",
              catalogue: res.certificate,
              issuedAt: res.userCertificate.issued_at,
              recipientName: res.userCertificate.recipient_name,
              verificationCode: res.userCertificate.verification_code,
            });
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [kind, code]);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Verification link copied");
  };
  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const title = item
    ? `${item.catalogue.name} — Verified by Falcon`
    : "Verify Falcon achievement";
  const description = item
    ? `${item.recipientName ?? "A Falcon learner"} earned the ${item.catalogue.name} ${item.kind} from Falcon.`
    : "Public verification page for Falcon badges and certificates.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description.slice(0, 160)} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description.slice(0, 160)} />
        <link rel="canonical" href={url} />
      </Helmet>

      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FalconLogo showWordmark size={40} className="drop-shadow-[0_0_14px_hsl(268_75%_55%/0.4)]" />
          </Link>
          <div className="flex items-center gap-1 text-xs font-semibold text-primary">
            <ShieldCheck className="w-4 h-4" /> Verification
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Verifying…</div>
        ) : notFound || !item ? (
          <NotFoundCard />
        ) : (
          <VerifiedView item={item} onCopy={copy} onShare={shareLinkedIn} />
        )}

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Issued by <span className="font-semibold text-foreground">Falcon</span> ·{" "}
          <Link to="/" className="hover:underline">
            Visit Falcon
          </Link>
        </footer>
      </main>
    </div>
  );
}

function NotFoundCard() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-secondary/60 grid place-items-center mb-4">
        <ShieldCheck className="w-7 h-7 text-muted-foreground" />
      </div>
      <h1 className="font-display font-bold text-2xl mb-1">Achievement not found</h1>
      <p className="text-muted-foreground text-sm">
        This verification link is invalid or has been revoked.
      </p>
    </div>
  );
}

function VerifiedView({
  item,
  onCopy,
  onShare,
}: {
  item: VerifiedItem;
  onCopy: () => void;
  onShare: () => void;
}) {
  const issuedLabel = new Date(item.issuedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isCert = item.kind === "certificate";
  const skills = item.catalogue.skills;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-card to-accent/10 p-8 md:p-12"
    >
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold mb-6">
          <ShieldCheck className="w-4 h-4" />
          {isCert ? "Verified Certificate" : "Verified Badge"}
        </div>

        <div className="flex items-start gap-5 mb-6">
          <div className="w-20 h-20 grid place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-[0_8px_30px_hsl(268_75%_45%/0.4)]">
            <Award className="w-10 h-10" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-1">
              {item.catalogue.name}
            </h1>
            <p className="text-muted-foreground">{item.catalogue.description}</p>
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-4 mb-6">
          <Field label="Recipient" value={item.recipientName || "Falcon learner"} />
          <Field label="Issuer" value="Falcon" />
          <Field label="Issued" value={issuedLabel} />
          <Field
            label={isCert ? "Tier" : "Level"}
            value={isCert ? `Tier ${item.catalogue.tier}` : tierName(item.catalogue.tier)}
          />
        </dl>

        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2">
            Skills covered
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-background/60 border border-border/60"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-background/60 border border-border/50 p-4 mb-6">
          <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
            Completion criteria
          </div>
          <p className="text-sm">
            {isCert
              ? `Awarded automatically by Falcon upon collecting all required skill badges.`
              : (item.catalogue as Badge).criteria}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onShare} size="sm">
            <Linkedin className="w-4 h-4 mr-1.5" /> Share on LinkedIn
          </Button>
          <Button onClick={onCopy} size="sm" variant="secondary">
            <Copy className="w-4 h-4 mr-1.5" /> Copy link
          </Button>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-2"
          >
            About Falcon <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="mt-6 pt-4 border-t border-border/40 text-[11px] text-muted-foreground font-mono break-all">
          Verification ID: {item.verificationCode}
        </div>
      </div>
    </motion.article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold">{value}</dd>
    </div>
  );
}

function tierName(t: number) {
  return t === 3 ? "Gold" : t === 2 ? "Silver" : "Bronze";
}
