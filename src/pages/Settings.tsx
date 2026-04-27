import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Star, Flame, Trophy, ExternalLink, Shield, Award, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import FalconLogo from "@/components/FalconLogo";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";

const RESOURCES = [
  { name: "MoneyHelper", url: "https://www.moneyhelper.org.uk/en" },
  { name: "Young Money", url: "https://www.young-money.org.uk/" },
  { name: "Gov.uk – Money", url: "https://www.gov.uk/browse/tax" },
];

export default function Settings() {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: gamification } = useGamification();

  return (
    <AppLayout>
      <div className="pt-6 pb-6">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground mb-5">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <div className="md:hidden mb-5">
          <FalconLogo showWordmark size={56} className="drop-shadow-[0_0_16px_hsl(268_75%_55%/0.45)]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 border border-border/50">
          <h2 className="font-display font-semibold text-base mb-3">Profile</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{profile?.first_name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age range</span>
              <span className="font-medium">{profile?.age_range ?? "—"}</span>
            </div>
          </div>
        </motion.section>

        {/* Gamification */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-4 border border-border/50">
          <h2 className="font-display font-semibold text-base mb-3">Your stats</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="w-10 h-10 rounded-lg gradient-xp mx-auto flex items-center justify-center mb-1">
                <Star className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="font-display font-bold">{gamification?.xp_points ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">XP Points</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-streak mx-auto flex items-center justify-center mb-1">
                <Flame className="w-5 h-5 text-streak-foreground" />
              </div>
              <p className="font-display font-bold">{gamification?.streak_days ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Day streak</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg gradient-accent mx-auto flex items-center justify-center mb-1">
                <Trophy className="w-5 h-5 text-accent-foreground" />
              </div>
              <p className="font-display font-bold">{(gamification?.badges as string[])?.length ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Badges</p>
            </div>
          </div>
        </motion.section>

        {/* Achievements entry */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Link
            to="/achievements"
            className="flex items-center justify-between bg-gradient-to-br from-primary/15 via-card to-accent/10 rounded-xl p-4 border border-primary/30 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary grid place-items-center">
                <Award className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm">Badges & certificates</p>
                <p className="text-[11px] text-muted-foreground">Verifiable achievements for LinkedIn & CV</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </motion.div>

        {/* Help & Resources */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl p-4 border border-border/50">
          <h2 className="font-display font-semibold text-base mb-3">Help & Resources</h2>
          <div className="space-y-2">
            {RESOURCES.map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 text-sm hover:text-primary transition-colors"
              >
                {r.name}
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        </motion.section>

        {/* Disclaimer */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-muted/50 rounded-xl p-4 border border-border/30">
          <div className="flex gap-2">
            <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-semibold text-xs mb-1">Important disclaimer</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Falcon is an educational tool designed to help young people in the UK learn about money management. It does not provide regulated financial advice. For personalised advice, please consult a qualified financial adviser registered with the FCA.
              </p>
            </div>
          </div>
        </motion.section>

        <Button
          onClick={signOut}
          variant="outline"
          className="w-full rounded-xl h-12 text-destructive border-destructive/20 hover:bg-destructive/5"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </div>
    </AppLayout>
  );
}
