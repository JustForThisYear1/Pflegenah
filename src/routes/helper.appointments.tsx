import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, User } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import type { Appointment } from "@/lib/mock-data";

export const Route = createFileRoute("/helper/appointments")({
  head: () => ({ meta: [{ title: "Termine · Pflegenah" }] }),
  component: HelperAppointments,
});

function HelperAppointments() {
  const { appointments } = useStore();
  const upcoming = appointments.filter((a) => a.status === "upcoming");
  const done = appointments.filter((a) => a.status !== "upcoming");

  return (
    <AppLayout variant="helper">
      <ScreenHeader title="Aufträge & Termine" back="/helper/dashboard" />

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold">Offen</h3>
        {upcoming.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-2">
            {upcoming.map((a) => <AppointmentRow key={a.id} a={a} />)}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold">Abgeschlossen</h3>
        {done.length === 0 ? <Empty /> : (
          <div className="space-y-2">
            {done.map((a) => <AppointmentRow key={a.id} a={a} showEarnings />)}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function AppointmentRow({ a, showEarnings }: { a: Appointment; showEarnings?: boolean }) {
  const clientName = a.clientName ?? "Auftraggeber:in";
  const roleLabel = a.clientRole === "family" ? "Nahestehende Person" : "Hilfesuchende Person";
  return (
    <Link
      to="/helper/appointments/$id"
      params={{ id: a.id }}
      className="block rounded-2xl bg-card p-4 shadow-card transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start gap-3">
        {a.clientPhoto ? (
          <img src={a.clientPhoto} alt={clientName} className="h-11 w-11 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-bold">{clientName}</div>
              <Badge variant="secondary" className="mt-0.5 text-[10px]">{roleLabel}</Badge>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {new Date(a.date).toLocaleDateString("de-DE")} · {a.startTime} · {a.durationHours} Std.
          </div>
          {a.address && <div className="mt-0.5 truncate text-xs text-muted-foreground">{a.address}</div>}
          <div className="mt-2 text-right text-sm font-bold">
            {showEarnings ? (
              <span className="text-[color:var(--success)]">+{a.totalAmount.toFixed(2)} €</span>
            ) : (
              <span>{a.totalAmount.toFixed(2)} €</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
      <CalendarDays className="mx-auto mb-2 h-6 w-6" /> Nichts vorhanden.
    </div>
  );
}
