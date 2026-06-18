import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Star, Flame, Trophy, ExternalLink, Shield, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import FalconLogo from "@/components/FalconLogo";
import HeroBanner from "@/components/HeroBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AGE_RANGES = ["15-17", "18-19", "20-21"];

const RESOURCES = [
  { name: "MoneyHelper", url: "https://www.moneyhelper.org.uk/en" },
  { name: "Young Money", url: "https://www.young-money.org.uk/" },
  { name: "Gov.uk – Money", url: "https://www.gov.uk/browse/tax" },
];

export default function Settings() {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: gamification } = useGamification();
  const updateProfile = useUpdateProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [ageRange, setAgeRange] = useState("");

  useEffect(() => {
    if (editOpen && profile) {
      setFirstName(profile.first_name ?? "");
      setAgeRange(profile.age_range ?? "");
    }
  }, [editOpen, profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        first_name: firstName.trim() || null,
        age_range: ageRange || null,
      });
      toast.success("Profile updated");
      setEditOpen(false);
    } catch {
      toast.error("Couldn't update profile");
    }
  };

  return (
    <AppLayout>
      <div className="pt-6 pb-6 space-y-4">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <HeroBanner
          eyebrow="Account"
          title="Settings"
          sideBySideFrom="md"
          logoSizeSm={64}
          logoSizeMd={88}
          logoSizeLg={104}
        />
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-base">Profile</h2>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
          </div>
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

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">Edit profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Age range</Label>
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="rounded-xl gradient-primary text-primary-foreground border-0"
              >
                {updateProfile.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
