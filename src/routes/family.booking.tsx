import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, X, ShieldCheck, MapPin, Euro, Sparkles, Star, MessageCircle, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { scoreHelper, type Helper } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/family/booking")({
  head: () => ({ meta: [{ title: "Buchung · Pflegenah" }] }),
  component: BookingWizard,
});

const TOTAL_STEPS = 8;

function BookingWizard() {
  const navigate = useNavigate();
  const { helpers, familyProfile, ensureMatch, addAppointment, sendMessage, demoMode } = useStore();
  const [step, setStep] = useState(1);

  const [postal, setPostal] = useState(familyProfile?.postalCode ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [daypart, setDaypart] = useState<"vormittag" | "nachmittag" | "abend" | "nacht">("vormittag");
  const [time, setTime] = useState("10:00");
  const [precision, setPrecision] = useState<"genau" | "flexibel">("genau");
  const [type, setType] = useState<"once" | "weekly" | "package">("once");
  const [days, setDays] = useState<string[]>([]);
  const [months, setMonths] = useState(1);
  const [duration, setDuration] = useState(2);
  const [price, setPrice] = useState(22);
  const [address, setAddress] = useState({ street: "", nr: "", zip: "", city: "Essen", extra: "" });
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState("");
  const [agree, setAgree] = useState(false);
  const [payMethod, setPayMethod] = useState<"card" | "sepa" | "paypal">("card");

  const scored = useMemo(() => helpers
    .map((h) => ({ helper: h, ...scoreHelper(h, familyProfile) }))
    .sort((a, b) => b.score - a.score),
    [helpers, familyProfile]);

  const selectedHelpers = scored.filter(({ helper }) => selectedIds.includes(helper.id));

  const packageDiscount = { 1: 0, 2: 0.05, 3: 0.1, 6: 0.15 }[months] ?? 0;
  const base = duration * price * (type === "package" ? 4 * months : type === "weekly" ? 4 * (days.length || 1) : 1);
  const subtotal = base * (1 - packageDiscount);
  const fee = subtotal * 0.1;
  const grand = subtotal + fee;

  const validPostal = /^\d{5}$/.test(postal);

  const canNext = () => {
    if (demoMode) return true;
    switch (step) {
      case 1: return validPostal;
      case 2: return selectedIds.length > 0;
      case 3: return !!time;
      case 4: return type === "once" || type === "package" || (type === "weekly" && days.length > 0);
      case 5: return duration > 0;
      case 6: return price >= 15;
      case 7: return !!address.street && !!(address.zip || postal) && !!address.city;
      case 8: return agree;
      default: return true;
    }
  };

  const finish = () => {
    const clientName = familyProfile ? `${familyProfile.firstName} ${familyProfile.lastName}`.trim() : "Auftraggeber:in";
    selectedHelpers.forEach(({ helper }) => {
      const match = ensureMatch(helper.id);
      addAppointment({
        helperId: helper.id, helperName: helper.name,
        date: new Date().toISOString().slice(0, 10),
        startTime: time, durationHours: duration,
        bookingType: type, weeklyDays: days, packageMonths: months,
        pricePerHour: price, totalAmount: subtotal, serviceFee: fee,
        status: "upcoming", paymentStatus: "held_in_escrow", notes,
        address: `${address.street} ${address.nr}, ${address.zip} ${address.city}`,
        clientName,
        clientRole: "user",
        clientPhoto: familyProfile?.photo,
        clientPhone: familyProfile?.phone,
        careRecipientName: clientName,
        careLevel: familyProfile?.careLevel,
        supportNeeds: familyProfile?.supportNeeds,
        matchId: match.id,
      });
      sendMessage(match.id, `📅 Buchung eingegangen: ${time} · ${duration} Std. · ${type === "once" ? "einmalig" : type === "weekly" ? `wöchentlich (${days.join(",")})` : `Paket ${months} Mon.`}`);
    });
    toast.success("Auftrag gestartet – Geld wird treuhänderisch verwahrt.");
    navigate({ to: "/family/bookings" });
  };

  const toggleDay = (d: string) => setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <button onClick={() => (step > 1 ? setStep(step - 1) : navigate({ to: "/family/dashboard" }))}
              className="rounded-full p-2 hover:bg-muted" aria-label="Zurück">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-extrabold">Buchung erstellen</h1>
            <button onClick={() => navigate({ to: "/family/dashboard" })} className="rounded-full p-2 hover:bg-muted" aria-label="Schließen">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Schritt {step} von {TOTAL_STEPS}</p>
            <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
          </div>
        </header>

        <div className="flex-1 px-4 py-6 pb-32">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold">Sind wir in Ihrer Region vertreten?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Geben Sie Ihre 5-stellige PLZ ein.</p>
              </div>
              <div className="mx-auto max-w-xs">
                <div className="text-center text-4xl font-black tracking-widest">
                  {(postal + "_____").slice(0, 5).split("").map((c, i) => (
                    <span key={i} className={cn("mx-0.5 inline-block w-8 border-b-4 pb-1", i < postal.length ? "border-primary" : "border-border")}>
                      {i < postal.length ? c : ""}
                    </span>
                  ))}
                </div>
                <div className="mt-8 grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6,7,8,9].map((n) => (
                    <NumKey key={n} onClick={() => setPostal((p) => (p.length < 5 ? p + String(n) : p))}>{n}</NumKey>
                  ))}
                  <NumKey onClick={() => setPostal("")}>C</NumKey>
                  <NumKey onClick={() => setPostal((p) => (p.length < 5 ? p + "0" : p))}>0</NumKey>
                  <NumKey onClick={() => setPostal((p) => p.slice(0, -1))}><Delete className="mx-auto h-5 w-5" /></NumKey>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold">Helfer:innen auswählen</h2>
              <p className="text-sm text-muted-foreground">Sortiert nach KI-Kompatibilität (Matching-Score 1–10).</p>
              {scored.map(({ helper, score }) => (
                <HelperSelectRow
                  key={helper.id}
                  helper={helper} score={score}
                  selected={selectedIds.includes(helper.id)}
                  onToggle={() => setSelectedIds((prev) =>
                    prev.includes(helper.id) ? prev.filter((x) => x !== helper.id) : [...prev, helper.id])}
                  onChat={() => {
                    const m = ensureMatch(helper.id);
                    navigate({ to: "/family/messages/$id", params: { id: m.helperId } });
                  }}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold">Uhrzeit auswählen</h2>
                <p className="mt-1 text-sm text-muted-foreground">Tageszeit und 30-Minuten-Slot.</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(["vormittag", "nachmittag", "abend", "nacht"] as const).map((d) => (
                  <PillBig key={d} active={daypart === d} onClick={() => setDaypart(d)}>
                    {d[0].toUpperCase() + d.slice(1)}
                  </PillBig>
                ))}
              </div>
              <div>
                <div className="mb-2 text-xs font-bold text-muted-foreground">Zeitslot</div>
                <div className="grid grid-cols-4 gap-2">
                  {slotsFor(daypart).map((s) => (
                    <PillBig key={s} active={time === s} onClick={() => setTime(s)}>{s}</PillBig>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <PillBig active={precision === "genau"} onClick={() => setPrecision("genau")}>Genau</PillBig>
                <PillBig active={precision === "flexibel"} onClick={() => setPrecision("flexibel")}>Flexibel</PillBig>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">Buchungstyp</h2>
              <div className="grid grid-cols-3 gap-2">
                <PillBig active={type === "once"} onClick={() => setType("once")}>Einmalig</PillBig>
                <PillBig active={type === "weekly"} onClick={() => setType("weekly")}>Wöchentlich</PillBig>
                <PillBig active={type === "package"} onClick={() => setType("package")}>Paket</PillBig>
              </div>
              {type === "weekly" && (
                <div>
                  <div className="mb-2 text-xs font-bold text-muted-foreground">Wochentage</div>
                  <div className="flex flex-wrap gap-2">
                    {["Mo","Di","Mi","Do","Fr","Sa","So"].map((d) => (
                      <button key={d} onClick={() => toggleDay(d)}
                        className={cn("h-11 w-14 rounded-xl border-2 text-sm font-bold",
                          days.includes(d) ? "border-primary bg-primary/20" : "border-border bg-card text-muted-foreground")}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {type === "package" && (
                <div>
                  <div className="mb-2 text-xs font-bold text-muted-foreground">Paketdauer & Rabatt</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[{m:1,r:0},{m:2,r:5},{m:3,r:10},{m:6,r:15}].map(({m,r}) => (
                      <button key={m} onClick={() => setMonths(m)}
                        className={cn("h-16 rounded-xl border-2 text-xs font-bold",
                          months === m ? "border-primary bg-primary/20" : "border-border bg-card text-muted-foreground")}>
                        <div>{m} Mon.</div>
                        <div className="text-[10px] font-semibold text-[color:var(--success)]">-{r}%</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">Dauer</h2>
              <div className="grid grid-cols-4 gap-2">
                {[1,1.5,2,2.5,3,4,5,6,7,8].map((h) => (
                  <PillBig key={h} active={duration === h} onClick={() => setDuration(h)}>{h} h</PillBig>
                ))}
              </div>
              <PriceSummary label="Vorschau" total={subtotal} fee={fee} grand={grand} />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">Stundensatz</h2>
              <p className="text-sm text-muted-foreground">Empfohlener Bereich: 15–35 €/Std.</p>
              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="mb-3 text-center text-4xl font-black">{price} €<span className="text-sm font-semibold text-muted-foreground"> / Std.</span></div>
                <input type="range" min={15} max={35} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full accent-[color:var(--peach)]" />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>15 €</span><span>35 €</span></div>
                {price >= 20 && price <= 28 && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-mint-soft px-3 py-1 text-xs font-bold text-[color:var(--mint)]">
                    <Sparkles className="h-3.5 w-3.5" /> Empfohlener Preis
                  </div>
                )}
              </div>
              <PriceSummary label="Live-Vorschau" total={subtotal} fee={fee} grand={grand} />
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold">Adresse</h2>
              <div className="grid grid-cols-[1fr_100px] gap-2">
                <Input placeholder="Straße" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
                <Input placeholder="Nr." value={address.nr} onChange={(e) => setAddress({...address, nr: e.target.value})} />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <Input placeholder="PLZ" value={address.zip || postal} onChange={(e) => setAddress({...address, zip: e.target.value})} />
                <Input placeholder="Stadt" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
              </div>
              <Textarea rows={2} placeholder="Zusatzinfos (Eingang, Klingel, Stockwerk …)"
                value={address.extra} onChange={(e) => setAddress({...address, extra: e.target.value})} />
              <div className="flex h-40 items-center justify-center rounded-2xl bg-mint-soft text-sm text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5" /> Kartenansicht (folgt später)
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold">Übersicht & Zahlung</h2>
              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="mb-3 font-bold">Ausgewählte Helfer:innen</div>
                <div className="flex flex-wrap gap-2">
                  {selectedHelpers.map(({ helper }) => (
                    <div key={helper.id} className="flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-xs font-semibold">
                      <img src={helper.photo} alt="" className="h-6 w-6 rounded-full object-cover" /> {helper.name}
                    </div>
                  ))}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Uhrzeit</dt><dd className="text-right font-semibold">{time} ({precision})</dd>
                  <dt className="text-muted-foreground">Dauer</dt><dd className="text-right font-semibold">{duration} Std.</dd>
                  <dt className="text-muted-foreground">Typ</dt>
                  <dd className="text-right font-semibold">
                    {type === "once" ? "Einmalig" : type === "weekly" ? `Wöchentlich (${days.join(", ")})` : `Paket ${months} Monat(e)`}
                  </dd>
                  <dt className="text-muted-foreground">Stundensatz</dt><dd className="text-right font-semibold">{price} €</dd>
                </dl>
              </div>
              <PriceSummary label="Preis" total={subtotal} fee={fee} grand={grand} />

              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck className="h-4 w-4 text-[color:var(--mint)]" /> Zahlungsmethode
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["card", "sepa", "paypal"] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setPayMethod(m)}
                      className={cn("h-11 rounded-xl border-2 text-xs font-bold",
                        payMethod === m ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground")}>
                      {m === "card" ? "Karte" : m === "sepa" ? "SEPA" : "PayPal"}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Der Betrag wird von Pflegenah <b>treuhänderisch verwahrt</b> und erst nach deiner Bestätigung an die Betreuungskraft freigegeben.
                </p>
                <p className="mt-1 text-[10px] font-semibold text-foreground/60">Prototyp – keine echte Zahlung.</p>
              </div>

              <Textarea rows={2} placeholder="Kommentar für Helfer:in (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Input placeholder="Rabattcode (optional)" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              <label className="flex items-start gap-3 text-sm">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
                <span>Ich akzeptiere die AGB und Datenschutzbestimmungen und stimme der Treuhandzahlung zu.</span>
              </label>
            </div>
          )}
        </div>

        <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-[640px]">
            <Button
              size="lg" className="h-14 w-full rounded-full text-base font-bold"
              disabled={!canNext()}
              onClick={() => (step < TOTAL_STEPS ? setStep(step + 1) : finish())}
            >
              {step < TOTAL_STEPS ? "Weiter" : `Zahlungspflichtig buchen · ${grand.toFixed(2)} €`}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function slotsFor(dp: "vormittag" | "nachmittag" | "abend" | "nacht"): string[] {
  const ranges = { vormittag: [8, 12], nachmittag: [12, 17], abend: [17, 22], nacht: [22, 24] } as const;
  const [a, b] = ranges[dp];
  const out: string[] = [];
  for (let h = a; h < b; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
}

function NumKey({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="h-16 rounded-2xl bg-card text-xl font-bold shadow-card active:scale-95">
      {children}
    </button>
  );
}

function PillBig({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={cn("h-12 rounded-xl border-2 text-sm font-semibold transition",
        active ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted")}>
      {children}
    </button>
  );
}

function PriceSummary({ label, total, fee, grand }: { label: string; total: number; fee: number; grand: number }) {
  return (
    <div className="rounded-2xl bg-mint-soft p-4 text-sm">
      <div className="mb-1 text-xs font-bold text-muted-foreground">{label}</div>
      <div className="flex justify-between"><span>Zwischensumme</span><span className="font-bold">{total.toFixed(2)} €</span></div>
      <div className="flex justify-between"><span>Servicegebühr (10 %)</span><span className="font-bold">{fee.toFixed(2)} €</span></div>
      <div className="mt-1 flex justify-between border-t border-border pt-1 text-base"><span className="font-bold">Gesamt</span><span className="font-black">{grand.toFixed(2)} €</span></div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Sichere Treuhandzahlung – freigegeben nach Bestätigung
      </div>
    </div>
  );
}

function HelperSelectRow({
  helper, score, selected, onToggle, onChat,
}: { helper: Helper; score: number; selected: boolean; onToggle: () => void; onChat: () => void }) {
  const idx10 = Math.round(score / 10);
  return (
    <div className={cn("rounded-2xl bg-card p-3 shadow-card transition", selected && "ring-2 ring-primary")}>
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} onCheckedChange={onToggle} className="mt-1" />
        <img src={helper.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate font-bold">{helper.name}</div>
            {helper.verified && <ShieldCheck className="h-4 w-4 text-[color:var(--mint)]" />}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> Match {idx10}/10</span>
            <span className="inline-flex items-center gap-1"><Euro className="h-3 w-3" /> {helper.pricePerHour} €/Std</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {helper.distanceKm} km</span>
            <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {helper.rating}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Sprachen: {helper.languages.join(", ")}</div>
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onChat} className="rounded-full text-xs">
          <MessageCircle className="mr-1 h-3.5 w-3.5" /> Jetzt chatten
        </Button>
      </div>
    </div>
  );
}
