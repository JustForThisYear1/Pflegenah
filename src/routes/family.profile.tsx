import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Settings, Bell, LogOut, Pencil, X, Save, ShieldCheck } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { CARE_LEVELS, MOBILITY, SUPPORT_CATEGORIES, HELPER_INTERESTS, type FamilyProfile } from "@/lib/mock-data";
import { CARE_INSURERS } from "@/lib/invoice-utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LIVING = ["Wohnung", "Haus", "Betreutes Wohnen", "Pflegeheim", "Mehrgenerationenhaus"];

export const Route = createFileRoute("/family/profile")({
  head: () => ({ meta: [{ title: "Profil · Pflegenah" }] }),
  component: FamilyProfilePage,
});

function FamilyProfilePage() {
  const { familyProfile, updateFamilyProfile, reset, careInsurance, updateCareInsurance } = useStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  return (
    <AppLayout variant="family">
      <ScreenHeader title="Einstellungen" subtitle="Profil & Konto" back="/family/dashboard" />

      <div className="mb-6 -mx-4 gradient-hero p-8 pb-14 pt-10 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/40 backdrop-blur">
          <Heart className="h-9 w-9 text-white" fill="white" />
        </div>
        <h2 className="text-2xl font-black">{familyProfile ? `${familyProfile.firstName} ${familyProfile.lastName}` : "Ihr Profil"}</h2>
        {familyProfile?.birthdate && (
          <p className="text-sm text-foreground/70">geboren {new Date(familyProfile.birthdate).toLocaleDateString("de-DE")}</p>
        )}
      </div>

      {familyProfile ? (
        <>
          {editing ? (
            <EditForm
              current={familyProfile}
              onCancel={() => setEditing(false)}
              onSave={(patch) => {
                updateFamilyProfile(patch);
                setEditing(false);
                toast.success("Profil aktualisiert.");
              }}
            />
          ) : (
            <div className="mb-4 rounded-2xl bg-card p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">Profil-Informationen</h3>
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Pencil className="h-3.5 w-3.5" /> Bearbeiten
                </button>
              </div>
              <Row label="Pflegegrad" value={familyProfile.careLevel} />
              <Row label="Mobilität" value={familyProfile.mobility} />
              <Row label="Wohnsituation" value={familyProfile.livingSituation} />
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">Interessen</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {familyProfile.interests.map((i) => (
                    <span key={i} className="rounded-full bg-peach-soft px-2 py-0.5 text-[11px] font-semibold text-foreground/80">{i}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">Alltagshilfe-Bedarf</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {familyProfile.supportNeeds.map((n) => (
                    <span key={n} className="rounded-full bg-mint-soft px-2 py-0.5 text-[11px] font-semibold text-foreground/80">{n}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!editing && (
            <>
              <CareInsuranceCard
                value={careInsurance}
                onChange={updateCareInsurance}
              />
              <div className="space-y-2">
                <MenuItem icon={Settings} label="Einstellungen" />
                <MenuItem icon={Bell} label="Benachrichtigungen" />
              </div>
            </>
          )}

          <Button
            variant="outline" className="mt-6 w-full rounded-full text-destructive"
            onClick={() => { reset(); navigate({ to: "/" }); }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Abmelden & zurücksetzen
          </Button>
        </>
      ) : (
        <div className="rounded-2xl bg-card p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Noch kein Profil angelegt.</p>
          <Button className="mt-3 rounded-full" onClick={() => navigate({ to: "/onboarding/family" })}>Profil erstellen</Button>
        </div>
      )}
    </AppLayout>
  );
}

function EditForm({
  current, onCancel, onSave,
}: {
  current: FamilyProfile;
  onCancel: () => void;
  onSave: (patch: Partial<FamilyProfile>) => void;
}) {
  const [firstName, setFirstName] = useState(current.firstName);
  const [lastName, setLastName] = useState(current.lastName);
  const [birthdate, setBirthdate] = useState(current.birthdate);
  const [careLevel, setCareLevel] = useState(current.careLevel);
  const [mobility, setMobility] = useState(current.mobility);
  const [livingSituation, setLiving] = useState(current.livingSituation);
  const [maxPricePerHour, setPrice] = useState<number>(current.maxPricePerHour ?? 0);
  const [interests, setInterests] = useState<string[]>(current.interests);
  const [supportNeeds, setSupportNeeds] = useState<string[]>(current.supportNeeds);

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const allNeeds = SUPPORT_CATEGORIES.flatMap((c) => c.items);

  return (
    <div className="mb-4 rounded-2xl bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold">Profil bearbeiten</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vorname">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Field>
          <Field label="Nachname">
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Field>
        </div>
        <Field label="Geburtsdatum">
          <Input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
        </Field>

        <Field label="Pflegegrad">
          <Select options={CARE_LEVELS} value={careLevel} onChange={setCareLevel} />
        </Field>
        <Field label="Mobilität">
          <Select options={MOBILITY} value={mobility} onChange={setMobility} />
        </Field>
        <Field label="Wohnsituation">
          <Select options={LIVING} value={livingSituation} onChange={setLiving} />
        </Field>
        <Field label="Max. Stundensatz (€)">
          <Input type="number" value={maxPricePerHour} onChange={(e) => setPrice(Number(e.target.value))} />
        </Field>

        <Field label="Interessen">
          <ChipGroup options={HELPER_INTERESTS} selected={interests} onToggle={(v) => setInterests(toggle(interests, v))} />
        </Field>

        <Field label="Alltagshilfe-Bedarf">
          <ChipGroup options={allNeeds} selected={supportNeeds} onToggle={(v) => setSupportNeeds(toggle(supportNeeds, v))} />
        </Field>
      </div>

      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1 rounded-full" onClick={onCancel}>Abbrechen</Button>
        <Button
          className="flex-1 rounded-full"
          onClick={() => onSave({
            firstName, lastName, birthdate, careLevel, mobility, livingSituation,
            maxPricePerHour, interests, supportNeeds,
          })}
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

function Select({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
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

import type { LucideIcon } from "lucide-react";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function MenuItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-card hover:-translate-y-0.5 transition">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-peach-soft text-[color:var(--peach)]">
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1 text-sm font-semibold">{label}</span>
    </button>
  );
}

function CareInsuranceCard({
  value, onChange,
}: {
  value: ReturnType<typeof useStore>["careInsurance"];
  onChange: ReturnType<typeof useStore>["updateCareInsurance"];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 rounded-2xl bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <ShieldCheck className="h-4 w-4 text-[color:var(--mint)]" /> Pflegekasse & Erstattung
        </h3>
        <button onClick={() => setOpen((v) => !v)} className="text-xs font-semibold text-primary hover:underline">
          {open ? "Fertig" : "Bearbeiten"}
        </button>
      </div>

      {open ? (
        <div className="space-y-3">
          <Field label="Pflegekasse">
            <select
              value={value.insurerName}
              onChange={(e) => onChange({ insurerName: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {CARE_INSURERS.map((i) => <option key={i.name} value={i.name}>{i.name}</option>)}
            </select>
          </Field>
          <Field label="Versicherungsnummer">
            <Input value={value.insuranceNumber} onChange={(e) => onChange({ insuranceNumber: e.target.value })} placeholder="A123456789" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pflegegrad">
              <Select options={["Pflegegrad 1", "Pflegegrad 2", "Pflegegrad 3", "Pflegegrad 4", "Pflegegrad 5"]}
                value={value.careLevel} onChange={(v) => onChange({ careLevel: v })} />
            </Field>
            <Field label="Monatliches Budget (€)">
              <Input type="number" value={value.monthlyBudget} onChange={(e) => onChange({ monthlyBudget: Number(e.target.value) })} />
            </Field>
          </div>
          <label className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm">
            <span>Am Monatsende automatisch senden</span>
            <Switch checked={value.autoSend} onCheckedChange={(v) => onChange({ autoSend: v })} />
          </label>
        </div>
      ) : (
        <>
          <Row label="Pflegekasse" value={value.insurerName} />
          <Row label="Versicherungsnr." value={value.insuranceNumber || "—"} />
          <Row label="Pflegegrad" value={value.careLevel} />
          <Row label="Monatliches Budget" value={`${value.monthlyBudget.toFixed(0)} €`} />
          <Row label="Autom. Versand" value={value.autoSend ? "Aktiv" : "Aus"} />
        </>
      )}
    </div>
  );
}
