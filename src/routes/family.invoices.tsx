import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Send, CheckCircle2, Clock, AlertCircle, Eye } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { monthKey, monthLabel, statusLabel, type Invoice } from "@/lib/invoice-utils";
import { InvoicePreview } from "@/components/InvoicePreview";
import { toast } from "sonner";

export const Route = createFileRoute("/family/invoices")({
  head: () => ({ meta: [{ title: "Rechnungen · Pflegenah" }] }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const {
    appointments, invoices, careInsurance,
    generateInvoiceForMonth, sendInvoice, markReimbursed,
  } = useStore();
  const [preview, setPreview] = useState<Invoice | null>(null);

  const byMonth = useMemo(() => {
    const map = new Map<string, typeof appointments>();
    for (const a of appointments) {
      const eligible = a.status === "confirmed" || a.status === "completed"
        || a.paymentStatus === "confirmed_by_family" || a.paymentStatus === "released_to_helper";
      if (!eligible) continue;
      const k = monthKey(a.date);
      const list = map.get(k) ?? [];
      list.push(a);
      map.set(k, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [appointments]);

  const currentMonth = monthKey(new Date().toISOString());

  return (
    <AppLayout variant="family">
      <ScreenHeader title="Rechnungen & Erstattung" subtitle="Automatischer Versand an Ihre Pflegekasse" back="/family/dashboard" />

      <div className="mb-4 rounded-2xl bg-peach-soft/70 p-3 text-[11px] font-semibold text-foreground/70">
        Prototyp – Rechnungen werden generiert, aber nicht wirklich an Pflegekassen übertragen.
      </div>

      <div className="mb-6 rounded-3xl bg-card p-5 shadow-card">
        <div className="mb-1 text-sm font-bold">Ihre Pflegekasse</div>
        <div className="text-base font-black">{careInsurance.insurerName}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          Vers.-Nr.: {careInsurance.insuranceNumber || "—"} · {careInsurance.careLevel} · Budget {careInsurance.monthlyBudget.toFixed(0)} €/Monat
        </div>
        {!careInsurance.insuranceNumber && (
          <div className="mt-2 flex items-center gap-1 text-xs text-[color:var(--peach)]">
            <AlertCircle className="h-3.5 w-3.5" /> Bitte Versicherungsnummer in den Einstellungen ergänzen.
          </div>
        )}
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold">Aktueller Monat · {monthLabel(currentMonth)}</h3>
        {(() => {
          const items = byMonth.find(([m]) => m === currentMonth)?.[1] ?? [];
          const spent = items.reduce((s, a) => s + a.totalAmount, 0);
          const pct = Math.min(100, (spent / careInsurance.monthlyBudget) * 100);
          const invoice = invoices.find((i) => i.month === currentMonth);
          return (
            <div className="rounded-2xl bg-card p-5 shadow-card">
              <div className="mb-1 flex items-baseline justify-between">
                <div className="text-2xl font-black">{spent.toFixed(2)} €</div>
                <div className="text-xs text-muted-foreground">von {careInsurance.monthlyBudget.toFixed(0)} €</div>
              </div>
              <Progress value={pct} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">
                {items.length} bestätigte Termin(e) diesen Monat
              </div>

              {invoice ? (
                <InvoiceCardActions
                  invoice={invoice}
                  onPreview={() => setPreview(invoice)}
                  onSend={() => { sendInvoice(invoice.id); toast.success("Rechnung an Pflegekasse gesendet (Prototyp)."); }}
                  onReimburse={() => { markReimbursed(invoice.id); toast.success("Erstattung bestätigt."); }}
                />
              ) : items.length > 0 ? (
                <Button
                  className="mt-4 w-full rounded-full"
                  onClick={() => {
                    const inv = generateInvoiceForMonth(currentMonth);
                    if (inv) { setPreview(inv); toast.success("Rechnung erstellt."); }
                  }}
                >
                  <FileText className="mr-1 h-4 w-4" /> Rechnung jetzt erstellen
                </Button>
              ) : (
                <div className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                  Sobald Sie erledigte Termine bestätigen, können Sie hier eine Rechnung an die Pflegekasse erstellen.
                </div>
              )}
            </div>
          );
        })()}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold">Alle Rechnungen</h3>
        {invoices.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
            <FileText className="mx-auto mb-2 h-6 w-6" />
            Noch keine Rechnungen erstellt.
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="rounded-2xl bg-card p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold">{inv.number}</div>
                    <div className="text-xs text-muted-foreground">{monthLabel(inv.month)} · {inv.insurerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black">{inv.total.toFixed(2)} €</div>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setPreview(inv)}>
                    <Eye className="mr-1 h-3.5 w-3.5" /> Ansehen
                  </Button>
                  {inv.status === "ready" && (
                    <Button size="sm" className="rounded-full" onClick={() => { sendInvoice(inv.id); toast.success("Gesendet (Prototyp)."); }}>
                      <Send className="mr-1 h-3.5 w-3.5" /> Jetzt senden
                    </Button>
                  )}
                  {inv.status === "sent" && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => { markReimbursed(inv.id); toast.success("Erstattung markiert."); }}>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Erstattung eingegangen
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <InvoicePreview
        open={!!preview}
        onOpenChange={(v) => !v && setPreview(null)}
        invoice={preview}
        appointments={appointments}
      />
    </AppLayout>
  );
}

function InvoiceCardActions({
  invoice, onPreview, onSend, onReimburse,
}: {
  invoice: Invoice;
  onPreview: () => void;
  onSend: () => void;
  onReimburse: () => void;
}) {
  return (
    <div className="mt-4 rounded-xl bg-mint-soft p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-bold">{invoice.number}</div>
        <StatusBadge status={invoice.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="rounded-full" onClick={onPreview}>
          <Eye className="mr-1 h-3.5 w-3.5" /> Rechnung ansehen
        </Button>
        {invoice.status === "ready" && (
          <Button size="sm" className="rounded-full" onClick={onSend}>
            <Send className="mr-1 h-3.5 w-3.5" /> An {invoice.insurerName.split(" ")[0]} senden
          </Button>
        )}
        {invoice.status === "sent" && (
          <Button size="sm" variant="outline" className="rounded-full" onClick={onReimburse}>
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Erstattet markieren
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const map: Record<Invoice["status"], string> = {
    draft: "bg-muted text-foreground/70",
    ready: "bg-peach-soft text-[color:var(--peach)]",
    sent: "bg-sky-soft text-foreground/80",
    reimbursed: "bg-mint-soft text-[color:var(--mint)]",
  };
  const Icon = status === "reimbursed" ? CheckCircle2 : status === "sent" ? Send : status === "ready" ? Clock : FileText;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${map[status]}`}>
      <Icon className="h-3 w-3" /> {statusLabel(status)}
    </span>
  );
}
