import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FalconLogo from "@/components/FalconLogo";

export default function Terms() {
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
          <h1 className="font-display text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        </div>

        <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
          <li>Falcon is an educational tool, not a regulated financial adviser.</li>
          <li>You must be 14 or older to use Falcon.</li>
          <li>If you are under 16, a parent or guardian should be aware you are using this app.</li>
          <li>We are not responsible for any financial decisions you make based on content in the app.</li>
          <li>Content is UK-focused and educational only.</li>
          <li>We may update these terms from time to time and will notify users by email.</li>
          <li>These terms are governed by the laws of England and Wales.</li>
        </ul>

        <div className="pt-6">
          <Link to="/privacy" className="text-sm text-primary underline">Privacy Policy</Link>
        </div>
      </main>
    </div>
  );
}
