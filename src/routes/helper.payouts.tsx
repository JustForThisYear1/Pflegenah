import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpCircle, Banknote, CheckCircle2, Clock, CreditCard, Wallet, Link2 } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { payoutStatusLabel, type PayoutMethod } from "@/lib/invoice-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/helper/payouts")({
  head: () => ({ meta: [{ title: "Auszahlungen · Pflegenah" }] }),
  component: PayoutsPage,
});

const SERVICE_FEE_PCT = 0.08;

function PayoutsPage() {
  const {
    appointments, payouts, payoutAccount, connectPayoutAccount, requestPayout, completePayout,
  } = useStore();

  const releasedAppointments = appointments.filter(
    (a) => a.paymentStatus === "released_to_helper" || a.paymentStatus === "confirmed_by_family",
  );
  const available = releasedAppointments.reduce((s, a) => s + a.totalAmount, 0)
    - payouts.reduce((s, p) => s + p.amount, 0);

  return (
    <AppLayout variant="helper">
      <ScreenHeader title="Auszahlungen" subtitle="Konto verbinden & Geld erhalten" back="/helper/dashboard" />

      <div className="mb-4 rounded-2xl bg-peach-soft/70 p-3 text-[11px] font-semibold text-foreground/70">
        Prototyp – keine echte Zahlung; Auszahlungen werden simuliert.
      </div>

      <PayoutAccountCard
        connected={payoutAccount.connected}
        method={payoutAccount.method}
        iban={payoutAccount.iban}
        email={payoutAccount.email}
        onConnect={(m, extras) => {
          connectPayoutAccount({ method: m, ...extras });
          toast.success("Auszahlungskonto verbunden.");
        }}
      />

      <div className="mb-6 rounded-3xl bg-card p-5 shadow-card">
        <div className="text-sm font-bold">Verfügbar</div>
        <div className="mt-1 text-3xl font-black text-[color:var(--success)]">{Math.max(0, available).toFixed(2)} €</div>
        <div className="text-xs text-muted-foreground">Freigegebene Zahlungen abzüglich bereits angeforderter Auszahlungen</div>

        <Button
          disabled={!payoutAccount.connected || available <= 0}
          className={cn("mt-4 h-12 w-full rounded-full font-bold", (!payoutAccount.connected || available <= 0) && "bg-muted text-muted-foreground")}
          onClick={() => {
            const p = requestPayout(available);
            if (p) toast.success(`Auszahlung ${p.amount.toFixed(2)} € beantragt (${p.reference}).`);
          }}
        >
          <ArrowUpCircle className="mr-2 h-4 w-4" />
          {payoutAccount.connected ? `Jetzt ${available.toFixed(2)} € auszahlen` : "Zuerst Konto verbinden"}
        </Button>
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold">Freigegebene Termine</h3>
        {releasedAppointments.length === 0 ? (
          <Empty text="Noch keine freigegebenen Zahlungen." />
        ) : (
          <div className="space-y-2">
            {releasedAppointments.map((a) => {
              const fee = a.totalAmount * SERVICE_FEE_PCT;
              const net = a.totalAmount - fee;
              return (
                <div key={a.id} className="rounded-2xl bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold">{new Date(a.date).toLocaleDateString("de-DE")} · {a.startTime}</div>
                      <div className="text-xs text-muted-foreground">{a.durationHours} Std. · {a.pricePerHour} €/Std.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{net.toFixed(2)} €</div>
                      <div className="text-[10px] text-muted-foreground">nach 8 % Servicegebühr</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold">Auszahlungshistorie</h3>
        {payouts.length === 0 ? (
          <Empty text="Noch keine Auszahlungen beantragt." />
        ) : (
          <div className="space-y-2">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
                <div>
                  <div className="text-sm font-bold">{p.amount.toFixed(2)} €</div>
                  <div className="text-xs text-muted-foreground">{p.reference} · {p.method.toUpperCase()} · {new Date(p.requestedAt).toLocaleDateString("de-DE")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-bold text-[color:var(--mint)]">
                    {p.status === "paid" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {payoutStatusLabel(p.status)}
                  </span>
                  {p.status !== "paid" && (
                    <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => { completePayout(p.id); toast.success("Als ausgezahlt markiert."); }}>Erhalten</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-card">{text}</div>;
}

function PayoutAccountCard({
  connected, method, iban, email, onConnect,
}: {
  connected: boolean;
  method: PayoutMethod;
  iban?: string;
  email?: string;
  onConnect: (m: PayoutMethod, extras: { iban?: string; email?: string }) => void;
}) {
  const [selected, setSelected] = useState<PayoutMethod>(method);
  const [ibanInput, setIbanInput] = useState(iban ?? "");
  const [emailInput, setEmailInput] = useState(email ?? "");

  if (connected) {
    return (
      <div className="mb-4 rounded-2xl bg-mint-soft p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[color:var(--mint)]">
          <CheckCircle2 className="h-4 w-4" /> Auszahlungskonto verbunden
        </div>
        <div className="mt-1 text-xs text-foreground/70">
          {method === "bank" && `Banküberweisung · ${iban || "IBAN gespeichert"}`}
          {method === "paypal" && `PayPal · ${email || "E-Mail gespeichert"}`}
          {method === "stripe" && "Stripe Connect · verbunden"}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl bg-card p-5 shadow-card">
      <div className="mb-1 text-sm font-bold">Auszahlungskonto verbinden</div>
      <div className="mb-3 text-xs text-muted-foreground">Wähle, wie du dein Geld erhalten möchtest.</div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <MethodPill icon={Banknote} label="Bank" active={selected === "bank"} onClick={() => setSelected("bank")} />
        <MethodPill icon={Wallet} label="PayPal" active={selected === "paypal"} onClick={() => setSelected("paypal")} />
        <MethodPill icon={CreditCard} label="Stripe" active={selected === "stripe"} onClick={() => setSelected("stripe")} />
      </div>
      {selected === "bank" && (
        <Input placeholder="IBAN (DE...)" value={ibanInput} onChange={(e) => setIbanInput(e.target.value)} />
      )}
      {selected === "paypal" && (
        <Input placeholder="PayPal-E-Mail" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
      )}
      <Button
        className="mt-3 w-full rounded-full"
        onClick={() => onConnect(selected, { iban: ibanInput || undefined, email: emailInput || undefined })}
      >
        <Link2 className="mr-1 h-4 w-4" /> Konto verbinden
      </Button>
    </div>
  );
}

function MethodPill({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-14 flex-col items-center justify-center rounded-xl border-2 text-xs font-bold",
        active ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground",
      )}
    >
      <Icon className="mb-0.5 h-4 w-4" /> {label}
    </button>
  );
}
