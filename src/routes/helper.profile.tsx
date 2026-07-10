import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { HandHeart, LogOut, ShieldCheck, ShieldAlert, Pencil, X, Save } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { LANGUAGES, HELPER_QUALIFICATIONS, type Helper } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/helper/profile")({
  head: () => ({ meta: [{ title: "Mein Profil · Pflegenah" }] }),
  component: HelperProfilePage,
});

function HelperProfilePage() {
  const { helperSelf, setHelperSelf, reset } = useStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const startVerification = () => {
    setHelperSelf({ ...(helperSelf ?? {}), verificationStatus: "pending" });
    toast.success("Verifizierung gestartet – wir melden uns per E-Mail für Ausweis & Referenzen.");
    setTimeout(() => {
      setHelperSelf({ ...(helperSelf ?? {}), verified: true, verificationStatus: "verified" });
      toast.success("Du bist jetzt verifiziert (Demo).");
    }, 2500);
  };

  return (
    <AppLayout variant="helper">
      <ScreenHeader title="Einstellungen" subtitle="Profil & Konto" back="/helper/dashboard" />

      <div className="mb-6 -mx-4 gradient-cool p-8 pb-14 pt-10 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/40">
          <HandHeart className="h-9 w-9 text-white" />
        </div>
        <h2 className="text-2xl font-black">{helperSelf?.name ?? "Dein Profil"}</h2>
        <p className="text-sm text-foreground/70">{helperSelf?.city ?? "—"}</p>
      </div>

      {helperSelf ? (
        <div className="space-y-4">
          <VerificationCard
            status={helperSelf.verificationStatus ?? "pending"}
            verified={!!helperSelf.verified}
            onStart={startVerification}
          />

          {editing ? (
            <EditForm
              current={helperSelf}
              onCancel={() => setEditing(false)}
              onSave={(patch) => {
                setHelperSelf({ ...helperSelf, ...patch });
                setEditing(false);
                toast.success("Profil aktualisiert.");
              }}
            />
          ) : (
            <>
              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold">Profildaten</h3>
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Bearbeiten
                  </button>
                </div>
                <Row label="Name" value={helperSelf.name ?? "—"} />
                <Row label="Alter" value={String(helperSelf.age ?? "—")} />
                <Row label="Stadt" value={helperSelf.city ?? "—"} />
                <Row label="Stundensatz" value={`${helperSelf.pricePerHour ?? 0} €/Std.`} />
                <Row label="Sprachen" value={(helperSelf.languages ?? []).join(", ") || "—"} />
                <Row label="Erfahrung" value={`${helperSelf.experienceYears ?? 0} Jahre`} />
                <Row label="Verifiziert" value={helperSelf.verified ? "Ja" : "Ausstehend"} />
              </div>

              <div className="rounded-2xl bg-card p-5 shadow-card">
                <h3 className="mb-3 text-sm font-bold">Über mich</h3>
                <p className="text-sm text-muted-foreground">{helperSelf.bio || "Noch keine Beschreibung."}</p>
              </div>
            </>
          )}

          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={() => navigate({ to: "/helper/availability" })}
          >
            Verfügbarkeit verwalten
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full text-destructive"
            onClick={() => { reset(); navigate({ to: "/" }); }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Abmelden & zurücksetzen
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl bg-card p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Noch kein Profil angelegt.</p>
          <Button className="mt-3 rounded-full" onClick={() => navigate({ to: "/onboarding/helper" })}>
            Profil erstellen
          </Button>
        </div>
      )}
    </AppLayout>
  );
}

function EditForm({
  current,
  onCancel,
  onSave,
}: {
  current: Partial<Helper>;
  onCancel: () => void;
  onSave: (patch: Partial<Helper>) => void;
}) {
  const [name, setName] = useState(current.name ?? "");
  const [age, setAge] = useState<number>(current.age ?? 0);
  const [city, setCity] = useState(current.city ?? "");
  const [pricePerHour, setPrice] = useState<number>(current.pricePerHour ?? 0);
  const [experienceYears, setExperience] = useState<number>(current.experienceYears ?? 0);
  const [bio, setBio] = useState(current.bio ?? "");
  const [languages, setLanguages] = useState<string[]>(current.languages ?? []);
  const [qualifications, setQualifications] = useState<string[]>(current.qualifications ?? []);

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold">Profil bearbeiten</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Alter">
            <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
          </Field>
          <Field label="Stadt">
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stundensatz (€/Std.)">
            <Input type="number" value={pricePerHour} onChange={(e) => setPrice(Number(e.target.value))} />
          </Field>
          <Field label="Erfahrung (Jahre)">
            <Input type="number" value={experienceYears} onChange={(e) => setExperience(Number(e.target.value))} />
          </Field>
        </div>

        <Field label="Sprachen">
          <ChipGroup options={LANGUAGES} selected={languages} onToggle={(v) => setLanguages(toggle(languages, v))} />
        </Field>

        <Field label="Qualifikationen">
          <ChipGroup options={HELPER_QUALIFICATIONS} selected={qualifications} onToggle={(v) => setQualifications(toggle(qualifications, v))} />
        </Field>

        <Field label="Über mich">
          <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
        </Field>
      </div>

      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1 rounded-full" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button
          className="flex-1 rounded-full"
          onClick={() => onSave({ name, age, city, pricePerHour, experienceYears, bio, languages, qualifications })}
        >
          <Save className="mr-2 h-4 w-4" /> Speichern
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ChipGroup({
  options, selected, onToggle,
}: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              "rounded-full border-2 px-3 py-1 text-xs font-semibold transition",
              active
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function VerificationCard({
  status, verified, onStart,
}: { status: "pending" | "verified" | "rejected"; verified: boolean; onStart: () => void }) {
  if (verified || status === "verified") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-mint-soft p-4 shadow-card">
        <ShieldCheck className="h-6 w-6 text-[color:var(--mint)]" />
        <div className="flex-1">
          <div className="text-sm font-bold">Verifiziert</div>
          <div className="text-xs text-muted-foreground">Dein Profil trägt das Vertrauensabzeichen.</div>
        </div>
      </div>
    );
  }
  const pending = status === "pending";
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-[color:var(--warning)]" />
        <h3 className="text-sm font-bold">Verifizierung {pending ? "läuft" : "erforderlich"}</h3>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Zeige Familien, dass du geprüft bist. Wir prüfen Ausweis, polizeiliches Führungszeugnis und
        Referenzen. Verifizierte Helfer:innen bekommen deutlich mehr Anfragen.
      </p>
      <Button className="w-full rounded-full" onClick={onStart} disabled={pending}>
        <ShieldCheck className="mr-2 h-4 w-4" />
        {pending ? "Prüfung läuft…" : "Verifizierung starten"}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
