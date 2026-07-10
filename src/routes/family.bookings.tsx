import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ShieldCheck, Check } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/family/bookings")({
  head: () => ({ meta: [{ title: "Meine Buchungen · Pflegenah" }] }),
  component: Bookings,
});

function Bookings() {
  const { appointments, updateAppointment } = useStore();

  const confirm = (id: string) => {
    updateAppointment(id, { status: "confirmed", paymentStatus: "confirmed_by_family" });
    toast.success("Leistung bestätigt – Zahlung wird freigegeben.");
  };

  return (
    <AppLayout variant="family">
      <ScreenHeader title="Meine Buchungen" subtitle={`${appointments.length} Termine gesamt`} back="/family/dashboard" />
      {appointments.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center shadow-card">
          <CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sie haben noch keine Buchungen. Starten Sie eine neue Anfrage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="rounded-2xl bg-card p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold">{a.helperName}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(a.date).toLocaleDateString("de-DE")} · {a.startTime} · {a.durationHours} Std.
                  </div>
                  {a.address && <div className="mt-1 text-xs text-muted-foreground">{a.address}</div>}
                </div>
                <div className="text-right">
                  <div className="text-lg font-black">{a.totalAmount.toFixed(2)} €</div>
                  <div className="text-xs text-muted-foreground">+ {a.serviceFee.toFixed(2)} € Gebühr</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-bold text-[color:var(--mint)]">
                  <ShieldCheck className="h-3 w-3" /> {statusLabel(a.paymentStatus)}
                </span>
                <span className="rounded-full bg-sky-soft px-2.5 py-1 text-[11px] font-bold text-foreground/80">
                  {a.bookingType === "once" ? "Einmalig" : a.bookingType === "weekly" ? "Wöchentlich" : `Paket ${a.packageMonths} Mon.`}
                </span>
              </div>
              {a.paymentStatus === "completed_by_helper" && (
                <Button className="mt-3 w-full rounded-full" onClick={() => confirm(a.id)}>
                  <Check className="mr-1 h-4 w-4" /> Leistung bestätigen
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function statusLabel(s: string) {
  switch (s) {
    case "held_in_escrow": return "Im Treuhand";
    case "completed_by_helper": return "Wartet auf Bestätigung";
    case "confirmed_by_family": return "Bestätigt";
    case "released_to_helper": return "Freigegeben";
    default: return s;
  }
}
