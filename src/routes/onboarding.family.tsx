import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, X, Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  INTERESTS, SUPPORT_CATEGORIES, CARE_LEVELS, MOBILITY,
  type FamilyProfile,
} from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding/family")({
  head: () => ({ meta: [{ title: "Profil erstellen · Pflegenah" }] }),
  component: FamilyOnboarding,
});

const GENDERS = ["Frau", "Herr", "Divers", "keine Angabe"];
const LIVING = ["Wohnung", "Haus", "Betreutes Wohnen"];

function FamilyOnboarding() {
  const navigate = useNavigate();
  const { setFamilyProfile, setRole, role } = useStore();
  const [step, setStep] = useState(1);
  const total = 5;

  const [data, setData] = useState<Partial<FamilyProfile>>({
    gender: "Frau",
    interests: [],
    supportNeeds: [],
    careLevel: "Kein Pflegegrad",
    mobility: "vollständig mobil",
    genderPreference: "egal",
    livingSituation: "Wohnung",
    householdSize: 1,
    pets: false,
    maxPricePerHour: 25,
    city: "Essen",
    postalCode: "45127",
  });

  const patch = (p: Partial<FamilyProfile>) => setData((d) => ({ ...d, ...p }));

  const toggle = (key: "interests" | "supportNeeds", value: string) => {
    const arr = (data[key] as string[]) ?? [];
    patch({ [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] } as never);
  };

  const finish = () => {
    if (!role) setRole("family");
    const profile: FamilyProfile = {
      id: "family_self",
      firstName: data.firstName ?? "Angehörige:r",
      lastName: data.lastName ?? "",
      gender: data.gender ?? "keine Angabe",
      birthdate: data.birthdate ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      photo: data.photo,
      interests: data.interests ?? [],
      supportNeeds: data.supportNeeds ?? [],
      careLevel: data.careLevel ?? "Kein Pflegegrad",
      mobility: data.mobility ?? "vollständig mobil",
      genderPreference: data.genderPreference ?? "egal",
      diagnoses: data.diagnoses,
      livingSituation: data.livingSituation ?? "Wohnung",
      householdSize: data.householdSize ?? 1,
      pets: !!data.pets,
      equipment: data.equipment,
      maxPricePerHour: data.maxPricePerHour ?? 25,
      city: data.city ?? "Essen",
      postalCode: data.postalCode ?? "45127",
    };
    setFamilyProfile(profile);
    toast.success("Profil erstellt");
    navigate({ to: "/family/dashboard" });
  };

  const canNext = () => {
    if (step === 1) return !!data.firstName && !!data.lastName;
    if (step === 2) return (data.interests?.length ?? 0) > 0;
    if (step === 3) return (data.supportNeeds?.length ?? 0) > 0;
    if (step === 4) return true;
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col">
        {/* Sticky header */}
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : navigate({ to: "/" }))}
              className="rounded-full p-2 hover:bg-muted"
              aria-label="Zurück"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-extrabold">Profil erstellen</h1>
            <button
              onClick={() => navigate({ to: "/" })}
              className="rounded-full p-2 hover:bg-muted"
              aria-label="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Schritt {step} von {total}</p>
            <Progress value={(step / total) * 100} className="h-2" />
          </div>
        </header>

        <div className="flex-1 px-4 py-6 pb-32">
          {step === 1 && <Step1 data={data} patch={patch} />}
          {step === 2 && (
            <StepChoice
              title="Was macht der Person Freude?"
              subtitle="Wähle alle Interessen aus, die passen."
              options={INTERESTS}
              selected={data.interests ?? []}
              onToggle={(v) => toggle("interests", v)}
              tone="peach"
            />
          )}
          {step === 3 && <Step3 data={data} toggle={(v) => toggle("supportNeeds", v)} />}
          {step === 4 && <Step4 data={data} patch={patch} />}
          {step === 5 && <Step5 data={data} patch={patch} />}
        </div>

        {/* Sticky footer */}
        <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-[640px]">
            <Button
              size="lg"
              className="h-14 w-full rounded-full text-base font-bold"
              disabled={!canNext()}
              onClick={() => (step < total ? setStep(step + 1) : finish())}
            >
              {step < total ? "Weiter" : "Profil erstellen"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---- Steps ---- */

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-card p-5 shadow-card">{children}</div>;
}

