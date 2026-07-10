import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Star, MapPin, Euro, MessageCircle, CalendarPlus, Download, Car, Cigarette, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/helper/$id/cv")({
  head: () => ({ meta: [{ title: "Pflegenah CV · Pflegenah" }] }),
  component: HelperCV,
});

function HelperCV() {
  const { id } = Route.useParams();
  const { helpers, ensureMatch } = useStore();
  const navigate = useNavigate();
  const h = helpers.find((x) => x.id === id);
  if (!h) return <div className="p-6">Profil nicht gefunden.</div>;

  const startChat = () => {
    const m = ensureMatch(h.id);
    navigate({ to: "/family/messages/$id", params: { id: m.helperId } });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[860px] items-center gap-2 px-4 py-3">
          <button onClick={() => navigate({ to: "/family/discover" })} className="rounded-full p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-extrabold">Pflegenah CV</h1>
        </div>
      </header>

      <div className="mx-auto max-w-[860px] px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left column */}
          <aside className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-card shadow-card">
              <div className="gradient-hero p-6 pb-10 text-center">
                <img src={h.photo} alt="" className="mx-auto h-28 w-28 rounded-full border-4 border-white object-cover shadow-soft" />
                <h2 className="mt-3 text-xl font-black">{h.name}</h2>
                <p className="text-sm text-foreground/70">{h.age} Jahre · {h.gender}</p>
                {h.verified && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-[color:var(--mint)]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verifiziert
                  </span>
                )}
              </div>
              <div className="p-4 text-sm">
                <FactRow icon={MapPin} label={`${h.distanceKm} km · ${h.city}`} />
                <FactRow icon={Euro} label={`${h.pricePerHour} €/Std.`} />
                <FactRow icon={Star} label={`${h.rating} Bewertung`} />
                {h.homeCountry && <FactRow icon={Globe} label={`Heimatland: ${h.homeCountry}`} />}
                <FactRow icon={Car} label={`Führerschein: ${h.hasDriverLicense ? "ja" : "nein"} · Auto: ${h.hasCar ? "ja" : "nein"}`} />
                <FactRow icon={Cigarette} label={`Rauchen: ${h.smoking}`} />
              </div>
            </div>

            <div className="rounded-2xl bg-card p-4 shadow-card">
              <h3 className="mb-2 text-sm font-bold">Sprachen</h3>
              <div className="flex flex-wrap gap-1.5">
                {h.languages.map((l) => (
                  <span key={l} className="rounded-full bg-sky-soft px-2.5 py-1 text-xs font-semibold">{l}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-card p-4 shadow-card">
              <h3 className="mb-2 text-sm font-bold">Erfahrung</h3>
              <p className="text-sm text-muted-foreground">{h.experienceYears} Jahre in Alltagsbegleitung.</p>
            </div>
          </aside>

          {/* Right column */}
          <div className="space-y-4">
            <Section title="Über mich"><p className="text-sm">{h.bio}</p></Section>
            <Section title="Motivation"><p className="text-sm">{h.motivation}</p></Section>

            <Section title="Alltagshilfe-Angebot">
              <div className="flex flex-wrap gap-1.5">
                {h.offers.map((o) => (
                  <span key={o} className="rounded-full bg-peach-soft px-2.5 py-1 text-xs font-semibold">{o}</span>
                ))}
              </div>
            </Section>

            <Section title="Hobbies & Interessen">
              <div className="flex flex-wrap gap-1.5">
                {h.interests.map((i) => (
                  <span key={i} className="rounded-full bg-mint-soft px-2.5 py-1 text-xs font-semibold">{i}</span>
                ))}
              </div>
            </Section>

            <Section title="Qualifikationen">
              <ul className="space-y-1 text-sm">
                {h.qualifications.map((q) => <li key={q}>✓ {q}</li>)}
              </ul>
            </Section>

            <Section title="Verfügbarkeit">
              <div className="text-sm">
                <div><b>Arbeitstage:</b> {h.workingDays.join(", ")}</div>
                <div><b>Arbeitszeiten:</b> {h.workingHours}</div>
              </div>
            </Section>

            <Section title="Auszeichnungen">
              <div className="flex flex-wrap gap-1.5">
                {h.badges.map((b) => (
                  <span key={b} className="rounded-full bg-secondary/40 px-2.5 py-1 text-xs font-bold">{b}</span>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[860px] items-center gap-2">
          <Button variant="outline" className="flex-1 rounded-full font-bold" onClick={() => toast.info("PDF-Export folgt")}>
            <Download className="mr-1 h-4 w-4" /> Als PDF
          </Button>
          <Button variant="outline" className="flex-1 rounded-full font-bold" onClick={startChat}>
            <MessageCircle className="mr-1 h-4 w-4" /> Chat starten
          </Button>
          <Button className="flex-1 rounded-full font-bold" onClick={() => navigate({ to: "/family/booking" })}>
            <CalendarPlus className="mr-1 h-4 w-4" /> Termin buchen
          </Button>
        </div>
      </footer>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      {children}
    </div>
  );
}

function FactRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border py-2 text-sm last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span>{label}</span>
    </div>
  );
}
