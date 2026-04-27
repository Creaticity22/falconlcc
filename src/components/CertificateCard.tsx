import { motion } from "framer-motion";
import { Award, Lock, ShieldCheck } from "lucide-react";
import { Certificate } from "@/hooks/useAchievements";

interface CertificateCardProps {
  certificate: Certificate;
  earned: boolean;
  progress: { earned: number; total: number };
  verificationCode?: string;
  recipientName?: string | null;
  issuedAt?: string;
  onClick?: () => void;
}

const TIER_BADGE: Record<number, string> = {
  1: "bg-amber-700/20 text-amber-200 border-amber-500/40",
  2: "bg-slate-300/15 text-slate-100 border-slate-300/40",
  3: "bg-yellow-500/20 text-yellow-100 border-yellow-300/50",
};

const TIER_LABEL: Record<number, string> = {
  1: "Foundation",
  2: "Advanced",
  3: "Mastery",
};

export default function CertificateCard({
  certificate,
  earned,
  progress,
  verificationCode,
  recipientName,
  issuedAt,
  onClick,
}: CertificateCardProps) {
  const pct = progress.total === 0 ? 0 : Math.min(100, Math.round((progress.earned / progress.total) * 100));

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      className={`text-left w-full rounded-2xl overflow-hidden border transition-all ${
        earned
          ? "border-primary/50 bg-gradient-to-br from-primary/15 via-card to-accent/10 shadow-[0_8px_30px_hsl(268_75%_45%/0.25)]"
          : "border-border/50 bg-card/60"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl grid place-items-center ${
                earned ? "gradient-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground"
              }`}
            >
              {earned ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <span
                className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-[2px] rounded-full border ${TIER_BADGE[certificate.tier]}`}
              >
                {TIER_LABEL[certificate.tier]}
              </span>
              <h3 className="font-display font-bold text-lg leading-tight mt-1">{certificate.name}</h3>
            </div>
          </div>
          {earned && (
            <div className="flex items-center gap-1 text-[10px] text-primary font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{certificate.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {certificate.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-[10px] font-medium px-2 py-[3px] rounded-full bg-secondary/60 text-foreground/80 border border-border/40"
            >
              {s}
            </span>
          ))}
        </div>

        {!earned && (
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">
                {progress.earned}/{progress.total} badges
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
              <div className="h-full gradient-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {earned && issuedAt && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
            <span>Issued {new Date(issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            {verificationCode && <span className="font-mono">/verify/{verificationCode.slice(0, 6)}…</span>}
          </div>
        )}
      </div>
    </motion.button>
  );
}
