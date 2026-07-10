import { createFileRoute } from "@tanstack/react-router";
import { Heart, ShieldCheck, HandHeart, Users } from "lucide-react";
import { ScreenHeader } from "@/components/AppLayout";

export const Route = createFileRoute("/ueber-uns")({
  head: () => ({
    meta: [
      { title: "Über uns – Pflegenah" },
      { name: "description", content: "Pflegenah verbindet Familien mit warmherzigen Helfer:innen für Alltagshilfe und Begleitung." },
      { property: "og:title", content: "Über Pflegenah" },
      { property: "og:description", content: "Unsere Mission: Nähe finden leicht gemacht." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-[720px]">
        <ScreenHeader title="Über uns" subtitle="Nähe finden leicht gemacht" back="/" />

        <div className="mb-6 overflow-hidden rounded-3xl gradient-hero p-8 shadow-soft">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/60">
            <Heart className="h-7 w-7 text-foreground" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-extrabold">Warmherzige Alltagshilfe in Ihrer Nähe</h2>
          <p className="mt-2 text-sm text-foreground/80">
            Pflegenah verbindet Familien und Senior:innen mit geprüften Helfer:innen für Begleitung,
            Haushalt und Gesellschaft – lokal, sicher und persönlich.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Feature icon={Users} title="Für Familien" text="Finden Sie schnell Unterstützung für Ihre Angehörigen – ohne lange Wartezeiten." />
          <Feature icon={HandHeart} title="Für Helfer:innen" text="Gestalten Sie Ihre Arbeitszeiten flexibel und helfen Sie in Ihrer Nachbarschaft." />
          <Feature icon={ShieldCheck} title="Geprüft & sicher" text="Alle Helfer:innen durchlaufen eine Identitäts- und Referenzprüfung." />
          <Feature icon={Heart} title="Menschlich" text="Wir glauben an Nähe, Vertrauen und ehrliche Begegnungen." />
        </div>

        <div className="mt-8 rounded-2xl bg-card p-6 shadow-card text-sm leading-relaxed">
          <h3 className="mb-2 text-lg font-bold">Unsere Mission</h3>
          <p>
            Immer mehr Menschen wünschen sich Unterstützung im Alltag – jenseits klassischer Pflege.
            Pflegenah macht es einfach, verlässliche Hilfe in der Nachbarschaft zu finden, damit
            Angehörige entlastet werden und Senior:innen möglichst lange selbstbestimmt leben können.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof Heart; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-peach-soft text-[color:var(--peach)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-bold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
