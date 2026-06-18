import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FalconLogo from "@/components/FalconLogo";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FalconLogo showWordmark size={56} />
          </Link>
          <Link to="/auth" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">What data we collect</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your name, age range, income band, expenses, mood entries and lesson progress.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Why we collect it</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To personalise your experience and track your progress through the app.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Who can see it</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Only you. We never sell your data to anyone.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Under-16s</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you are under 16, a parent or guardian should review this policy with you.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Deleting your account and data</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Contact us at <a href="mailto:privacy@soarwithfalcon.com" className="text-primary underline">privacy@soarwithfalcon.com</a> and we'll delete your account and data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Cookies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use essential cookies only to keep you logged in. No tracking or advertising cookies.
          </p>
        </section>

        <div className="pt-6">
          <Link to="/terms" className="text-sm text-primary underline">Terms of Service</Link>
        </div>
      </main>
    </div>
  );
}