function SectionTitle({ title, hint }: { title: string; hint?: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <h2 className="text-base font-bold">{title}</h2>
      {hint && <Info className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
}

function Step1({ data, patch }: { data: Partial<FamilyProfile>; patch: (p: Partial<FamilyProfile>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold">Wer benötigt Alltagshilfe?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Gib hier Informationen der Person an.</p>
      </div>
      <Card>
        <SectionTitle title="Persönliche Informationen" hint />
        <div className="mb-4 grid grid-cols-2 gap-2">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => patch({ gender: g })}
              className={cn(
                "h-12 rounded-xl border-2 text-sm font-semibold transition",
                data.gender === g
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <Input placeholder="Vorname" value={data.firstName ?? ""} onChange={(e) => patch({ firstName: e.target.value })} />
          <Input placeholder="Nachname" value={data.lastName ?? ""} onChange={(e) => patch({ lastName: e.target.value })} />
          <Input type="date" value={data.birthdate ?? ""} onChange={(e) => patch({ birthdate: e.target.value })} />
        </div>
      </Card>
      <Card>
        <SectionTitle title="Kontakt" hint />
        <div className="space-y-3">
          <Input type="email" placeholder="E-Mail" value={data.email ?? ""} onChange={(e) => patch({ email: e.target.value })} />
          <div className="flex gap-2">
            <div className="flex h-11 w-24 items-center justify-center gap-1 rounded-md border border-input bg-muted text-sm font-semibold">
              🇩🇪 +49
            </div>
            <Input type="tel" placeholder="Mobil" value={data.phone ?? ""} onChange={(e) => patch({ phone: e.target.value })} />
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-soft text-[color:var(--mint)]">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Foto hinzufügen</div>
            <div className="text-xs text-muted-foreground">Optional – hilft Helfer:innen beim Kennenlernen.</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepChoice({
  title, subtitle, options, selected, onToggle, tone = "peach",
}: {
  title: string; subtitle?: string; options: string[];
  selected: string[]; onToggle: (v: string) => void;
  tone?: "peach" | "mint" | "sky";
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                active
                  ? tone === "peach"
                    ? "border-primary bg-primary/20 text-foreground"
                    : tone === "mint"
                      ? "border-secondary bg-secondary/40 text-foreground"
                      : "border-accent bg-accent/40 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step3({
  data, toggle,
}: { data: Partial<FamilyProfile>; toggle: (v: string) => void }) {
  const selected = data.supportNeeds ?? [];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Benötigte Alltagshilfe</h2>
        <p className="mt-1 text-sm text-muted-foreground">Wähle so viele Bereiche wie relevant.</p>
      </div>
      {SUPPORT_CATEGORIES.map((cat) => (
        <div key={cat.title}>
          <h3 className="mb-2 text-sm font-bold text-foreground/80">{cat.title}</h3>
          <div className="flex flex-wrap gap-2">
            {cat.items.map((item) => {
              const active = selected.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(item)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-xs font-semibold transition",
                    active
                      ? "border-primary bg-primary/20 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Step4({ data, patch }: { data: Partial<FamilyProfile>; patch: (p: Partial<FamilyProfile>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold">Anforderungen & Situation</h2>
        <p className="mt-1 text-sm text-muted-foreground">Damit wir die passende Helfer:in finden.</p>
      </div>
      <Card>
        <Label className="mb-2 block text-sm font-bold">Pflegegrad</Label>
        <div className="grid grid-cols-2 gap-2">
          {CARE_LEVELS.map((l) => (
            <PillButton key={l} active={data.careLevel === l} onClick={() => patch({ careLevel: l })}>{l}</PillButton>
          ))}
        </div>
      </Card>
      <Card>
        <Label className="mb-2 block text-sm font-bold">Mobilität</Label>
        <div className="flex flex-wrap gap-2">
          {MOBILITY.map((m) => (
            <PillButton key={m} active={data.mobility === m} onClick={() => patch({ mobility: m })}>{m}</PillButton>
          ))}
        </div>
      </Card>
      <Card>
        <Label className="mb-2 block text-sm font-bold">Geschlechtspräferenz Helfer:in</Label>
        <div className="grid grid-cols-3 gap-2">
          {["egal", "Frau", "Herr"].map((g) => (
            <PillButton key={g} active={data.genderPreference === g} onClick={() => patch({ genderPreference: g })}>{g}</PillButton>
          ))}
        </div>
      </Card>
      <Card>
        <Label className="mb-2 block text-sm font-bold">Diagnosen / Einschränkungen (optional)</Label>
        <Textarea
          rows={3}
          placeholder="z. B. beginnende Demenz, Diabetes …"
          value={data.diagnoses ?? ""}
          onChange={(e) => patch({ diagnoses: e.target.value })}
        />
      </Card>
      <Card>
        <Label className="mb-2 block text-sm font-bold">Wohnsituation</Label>
        <div className="grid grid-cols-3 gap-2">
          {LIVING.map((l) => (
            <PillButton key={l} active={data.livingSituation === l} onClick={() => patch({ livingSituation: l })}>{l}</PillButton>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div>
            <Label className="mb-1 block text-xs font-semibold text-muted-foreground">Personen im Haushalt</Label>
            <Input type="number" min={1} value={data.householdSize ?? 1}
              onChange={(e) => patch({ householdSize: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-muted-foreground">Haustiere</Label>
            <div className="grid grid-cols-2 gap-2">
              <PillButton active={!!data.pets} onClick={() => patch({ pets: true })}>Ja</PillButton>
              <PillButton active={!data.pets} onClick={() => patch({ pets: false })}>Nein</PillButton>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Label className="mb-1 block text-xs font-semibold text-muted-foreground">Besonderheiten / Ausstattung</Label>
          <Textarea rows={2} placeholder="z. B. Treppenlift, Rollstuhlgerecht …"
            value={data.equipment ?? ""} onChange={(e) => patch({ equipment: e.target.value })} />
        </div>
      </Card>
    </div>
  );
}

function Step5({ data, patch }: { data: Partial<FamilyProfile>; patch: (p: Partial<FamilyProfile>) => void }) {
  const value = data.maxPricePerHour ?? 25;
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold">Budget & Zusammenfassung</h2>
        <p className="mt-1 text-sm text-muted-foreground">Was möchten Sie maximal pro Stunde zahlen?</p>
      </div>
      <Card>
        <Label className="mb-2 block text-sm font-bold">Maximaler Stundensatz</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number" min={10} max={60}
            value={value}
            onChange={(e) => patch({ maxPricePerHour: Number(e.target.value) })}
            className="w-32 text-lg font-bold"
          />
          <span className="text-sm text-muted-foreground">€ / Std.</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Empfohlener Bereich: 15–35 €/Std., je nach Unterstützung.</p>
      </Card>
      <Card>
        <SectionTitle title="Zusammenfassung" />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Name</dt><dd className="font-semibold">{data.firstName} {data.lastName}</dd>
          <dt className="text-muted-foreground">Pflegegrad</dt><dd className="font-semibold">{data.careLevel}</dd>
          <dt className="text-muted-foreground">Mobilität</dt><dd className="font-semibold">{data.mobility}</dd>
          <dt className="text-muted-foreground">Wohnsituation</dt><dd className="font-semibold">{data.livingSituation}</dd>
          <dt className="text-muted-foreground">Interessen</dt><dd className="font-semibold">{(data.interests ?? []).slice(0,3).join(", ") || "—"}</dd>
          <dt className="text-muted-foreground">Bedarfe</dt><dd className="font-semibold">{(data.supportNeeds ?? []).length} ausgewählt</dd>
        </dl>
      </Card>
    </div>
  );
}

function PillButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick}
      className={cn(
        "h-10 rounded-xl border-2 px-3 text-sm font-semibold transition",
        active ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
