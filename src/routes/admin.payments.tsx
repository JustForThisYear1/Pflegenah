import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, ShieldCheck, ArrowUpCircle, FileText } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { useStore } from "@/lib/store";
import { statusLabel, payoutStatusLabel } from "@/lib/invoice-utils";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Zahlungen · Admin · Pflegenah" }] }),
  component: AdminPayments,
});

function AdminPayments() {
  const { appointments, payouts, invoices } = useStore();
  const escrow = appointments.filter((a) => a.paymentStatus === "held_in_escrow").reduce((s, a) => s + a.totalAmount, 0);
  const released = appointments.filter((a) => a.paymentStatus === "released_to_helper" || a.paymentStatus === "confirmed_by_family").reduce((s, a) => s + a.totalAmount, 0);
  const paidOut = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const reimbursed = invoices.filter((i) => i.status === "reimbursed").reduce((s, i) => s + i.total, 0);

  return (
    <AppLayout variant="admin">
      <ScreenHeader title="Zahlungen & Rechnungen" subtitle="Escrow, Auszahlungen, Pflegekassen" back="/admin" />

      <div className="mb-4 rounded-2xl bg-peach-soft/70 p-3 text-[11px] font-semibold text-foreground/70">
        Prototyp – reine Übersicht ohne echte Zahlungsabwicklung.
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile icon={ShieldCheck} label="Im Treuhand" value={escrow} tone="peach" />
        <Tile icon={CreditCard} label="Freigegeben" value={released} tone="mint" />
        <Tile icon={ArrowUpCircle} label="Ausgezahlt" value={paidOut} tone="sky" />
        <Tile icon={FileText} label="Erstattet (Kassen)" value={reimbursed} tone="mint" />
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold">Auszahlungen</h3>
        {payouts.length === 0 ? <Empty text="Keine Auszahlungen." /> : (
          <div className="space-y-2">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
                <div>
                  <div className="text-sm font-bold">{p.amount.toFixed(2)} €</div>
                  <div className="text-xs text-muted-foreground">{p.reference} · {p.method.toUpperCase()} · {new Date(p.requestedAt).toLocaleDateString("de-DE")}</div>
                </div>
                <span className="rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-bold text-[color:var(--mint)]">{payoutStatusLabel(p.status)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold">Rechnungen an Pflegekassen</h3>
        {invoices.length === 0 ? <Empty text="Keine Rechnungen." /> : (
          <div className="space-y-2">
            {invoices.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
                <div>
                  <div className="text-sm font-bold">{i.number}</div>
                  <div className="text-xs text-muted-foreground">{i.insurerName} · {i.recipientName}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{i.total.toFixed(2)} €</div>
                  <div className="text-[11px] text-muted-foreground">{statusLabel(i.status)}</div>
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
  return <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">{text}</div>;
}

import type { LucideIcon } from "lucide-react";
function Tile({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: "peach"|"mint"|"sky" }) {
  const c = tone === "peach" ? "text-[color:var(--peach)]" : tone === "mint" ? "text-[color:var(--mint)]" : "text-[color:var(--sky)]";
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <Icon className={`mb-2 h-6 w-6 ${c}`} />
      <div className="text-2xl font-black">{value.toFixed(0)} €</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
