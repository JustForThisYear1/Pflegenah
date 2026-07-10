import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, HandHeart, ShieldCheck, Smartphone, PartyPopper, Wallet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { HELPER_QUALIFICATIONS, HELPER_INTERESTS, LANGUAGES, type Helper } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding/helper")({
  head: () => ({ meta: [{ title: "Helfer:in werden · Pflegenah" }] }),
  component: HelperOnboarding,
});

const SLIDES = [
  { icon: HandHeart, title: "Willkommen bei Pflegenah",
    text: "Verdiene Geld, indem du Menschen im Alltag hilfst — flexibel, lokal, sinnvoll." },
  { icon: Smartphone, title: "So funktioniert's",
    text: "1. Auftrag annehmen · 2. Hilfe leisten · 3. Geld automatisch erhalten." },
  { icon: HandHeart, title: "Was du brauchst",
    text: "Ein Smartphone und ein Herz für Menschen. Dein Gewerbeschein kann später nachgereicht werden." },
  { icon: ShieldCheck, title: "Sicherheit & Vertrauen",
    text: "Alle Zahlungen laufen sicher über Pflegenah. Du siehst dein Guthaben sofort, Auszahlung nach Verifizierung." },
  { icon: PartyPopper, title: "Los geht's",
    text: "Erstelle dein Profil in wenigen Minuten und finde deinen ersten Auftrag." },
];

