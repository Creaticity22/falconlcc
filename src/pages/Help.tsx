import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Phone } from "lucide-react";
import FalconLogo from "@/components/FalconLogo";

const SECTIONS = [
  {
    title: "Money stress",
    items: [
      { name: "MoneyHelper", desc: "Free, impartial money guidance backed by the UK government", url: "https://www.moneyhelper.org.uk/" },
      { name: "StepChange", desc: "Free debt advice", url: "https://www.stepchange.org/" },
      { name: "Citizens Advice", desc: "Free advice on money, debt and benefits", url: "https://www.citizensadvice.org.uk/" },
    ],
  },
  {
    title: "Mental health & wellbeing",
    items: [
      { name: "Young Minds", desc: "Mental health support for young people", url: "https://www.youngminds.org.uk/" },
      { name: "Mind", desc: "Mental health charity", url: "https://www.mind.org.uk/" },
      { name: "Samaritans", desc: "Call 116 123 — free, 24/7", url: "tel:116123" },
    ],
  },
];

export default function Help() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FalconLogo showWordmark size={56} />
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Need support?</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You're not alone. Here are some trusted UK organisations that can help — all free and confidential.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-display text-xl font-semibold">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item) => {
                const isTel = item.url.startsWith("tel:");
                return (
                  <a
                    key={item.name}
                    href={item.url}
                    target={isTel ? undefined : "_blank"}
                    rel={isTel ? undefined : "noopener noreferrer"}
                    className="block bg-card rounded-xl p-4 border border-border/50 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">In an emergency</h2>
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
            <Phone className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm">
              If you are in immediate danger, call <a href="tel:999" className="font-bold underline">999</a>.
            </p>
          </div>
        </section>

        <p className="text-[11px] text-muted-foreground leading-relaxed pt-4 border-t border-border/40">
          Falcon is not a crisis service. If you are in immediate danger please call 999.
        </p>
      </main>
    </div>
  );
}
