import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/verification")({
  head: () => ({ meta: [{ title: "Verifizierung · Pflegenah" }] }),
  component: Verification,
});

function Verification() {
  const { helpers, updateHelper } = useStore();
  const pending = helpers.filter((h) => h.verificationStatus === "pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = pending.find((h) => h.id === selectedId) ?? pending[0];
  const [checks, setChecks] = useState({ id: false, qual: false, cert: false });
  const [notes, setNotes] = useState("");

  const approve = () => {
    if (!selected) return;
    updateHelper(selected.id, { verificationStatus: "verified", verified: true, badges: [...(selected.badges || []), "Verifiziert"] });
    toast.success(`${selected.name} verifiziert`);
    setSelectedId(null);
    setChecks({ id: false, qual: false, cert: false });
  };
  const reject = () => {
    if (!selected) return;
    updateHelper(selected.id, { verificationStatus: "rejected" });
    toast.info(`${selected.name} abgelehnt`);
    setSelectedId(null);
  };

  return (
    <AppLayout variant="admin">
      <ScreenHeader title="Helfer-Verifizierung" subtitle={`${pending.length} ausstehend`} />

      {pending.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center shadow-card">
          <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-[color:var(--mint)]" />
          <p className="text-sm text-muted-foreground">Alle Profile sind bearbeitet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-2">
            {pending.map((h) => (
              <button key={h.id} onClick={() => setSelectedId(h.id)}
                className={`flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-card ${selected?.id === h.id ? "ring-2 ring-primary" : ""}`}>
                <img src={h.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="text-sm font-bold">{h.name}</div>
                  <div className="text-xs text-muted-foreground">{h.city} · {h.pricePerHour}€/Std</div>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="rounded-2xl bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <img src={selected.photo} alt="" className="h-14 w-14 rounded-full object-cover" />
                <div>
                  <div className="text-lg font-bold">{selected.name}</div>
                  <div className="text-xs text-muted-foreground">{selected.age} Jahre · {selected.city}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{selected.bio}</p>
              <div className="mt-3 text-xs">
                <b>Qualifikationen:</b> {selected.qualifications.join(", ")}<br />
                <b>Sprachen:</b> {selected.languages.join(", ")}
              </div>
              <div className="mt-4 space-y-2">
                <Row label="Ausweisdokument geprüft" checked={checks.id} onChange={(v) => setChecks({...checks, id: v})} />
                <Row label="Qualifikationen geprüft" checked={checks.qual} onChange={(v) => setChecks({...checks, qual: v})} />
                <Row label="Führungszeugnis vorhanden" checked={checks.cert} onChange={(v) => setChecks({...checks, cert: v})} />
              </div>
              <Textarea rows={2} className="mt-3" placeholder="Notizen …" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" className="rounded-full text-destructive" onClick={reject}>Ablehnen</Button>
                <Button className="rounded-full" disabled={!(checks.id && checks.qual)} onClick={approve}>
                  <ShieldCheck className="mr-1 h-4 w-4" /> Verifizieren
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={() => history.back()} className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> zurück
      </button>
    </AppLayout>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      {label}
    </label>
  );
}