function HelperOnboarding() {
  const navigate = useNavigate();
  const { setRole, setHelperSelf } = useStore();
  const [phase, setPhase] = useState<"slides" | "form">("slides");
  const [slide, setSlide] = useState(0);
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const [data, setData] = useState<Partial<Helper>>({
    qualifications: [], interests: [], languages: ["Deutsch"],
    pricePerHour: 22, gender: "Frau", homeCountry: "Deutschland",
    experienceYears: 0, hasDriverLicense: false, hasCar: false,
    smoking: "nein", petsAtHome: false, city: "Essen", postalCode: "45127",
    workingDays: ["Mo", "Di", "Mi", "Do", "Fr"], workingHours: "09:00 – 17:00",
    verified: false, verificationStatus: "pending", rating: 5,
    distanceKm: 3, badges: ["Neu"],
  });
  const patch = (p: Partial<Helper>) => setData((d) => ({ ...d, ...p }));
  const toggleArr = (key: "qualifications" | "interests" | "languages", v: string) => {
    const arr = (data[key] as string[]) ?? [];
    patch({ [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] } as never);
  };

  const finish = () => {
    setRole("helper");
    setHelperSelf(data);
    toast.success("Helfer-Profil erstellt!");
    navigate({ to: "/helper/dashboard" });
  };

  if (phase === "slides") {
    const s = SLIDES[slide];
    const Icon = s.icon;
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-6 py-6">
          <div className="flex items-center justify-end">
            <button onClick={() => setPhase("form")} className="text-sm font-semibold text-muted-foreground hover:text-foreground">Überspringen</button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-mint text-foreground shadow-soft">
              <Icon className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-black">{s.title}</h1>
            <p className="mt-4 max-w-sm text-base text-muted-foreground">{s.text}</p>
          </div>
          <div className="mb-4 flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all",
                i === slide ? "w-8 bg-secondary" : "w-2 bg-border")} />
            ))}
          </div>
          <Button
            size="lg" className="h-14 w-full rounded-full bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80"
            onClick={() => (slide < SLIDES.length - 1 ? setSlide(slide + 1) : setPhase("form"))}
          >
            Weiter <ArrowRight className="ml-1 h-5 w-5" />
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Durch Fortfahren akzeptierst du unsere <a className="underline">AGB</a> und <a className="underline">Datenschutzbestimmungen</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <button onClick={() => (step > 1 ? setStep(step - 1) : setPhase("slides"))}
              className="rounded-full p-2 hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
            <h1 className="text-lg font-extrabold">Helfer-Profil erstellen</h1>
          </div>
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Schritt {step} von {totalSteps}</p>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>
        </header>

        <div className="flex-1 space-y-5 px-4 py-6 pb-32">
          {step === 1 && (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-extrabold">Über dich</h2>
                <p className="text-sm text-muted-foreground">Erzähle uns etwas über dich</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-mint text-foreground">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="mt-2 text-xs font-semibold">Foto hinzufügen</div>
              </div>
              <Field label="Vollständiger Name *">
                <Input placeholder="z. B. Anna Schmidt" value={data.name ?? ""} onChange={(e) => patch({ name: e.target.value })} />
              </Field>
              <Field label="Alter *">
                <Input type="number" min={18} placeholder="z. B. 32" value={data.age ?? ""} onChange={(e) => patch({ age: Number(e.target.value) })} />
              </Field>
              <Field label="Über mich">
                <Textarea rows={4} placeholder="Erzähle etwas über deine Erfahrung und Motivation..." value={data.bio ?? ""} onChange={(e) => patch({ bio: e.target.value })} />
              </Field>
              <Field label="Motivation">
                <Textarea rows={3} placeholder="Was motiviert dich, Menschen im Alltag zu helfen?" value={data.motivation ?? ""} onChange={(e) => patch({ motivation: e.target.value })} />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-extrabold">Qualifikationen & Interessen</h2>
              <ChipGroup title="Qualifikationen" options={HELPER_QUALIFICATIONS} selected={data.qualifications ?? []} onToggle={(v) => toggleArr("qualifications", v)} />
              <ChipGroup title="Interessen & Hobbies" options={HELPER_INTERESTS} selected={data.interests ?? []} onToggle={(v) => toggleArr("interests", v)} tone="mint" />
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-extrabold">Sprachen & Stundensatz</h2>
              <ChipGroup title="Sprachen" options={LANGUAGES} selected={data.languages ?? []} onToggle={(v) => toggleArr("languages", v)} tone="sky" />
              <div className="rounded-2xl bg-card p-5 shadow-card">
                <Label className="mb-2 block text-sm font-bold">Stundensatz</Label>
                <div className="flex items-center gap-3">
                  <Input type="number" min={12} max={60} value={data.pricePerHour ?? 22}
                    onChange={(e) => patch({ pricePerHour: Number(e.target.value) })} className="w-32 text-lg font-bold" />
                  <span className="text-sm text-muted-foreground">€ / Std.</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Empfehlung: 15–35 €/Std.</p>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-2xl font-extrabold">Weitere Informationen</h2>
              <Field label="Heimatland (optional)">
                <Input value={data.homeCountry ?? ""} onChange={(e) => patch({ homeCountry: e.target.value })} />
              </Field>
              <Field label="Betreuungserfahrung in Jahren">
                <Input type="number" min={0} value={data.experienceYears ?? 0} onChange={(e) => patch({ experienceYears: Number(e.target.value) })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Toggle label="Führerschein" value={!!data.hasDriverLicense} onChange={(v) => patch({ hasDriverLicense: v })} />
                <Toggle label="Eigenes Auto" value={!!data.hasCar} onChange={(v) => patch({ hasCar: v })} />
                <Toggle label="Haustiere zu Hause" value={!!data.petsAtHome} onChange={(v) => patch({ petsAtHome: v })} />
                <Toggle label="Raucher:in" value={data.smoking === "ja"} onChange={(v) => patch({ smoking: v ? "ja" : "nein" })} />
              </div>
              <Field label="Besonderheiten"><Textarea rows={2} value={data.additionalInfo ?? ""} onChange={(e) => patch({ additionalInfo: e.target.value })} /></Field>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-2xl font-extrabold">Kontaktdaten</h2>
              <Field label="E-Mail"><Input type="email" /></Field>
              <Field label="Telefon"><Input type="tel" /></Field>
              <Field label="Stadt"><Input value={data.city ?? ""} onChange={(e) => patch({ city: e.target.value })} /></Field>
              <Field label="PLZ"><Input value={data.postalCode ?? ""} onChange={(e) => patch({ postalCode: e.target.value })} /></Field>
            </>
          )}

          {step === 6 && (
            <>
              <h2 className="text-2xl font-extrabold">Bankverbindung</h2>
              <Field label="Kontoinhaber"><Input /></Field>
              <Field label="IBAN"><Input placeholder="DE00 0000 0000 0000 0000 00" /></Field>
              <div className="rounded-2xl bg-peach-soft p-4 text-sm">
                <Wallet className="mb-1 h-5 w-5 text-[color:var(--peach)]" />
                Auszahlung erst nach Verifizierung deines Profils und Vorlage des Gewerbescheins möglich.
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <h2 className="text-2xl font-extrabold">Gewerbeschein (optional)</h2>
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <div className="text-sm font-semibold">Gewerbeschein hochladen</div>
                <p className="mt-1 text-xs text-muted-foreground">Du kannst deinen Gewerbeschein später hochladen, bevor du deine erste Auszahlung erhältst.</p>
              </div>
              <div className="rounded-2xl bg-mint-soft p-4">
                <div className="mb-1 text-xs font-bold text-muted-foreground">Profil-Fortschritt</div>
                <Progress value={70} className="h-2" />
                <div className="mt-2 text-xs text-muted-foreground">Profil zu 70 % vollständig — Abschluss möglich, Verifizierung folgt.</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/40 px-3 py-1 text-xs font-bold">
                Selbstständig gestartet 🚀
              </div>
            </>
          )}
        </div>

        <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-[640px]">
            <Button
              size="lg"
              className="h-14 w-full rounded-full bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80"
              disabled={step === 1 && (!data.name || !data.age)}
              onClick={() => (step < totalSteps ? setStep(step + 1) : finish())}
            >
              {step < totalSteps ? "Weiter" : "Profil abschließen"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block text-sm font-bold">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className="mb-2 text-xs font-bold">{label}</div>
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={() => onChange(true)}
          className={cn("h-9 rounded-lg border-2 text-xs font-semibold",
            value ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground")}>Ja</button>
        <button onClick={() => onChange(false)}
          className={cn("h-9 rounded-lg border-2 text-xs font-semibold",
            !value ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground")}>Nein</button>
      </div>
    </div>
  );
}

function ChipGroup({
  title, options, selected, onToggle, tone = "peach",
}: {
  title: string; options: string[]; selected: string[];
  onToggle: (v: string) => void; tone?: "peach" | "mint" | "sky";
}) {
  const activeCls =
    tone === "peach" ? "border-primary bg-primary/20"
    : tone === "mint" ? "border-secondary bg-secondary/40"
    : "border-accent bg-accent/40";
  return (
    <div>
      <div className="mb-2 text-sm font-bold">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button key={o} onClick={() => onToggle(o)}
              className={cn("rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold transition",
                active ? activeCls : "border-border bg-card text-muted-foreground hover:bg-muted")}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
